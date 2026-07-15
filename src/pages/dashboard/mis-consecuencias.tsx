import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, CheckCircle2, Clock, Sparkles } from "lucide-react";

interface Consequence {
  id: string;
  title: string;
  description: string | null;
  faith_points: number;
  is_fulfilled: boolean;
  fulfilled_at: string | null;
  deity_note: string | null;
}

export default function MisConsecuenciasPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [consequences, setConsequences] = useState<Consequence[]>([]);

  useEffect(() => {
    loadConsequences();
  }, [user]);

  const loadConsequences = async () => {
    if (!user || !profile?.cult_id) return;

    try {
      const { data, error } = await supabase
        .from("assigned_punishments")
        .select("*, punishments(*)")
        .eq("follower_id", user.id)
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      setConsequences(data || []);
    } catch (error) {
      console.error("Error loading consequences:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las consecuencias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const payToRemove = async (assignedPunishmentId: string, cost: number) => {
    if (!user || !profile?.cult_id) return;

    if ((profile.faith_points || 0) < cost) {
      toast({
        title: "Puntos insuficientes",
        description: `Necesitas ${cost} Puntos de Fe`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Marcar como removida
      const { error: updateError } = await supabase
        .from("assigned_punishments")
        .update({
          is_removed: true,
          removed_at: new Date().toISOString(),
        })
        .eq("id", assignedPunishmentId);

      if (updateError) throw updateError;

      // Restar puntos de fe
      const { error: pointsError } = await supabase
        .from("profiles")
        .update({
          faith_points: (profile.faith_points || 0) - cost,
        })
        .eq("id", user.id);

      if (pointsError) throw pointsError;

      // Registrar en el log
      await supabase.from("faith_points_log").insert({
        user_id: user.id,
        amount: -cost,
        reason: "Consecuencia eliminada",
      });

      toast({
        title: "Consecuencia eliminada",
        description: `Has pagado ${cost} Puntos de Fe`,
      });

      loadConsequences();
    } catch (error) {
      console.error("Error removing consequence:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la consecuencia",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Consecuencias" icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const activeConsequences = consequences.filter((c) => !c.is_removed);
  const completedConsequences = consequences.filter((c) => c.is_removed);

  return (
    <AppLayout title="Mis Consecuencias" icon={<AlertTriangle className="w-5 h-5" />}>
      <BookPage pageKey="mis-consecuencias">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Consecuencias</h1>
            <p className="font-body text-muted-foreground">
              {activeConsequences.length} por cumplir
            </p>
          </div>

          {/* Consecuencias Activas */}
          {activeConsequences.length > 0 && (
            <ParchmentCard title="Activas" icon={<AlertTriangle className="w-4 h-4" />}>
              <div className="space-y-3">
                {activeConsequences.map((ap) => {
                  const punishment = ap.punishments;
                  if (!punishment) return null;
                  
                  return (
                    <div
                      key={ap.id}
                      className="p-4 bg-background/50 rounded-sm border border-wine/30 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-heading text-base text-foreground mb-1">
                            {punishment.name}
                          </h3>
                          {punishment.description && (
                            <p className="font-body text-sm text-muted-foreground">
                              {punishment.description}
                            </p>
                          )}
                        </div>
                        {punishment.faith_points_cost > 0 && (
                          <Badge variant="outline" className="bg-wine/20 text-wine border-wine/40 shrink-0">
                            {punishment.faith_points_cost} PF
                          </Badge>
                        )}
                      </div>

                      {punishment.faith_points_cost > 0 && (
                        <RitualButton
                          variant="outline"
                          onClick={() => payToRemove(ap.id, punishment.faith_points_cost)}
                          className="w-full"
                          disabled={(profile?.faith_points || 0) < punishment.faith_points_cost}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {(profile?.faith_points || 0) >= punishment.faith_points_cost
                            ? "Pagar para Quitar"
                            : "Puntos Insuficientes"}
                        </RitualButton>
                      )}
                    </div>
                  );
                })}
              </div>
            </ParchmentCard>
          )}

          {/* Consecuencias Cumplidas */}
          {completedConsequences.length > 0 && (
            <ParchmentCard title="Cumplidas" icon={<CheckCircle className="w-4 h-4" />}>
              <div className="space-y-2">
                {completedConsequences.map((ap) => {
                  const punishment = ap.punishments;
                  if (!punishment) return null;
                  
                  return (
                    <div
                      key={ap.id}
                      className="p-3 bg-background/50 rounded-sm border border-border/30 opacity-60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-heading text-sm text-foreground line-through">
                            {punishment.name}
                          </h3>
                          {ap.removed_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Cumplida: {new Date(ap.removed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ParchmentCard>
          )}

          {consequences.length === 0 && (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground">
                No tienes consecuencias asignadas
              </p>
            </div>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}