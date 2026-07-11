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
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<{ needsEmailConfirmation: boolean }>;
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, role: UserRole, displayName: string): Promise<{ needsEmailConfirmation: boolean }> => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: role || "follower",
        },
      },
    });
    
    if (signUpError) {
      if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists") || signUpError.message.includes("User already registered")) {
        throw new Error("Este email ya está registrado. Usá 'Entrar al Culto' con tu contraseña original.");
      }
      throw signUpError;
    }

    if (!signUpData.user) {
      throw new Error("No se pudo crear la cuenta");
    }

    // Con confirmación de email DESACTIVADA, si el usuario es NUEVO debe tener sesión inmediata
    // Si NO hay sesión, el email ya existe (Supabase hace auto-login silencioso del existente)
    if (!signUpData.session) {
      throw new Error("Este email ya está registrado. Usá 'Entrar al Culto' con tu contraseña original.");
    }

    // Usuario NUEVO con sesión
    setSession(signUpData.session);
    setUser(signUpData.session.user);
    
    const { error: profileError } = await supabase.from("profiles").insert({
      id: signUpData.session.user.id,
      email,
      role: role || "follower",
      display_name: displayName,
    });

    if (profileError) {
      console.error("[signUp] Error al crear perfil:", profileError.message);
    }
    
    return { needsEmailConfirmation: false };
  };

  const completeOnboarding = async (data: OnboardingData) => {
    let currentUser = user;
    
    if (!currentUser) {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        currentUser = currentSession.user;
        setUser(currentUser);
        setSession(currentSession);
      }
    }
    
    if (!currentUser) {
      throw new Error("No hay usuario autenticado. Por favor inicia sesión nuevamente.");
    }

    // Verificar si el usuario ya es deidad principal de un culto
    const { data: existingCult } = await supabase
      .from("cults")
      .select("id, name")
      .eq("main_deity_id", currentUser.id)
      .maybeSingle();

    if (existingCult) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role: "deity",
          cult_id: existingCult.id,
          is_main_deity: true,
          display_name: data.displayName,
        })
        .eq("id", currentUser.id);
      
      if (updateError) {
        throw new Error(`Error al vincular perfil al culto existente: ${updateError.message}`);
      }
      
      await fetchProfile(currentUser.id);
      return;
    }

    if (data.cultName) {
      // Crear culto
      const { data: cult, error: cultError } = await supabase
        .from("cults")
        .insert({
          name: data.cultName,
          main_deity_id: currentUser.id,
        })
        .select()
        .single();

      if (cultError) {
        throw new Error(`Error al crear culto: ${cultError.message}`);
      }

      // Actualizar perfil como deidad principal
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role: "deity",
          cult_id: cult.id,
          is_main_deity: true,
          display_name: data.displayName,
        })
        .eq("id", currentUser.id);

      if (updateError) {
        throw new Error(`Error al actualizar perfil: ${updateError.message}`);
      }

      // Generar códigos de invitación estáticos permanentes para la deidad principal
      const generateStaticCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      const deityCode = generateStaticCode();
      const followerCode = generateStaticCode();

      const { error: codesError } = await supabase.from("invitation_codes").insert([
        {
          code: deityCode,
          code_type: "deity",
          creator_id: currentUser.id,
          cult_id: cult.id,
          is_active: true,
        },
        {
          code: followerCode,
          code_type: "follower",
          creator_id: currentUser.id,
          cult_id: cult.id,
          is_active: true,
        },
      ]);

      if (codesError) {
        console.error("[completeOnboarding] Error al crear códigos:", codesError.message);
      }
      
      await fetchProfile(currentUser.id);
      
    } else if (data.inviteCode) {
      // Buscar código activo (códigos estáticos nunca se desactivan)
      const { data: code, error: codeError } = await supabase
        .from("invitation_codes")
        .select("*, creator:creator_id(role, cult_id, is_main_deity)")
        .eq("code", data.inviteCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (codeError || !code) {
        throw new Error("Código inválido o inactivo");
      }

      // Solo la deidad principal puede invitar deidades secundarias
      if (code.code_type === "deity" && !code.creator.is_main_deity) {
        throw new Error("Solo la Deidad Principal puede invitar a otras deidades");
      }

      const isDeityCode = code.code_type === "deity";
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role: isDeityCode ? "deity" : "follower",
          cult_id: code.creator.cult_id,
          display_name: data.displayName,
        })
        .eq("id", currentUser.id);

      if (updateError) throw updateError;

      // Registrar en jerarquía: si es fiel, asignarlo a la deidad que invitó
      if (!isDeityCode) {
        await supabase.from("hierarchy").insert({
          deity_id: code.creator_id,
          follower_id: currentUser.id,
          cult_id: code.creator.cult_id,
        });
      }

      // NO desactivar el código — los códigos son estáticos y permanentes
        
      await fetchProfile(currentUser.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[signOut] Error:", error.message);
    }
    // Limpiar estado siempre, incluso si supabase falla
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