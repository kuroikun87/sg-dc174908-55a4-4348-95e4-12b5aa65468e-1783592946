import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { RitualButton } from "@/components/ui/ritual-button";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { User, Crown, LogOut, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Perfil() {
  const { profile, user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveCult = async () => {
    if (!user) {
      toast({ title: "Error", description: "No hay sesión activa", variant: "destructive" });
      return;
    }
    setIsLeaving(true);
    
    try {
      // Paso 1: Borrar el culto si soy deidad principal
      const { data: myCult } = await supabase
        .from("cults")
        .select("id")
        .eq("main_deity_id", user.id)
        .maybeSingle();
      
      if (myCult?.id) {
        const { error: deleteCultError } = await supabase.from("cults").delete().eq("id", myCult.id);
        if (deleteCultError) {
          throw new Error(`Error al borrar culto: ${deleteCultError.message}`);
        }
      }
      
      // Paso 2: Actualizar perfil
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({ cult_id: null, role: null, is_main_deity: false, title: null })
        .eq("id", user.id)
        .select();
      
      if (updateError) {
        throw new Error(`Error al actualizar perfil: ${updateError.message}`);
      }
      
      if (!updatedProfile || updatedProfile.length === 0) {
        throw new Error("No se pudo actualizar el perfil");
      }
      
      // Paso 3: Cerrar sesión en Supabase
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw new Error(`Error al cerrar sesión: ${signOutError.message}`);
      }
      
      // Paso 4: Limpiar estado local y navegar
      toast({
        title: "Has abandonado el culto",
        description: "Tu sesión ha sido cerrada.",
      });
      
      await router.push("/");
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error al abandonar",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
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
                  ¿Estás seguro? Perderás el acceso a este culto y deberás crear uno nuevo o usar un código de invitación.
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
        </div>
      </div>
    </AppLayout>
  );
}