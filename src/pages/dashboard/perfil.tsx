import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Save, LogOut, Trash2, Loader2, Calendar, UserCircle, Crown } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    display_name: profile?.display_name || "",
    nickname: profile?.nickname || "",
    title: profile?.title || "",
    bio: profile?.bio || "",
    pronouns: profile?.pronouns || "",
    birth_date: profile?.birth_date || "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setNickname(profile.nickname || "");
      setBio(profile.bio || "");
      setPronouns(profile.pronouns || "");
      setBirthDate(profile.birth_date || "");
      
      // Sincronizar formData con profile
      setFormData({
        full_name: profile.full_name || "",
        display_name: profile.display_name || "",
        nickname: profile.nickname || "",
        title: profile.title || "",
        bio: profile.bio || "",
        pronouns: profile.pronouns || "",
        birth_date: profile.birth_date || "",
      });
    }
  }, [profile]);

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

  const updateProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
          display_name: formData.display_name || null,
          nickname: formData.nickname || null,
          title: formData.title || null,
          bio: formData.bio || null,
          pronouns: formData.pronouns || null,
          birth_date: formData.birth_date || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({ title: "Perfil actualizado" });
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
            <div className="space-y-4">
              {/* Nombre completo */}
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Tu nombre..."
                  className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-silver/50"
                />
              </div>

              {/* Apodo */}
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Apodo (opcional)
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="Cómo te llaman..."
                  className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-silver/50"
                />
              </div>

              {/* Título (solo deidades) */}
              {profile.role === "deity" && (
                <div>
                  <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Título (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Tu título..."
                    className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                               text-foreground font-body focus:outline-none focus:border-silver/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Como deidad, puedes establecer tu propio título
                  </p>
                </div>
              )}

              {/* Descripción */}
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Preséntate brevemente..."
                  rows={3}
                  className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-silver/50 resize-none"
                />
              </div>

              {/* Pronombres */}
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Pronombres (opcional)
                </label>
                <input
                  type="text"
                  value={formData.pronouns}
                  onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                  placeholder="Ej: Él/Ella/Elle"
                  className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-silver/50"
                />
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Fecha de nacimiento (opcional)
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-silver/50"
                />
              </div>

              {/* Botón guardar */}
              <RitualButton 
                variant="gold" 
                className="w-full"
                disabled={isSaving}
                onClick={updateProfile}
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
            </div>
          </ParchmentCard>

          {/* Información del rol */}
          <ParchmentCard title="Información del Culto" icon={<User className="w-4 h-4" />}>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-silver/30">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="bg-muted text-foreground text-2xl">
                    {profile.display_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <h2 className="font-heading text-2xl text-foreground">
                    {profile.display_name || profile.full_name || "Sin nombre"}
                  </h2>
                  {profile.title && (
                    <p className="font-heading text-sm text-silver">{profile.title}</p>
                  )}
                  {profile.role === "deity" && (
                    <Badge variant="outline" className="border-silver/40 bg-silver/10 text-silver">
                      <Crown className="w-3 h-3 mr-1" />
                      Deidad
                    </Badge>
                  )}
                  {profile.role === "follower" && (
                    <Badge variant="outline" className="border-border/40 bg-muted/10 text-muted-foreground">
                      Fiel
                    </Badge>
                  )}
                </div>
              </div>
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