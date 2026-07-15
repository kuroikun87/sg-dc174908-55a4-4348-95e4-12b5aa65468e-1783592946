import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, CheckCircle2, Clock } from "lucide-react";

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
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("follower_consequences")
        .select("*")
        .eq("follower_id", user.id)
        .order("is_fulfilled", { ascending: true })
        .order("created_at", { ascending: false });

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

  if (isLoading) {
    return (
      <AppLayout title="Consecuencias" icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const pendingConsequences = consequences.filter((c) => !c.is_fulfilled);
  const fulfilledConsequences = consequences.filter((c) => c.is_fulfilled);

  return (
    <AppLayout title="Mis Consecuencias" icon={<AlertTriangle className="w-5 h-5" />}>
      <BookPage pageKey="mis-consecuencias">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Consecuencias</h1>
            <p className="font-body text-muted-foreground">
              {pendingConsequences.length} por cumplir
            </p>
          </div>

          {/* Consecuencias Pendientes */}
          {pendingConsequences.length > 0 && (
            <ParchmentCard title="Por Cumplir" icon={<Clock className="w-4 h-4" />}>
              <div className="space-y-3">
                {pendingConsequences.map((consequence) => (
                  <div
                    key={consequence.id}
                    className="p-4 bg-wine/10 rounded-sm border border-wine/30 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-base text-foreground mb-1">
                          {consequence.title}
                        </h3>
                        {consequence.description && (
                          <p className="font-body text-sm text-muted-foreground">
                            {consequence.description}
                          </p>
                        )}
                      </div>
                      {consequence.faith_points > 0 && (
                        <Badge variant="outline" className="bg-wine/20 text-wine border-wine/40">
                          {consequence.faith_points} PF para quitar
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ParchmentCard>
          )}

          {/* Consecuencias Cumplidas */}
          {fulfilledConsequences.length > 0 && (
            <ParchmentCard title="Cumplidas" icon={<CheckCircle2 className="w-4 h-4" />}>
              <div className="space-y-2">
                {fulfilledConsequences.map((consequence) => (
                  <div
                    key={consequence.id}
                    className="p-3 bg-background/50 rounded-sm border border-border/30 opacity-60 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-sm text-foreground line-through">
                          {consequence.title}
                        </h3>
                        {consequence.fulfilled_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Cumplida: {new Date(consequence.fulfilled_at).toLocaleDateString()}
                          </p>
                        )}
                        {consequence.deity_note && (
                          <div className="mt-2 p-2 bg-gold/10 rounded-sm border border-gold/20">
                            <p className="text-xs text-muted-foreground italic">
                              Nota: {consequence.deity_note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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