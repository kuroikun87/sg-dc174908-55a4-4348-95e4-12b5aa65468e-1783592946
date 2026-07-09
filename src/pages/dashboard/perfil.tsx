import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { RitualButton } from "@/components/ui/ritual-button";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { User, Crown, LogOut, AlertTriangle, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Perfil() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLeaveCult = async () => {
    if (!user) {
      toast({ title: "Error", description: "No hay sesión activa", variant: "destructive" });
      return;
    }
    setIsLeaving(true);
    
    try {
      const { data: updatedRows, error } = await supabase
        .from("profiles")
        .update({ cult_id: null, role: null, is_main_deity: false, title: null })
        .eq("id", user.id)
        .select();
      
      if (error) {
        throw new Error(`Error al actualizar perfil: ${error.message}`);
      }
      
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error("No se pudo actualizar el perfil.");
      }
      
      toast({
        title: "Has abandonado el culto",
        description: "Tu sesión será cerrada.",
      });
      
      await supabase.auth.signOut();
      window.localStorage.clear();
      window.location.href = "/";
      
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
    if (!user) {
      toast({ title: "Error", description: "No hay sesión activa", variant: "destructive" });
      return;
    }
    setIsDeleting(true);
    
    try {
      // 1. Borrar culto si es deidad principal
      const { data: myCult } = await supabase
        .from("cults")
        .select("id")
        .eq("main_deity_id", user.id)
        .maybeSingle();
      
      if (myCult?.id) {
        await supabase.from("cults").delete().eq("id", myCult.id);
      }
      
      // 2. Borrar perfil
      const { error: deleteProfileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);
      
      if (deleteProfileError) {
        throw new Error(`Error al borrar perfil: ${deleteProfileError.message}`);
      }
      
      toast({
        title: "Cuenta eliminada",
        description: "Todos tus datos han sido borrados.",
      });
      
      // 3. Cerrar sesión
      await supabase.auth.signOut();
      window.localStorage.clear();
      window.location.href = "/";
      
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

  return (
    <AppLayout title="Mi Perfil" icon={<User className="w-5 h-5" />}>
      <div className="space-y-6">
        <ParchmentCard title="Datos del Culto" icon={<Crown className="w-5 h-5" />}>
          <div className="space-y-2">
            <p className="font-body text-foreground">
              <span className="text-muted-foreground">Nombre:</span> {profile?.display_name || "Sin nombre"}
            </p>
            <p className="font-body text-foreground">
              <span className="text-muted-foreground">Rol:</span> {profile?.role === "deity" ? "Deidad" : "Fiel"}
            </p>
            <p className="font-body text-foreground">
              <span className="text-muted-foreground">Título:</span> {profile?.title || "Sin título"}
            </p>
          </div>
        </ParchmentCard>

        <div className="border-t border-border/50 pt-6 space-y-4">
          <h3 className="font-heading text-sm text-muted-foreground tracking-wider uppercase">
            Zona de Peligro
          </h3>

          {!showLeaveConfirm ? (
            <RitualButton
              variant="outline"
              className="w-full border-wine/50 text-wine hover:bg-wine/10"
              onClick={() => setShowLeaveConfirm(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Abandonar Culto
            </RitualButton>
          ) : (
            <div className="p-4 bg-wine/10 border border-wine/30 rounded-sm space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-wine flex-shrink-0" />
                <p className="font-body text-sm text-foreground">
                  ¿Abandonar el culto? Podrás crear uno nuevo o unirte con un código.
                </p>
              </div>
              <div className="flex gap-2">
                <RitualButton
                  variant="wine"
                  className="flex-1"
                  onClick={handleLeaveCult}
                  disabled={isLeaving}
                >
                  {isLeaving ? "Saliendo..." : "Sí, abandonar"}
                </RitualButton>
                <RitualButton
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowLeaveConfirm(false)}
                  disabled={isLeaving}
                >
                  Cancelar
                </RitualButton>
              </div>
            </div>
          )}

          {!showDeleteConfirm ? (
            <RitualButton
              variant="outline"
              className="w-full border-wine/50 text-wine hover:bg-wine/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Borrar cuenta completamente
            </RitualButton>
          ) : (
            <div className="p-4 bg-wine/10 border border-wine/30 rounded-sm space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-wine flex-shrink-0" />
                <p className="font-body text-sm text-foreground">
                  ¿Eliminar tu cuenta PERMANENTEMENTE? Se borrarán todos tus datos, incluyendo el culto si eres deidad principal. Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-2">
                <RitualButton
                  variant="wine"
                  className="flex-1"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Borrando..." : "Sí, eliminar todo"}
                </RitualButton>
                <RitualButton
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </RitualButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}