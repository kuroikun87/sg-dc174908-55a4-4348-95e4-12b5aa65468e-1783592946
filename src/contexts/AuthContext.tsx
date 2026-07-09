import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, type UserRole, type UserProfile } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export type { UserProfile, UserRole };

export interface InvitationCode {
  id: string;
  code: string;
  code_type: "deity" | "follower";
  creator_id: string;
  cult_id: string;
  is_active: boolean;
  used_by: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
}

interface OnboardingData {
  cultName?: string;
  inviteCode?: string;
  displayName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const needsOnboarding = !!user && !profile?.cult_id;

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[fetchProfile] Error:", error.message, error.code);
    } else if (data) {
      setProfile(data as UserProfile);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("[signIn] Intentando login con:", email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[signIn] Error:", error.message, error.status);
      throw error;
    }
    console.log("[signIn] Login exitoso");
  };

  const signUp = async (email: string, password: string, role: UserRole, displayName: string) => {
    console.log("[signUp] Registrando:", email, "rol:", role, "nombre:", displayName);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: role || "follower",
        },
      },
    });
    
    if (error) {
      console.error("[signUp] Error de auth:", error.message, error.status);
      throw error;
    }
    
    console.log("[signUp] Usuario creado en auth:", data.user?.id);

    // El perfil se crea automáticamente via trigger, pero hacemos fallback manual
    if (data.user) {
      console.log("[signUp] Intentando upsert de perfil manual para:", data.user.id);
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        role: role || "follower",
        display_name: displayName,
      }, { onConflict: "id" });

      if (profileError) {
        console.error("[signUp] Error al crear perfil:", profileError.message, profileError.code, profileError.details);
      } else {
        console.log("[signUp] Perfil creado/actualizado exitosamente");
      }
    }
  };

  const completeOnboarding = async (data: OnboardingData) => {
    if (!user) throw new Error("No hay usuario autenticado");
    
    console.log("[completeOnboarding] Iniciando. User:", user.id, "Data:", data);

    if (data.cultName) {
      console.log("[completeOnboarding] Creando culto:", data.cultName);
      
      const { data: cult, error: cultError } = await supabase
        .from("cults")
        .insert({
          name: data.cultName,
          main_deity_id: user.id,
        })
        .select()
        .single();

      if (cultError) {
        console.error("[completeOnboarding] Error al crear culto:", cultError.message, cultError.code, cultError.details);
        throw new Error(`Error al crear culto: ${cultError.message}`);
      }
      
      console.log("[completeOnboarding] Culto creado:", cult.id);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role: "deity",
          cult_id: cult.id,
          is_main_deity: true,
          display_name: data.displayName,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("[completeOnboarding] Error al actualizar perfil:", updateError.message, updateError.code);
        throw new Error(`Error al actualizar perfil: ${updateError.message}`);
      }
      
      console.log("[completeOnboarding] Perfil actualizado como deidad principal");
      
    } else if (data.inviteCode) {
      console.log("[completeOnboarding] Buscando código:", data.inviteCode);
      
      const { data: code, error: codeError } = await supabase
        .from("invitation_codes")
        .select("*, creator:creator_id(role, cult_id)")
        .eq("code", data.inviteCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (codeError || !code) {
        console.error("[completeOnboarding] Código inválido:", codeError?.message);
        throw new Error("Código inválido o expirado");
      }

      const isDeityCode = code.code_type === "deity";
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role: isDeityCode ? "deity" : "follower",
          cult_id: code.creator.cult_id,
          display_name: data.displayName,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("[completeOnboarding] Error al actualizar perfil:", updateError.message);
        throw updateError;
      }

      if (!isDeityCode) {
        await supabase.from("hierarchy").insert({
          deity_id: code.creator_id,
          follower_id: user.id,
          cult_id: code.creator.cult_id,
        });
      }

      await supabase
        .from("invitation_codes")
        .update({ is_active: false, used_by: user.id })
        .eq("id", code.id);
    }

    await fetchProfile(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: profile?.role ?? null,
        isLoading,
        needsOnboarding,
        signIn,
        signUp,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}