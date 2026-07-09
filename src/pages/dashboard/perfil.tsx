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
    
    const { error } = await supabase
      .from("profiles")
      .update({ cult_id: null, role: null, is_main_deity: false })
      .eq("id", user.id);
    
    if (error) {
      toast({
        title: "Error al abandonar",
        description: error.message,
        variant: "destructive",
      });
      setIsLeaving(false);
      return;
    }
    
    // Éxito: cerrar sesión y redirigir
    toast({
      title: "Has abandonado el culto",
      description: "Tu sesión ha sido cerrada.",
    });
    
    await signOut();
    router.push("/");
    setIsLeaving(false);
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