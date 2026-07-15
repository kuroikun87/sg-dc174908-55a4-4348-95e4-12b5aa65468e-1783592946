import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Save, LogOut, Trash2, Loader2, Calendar, UserCircle } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";

export default function PerfilPage() {
  const { profile, user, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Campos editables del perfil
  const [displayName, setDisplayName] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setNickname(profile.nickname || "");
      setBio(profile.bio || "");
      setPronouns(profile.pronouns || "");
      setBirthDate(profile.birth_date || "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        nickname: nickname || null,
        bio: bio || null,
        pronouns: pronouns || null,
        birth_date: birthDate || null,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron guardar los cambios: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido guardados correctamente.",
      });
    }

    setIsSaving(false);
  };

  const handleLeaveCult = async () => {
    if (!user) {
      toast({ title: "Error", description: "No hay sesión activa", variant: "destructive" });
      return;
    }
    setIsLeaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ cult_id: null, role: null, is_main_deity: false, title: null })
        .eq("id", user.id);
      
      if (error) {
        throw new Error(`Error al actualizar perfil: ${error.message}`);
      }
      
      toast({
        title: "Has abandonado el culto",
        description: "Tu sesión será cerrada.",
      });
      
      window.localStorage.clear();
      window.sessionStorage.clear();
      await supabase.auth.signOut();
      
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error al abandonar",
        description: msg,
        variant: "destructive",
      });
      setIsLeaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = confirm(
      "⚠️ ADVERTENCIA: Esta acción es permanente e irreversible.\n\n" +
      "Se eliminarán:\n" +
      "• Tu cuenta y perfil\n" +
      "• Todas tus tareas y eventos\n" +
      "• Tus notas personales\n" +
      "• Tus ratings de fetiches\n\n" +
      "¿Estás absolutamente seguro de que deseas continuar?"
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      // Primero eliminar el perfil (CASCADE eliminará los datos relacionados)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) {
        throw new Error(`Error al eliminar perfil: ${profileError.message}`);
      }

      // Luego eliminar el usuario de auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

      if (authError) {
        throw new Error(`Error al eliminar cuenta: ${authError.message}`);
      }

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido borrada permanentemente.",
      });

      window.localStorage.clear();
      window.sessionStorage.clear();
      
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error al eliminar",
        description: msg,
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  if (!profile) {
    return (
      <AppLayout title="Perfil" icon={<User className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const isDeity = profile.role === "deity";

  return (
    <AppLayout title="Perfil" icon={<User className="w-5 h-5" />}>
      <BookPage pageKey="perfil">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Mi Perfil</h1>
            <p className="font-body text-muted-foreground">
              {isDeity ? "Información de la deidad" : "Información personal"}
            </p>
          </div>

          {/* Información del perfil */}
          <ParchmentCard title="Datos Personales" icon={<UserCircle className="w-4 h-4" />}>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Nombre completo */}
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Nombre
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre..."
                  className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Apodo */}
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Apodo (opcional)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Cómo te llaman..."
                  className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Descripción (opcional)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Preséntate brevemente..."
                  rows={3}
                  className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                />
              </div>

              {/* Pronombres */}
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Pronombres (opcional)
                </label>
                <input
                  type="text"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  placeholder="Ej: Él/Ella/Elle"
                  className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Fecha de nacimiento (opcional)
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Botón guardar */}
              <RitualButton 
                type="submit" 
                variant="gold" 
                className="w-full"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </RitualButton>
            </form>
          </ParchmentCard>

          {/* Información del rol */}
          <ParchmentCard title="Información del Culto" icon={<User className="w-4 h-4" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="font-heading text-xs text-muted-foreground uppercase tracking-wider">Rol</span>
                <span className="font-body text-sm text-foreground">
                  {isDeity ? (
                    profile.is_main_deity ? "Deidad Principal" : "Deidad"
                  ) : (
                    "Fiel"
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="font-heading text-xs text-muted-foreground uppercase tracking-wider">Email</span>
                <span className="font-body text-sm text-foreground">{user?.email}</span>
              </div>

              {profile.title && (
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="font-heading text-xs text-muted-foreground uppercase tracking-wider">Título</span>
                  <span className="font-body text-sm text-gold">{profile.title}</span>
                </div>
              )}
            </div>
          </ParchmentCard>

          {/* Acciones peligrosas */}
          <ParchmentCard title="Acciones" icon={<LogOut className="w-4 h-4" />}>
            <div className="space-y-3">
              <RitualButton
                variant="outline"
                onClick={handleLeaveCult}
                disabled={isLeaving}
                className="w-full text-wine hover:bg-wine/10"
              >
                {isLeaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Abandonando...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Abandonar Culto
                  </>
                )}
              </RitualButton>

              <RitualButton
                variant="outline"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full text-red-500 hover:bg-red-500/10"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Borrar Cuenta Completamente
                  </>
                )}
              </RitualButton>
            </div>
          </ParchmentCard>
        </div>
      </BookPage>
    </AppLayout>
  );
}