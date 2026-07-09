import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, type UserRole, type UserProfile } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch {
        // Supabase no configurado — modo desarrollo visual
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    try {
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
    } catch {
      // Supabase no configurado
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      }
    } catch {
      // Error silencioso en modo desarrollo
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e) {
      throw new Error("Supabase no está configurado. Agrega las variables de entorno en la configuración de Softgen.");
    }
  };

  const signUp = async (email: string, password: string, role: UserRole, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email,
          role,
          display_name: displayName,
        });
      }
    } catch (e) {
      throw new Error("Supabase no está configurado. Agrega las variables de entorno en la configuración de Softgen.");
    }
  };

  const completeOnboarding = async (data: OnboardingData) => {
    if (!user) throw new Error("No hay usuario autenticado");

    try {
      if (data.cultName) {
        // Crear culto nuevo
        const { data: cult, error: cultError } = await supabase
          .from("cults")
          .insert({
            name: data.cultName,
            main_deity_id: user.id,
          })
          .select()
          .single();

        if (cultError) throw cultError;

        // Actualizar perfil como deidad principal
        await supabase
          .from("profiles")
          .update({
            role: "deity",
            cult_id: cult.id,
            is_main_deity: true,
            display_name: data.displayName,
          })
          .eq("id", user.id);
      } else if (data.inviteCode) {
        // Unirse con código
        const { data: code, error: codeError } = await supabase
          .from("invitation_codes")
          .select("*, profiles!creator_id(role, cult_id)")
          .eq("code", data.inviteCode)
          .eq("is_active", true)
          .single();

        if (codeError || !code) throw new Error("Código inválido o expirado");

        const isDeityCode = code.code_type === "deity";
        
        await supabase
          .from("profiles")
          .update({
            role: isDeityCode ? "deity" : "follower",
            cult_id: code.profiles.cult_id,
            display_name: data.displayName,
          })
          .eq("id", user.id);

        if (!isDeityCode) {
          // Crear jerarquía: fiel bajo la deidad del código
          await supabase.from("hierarchy").insert({
            deity_id: code.creator_id,
            follower_id: user.id,
            cult_id: code.profiles.cult_id,
          });
        }

        // Desactivar código de un solo uso
        await supabase
          .from("invitation_codes")
          .update({ is_active: false, used_by: user.id })
          .eq("id", code.id);
      }

      await fetchProfile(user.id);
    } catch (e) {
      throw new Error("Error en el ritual de incorporación: " + (e instanceof Error ? e.message : "desconocido"));
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Silencioso
    }
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