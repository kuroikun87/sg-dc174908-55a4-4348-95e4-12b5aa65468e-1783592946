import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Gift, Loader2, ShoppingBag, Sparkles, Check } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  faith_points: number;
  is_used: boolean;
  used_at: string | null;
}

interface RewardTemplate {
  id: string;
  title: string;
  description: string | null;
  faith_points: number;
}

export default function MisPremiosPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [myRewards, setMyRewards] = useState<Reward[]>([]);
  const [availableRewards, setAvailableRewards] = useState<RewardTemplate[]>([]);
  const [showShop, setShowShop] = useState(false);
  const [myFaithPoints, setMyFaithPoints] = useState(0);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user || !profile?.cult_id) return;

    try {
      // Cargar mis premios
      const { data: rewardsData, error: rewardsError } = await supabase
        .from("follower_rewards")
        .select("*")
        .eq("follower_id", user.id)
        .order("is_used", { ascending: true })
        .order("created_at", { ascending: false });

      if (rewardsError) throw rewardsError;
      setMyRewards(rewardsData || []);

      // Cargar templates de premios disponibles en la tienda
      const { data: templatesData, error: templatesError } = await supabase
        .from("rewards")
        .select("*")
        .eq("cult_id", profile.cult_id)
        .order("faith_points", { ascending: true });

      if (templatesError) throw templatesError;
      setAvailableRewards(templatesData || []);

      // Cargar puntos de fe
      const { data: pointsData, error: pointsError } = await supabase
        .from("profiles")
        .select("faith_points")
        .eq("id", user.id)
        .single();

      if (pointsError) throw pointsError;
      setMyFaithPoints(pointsData?.faith_points || 0);
    } catch (error) {
      console.error("Error loading rewards:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los premios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllRewards = async () => {
    if (!profile?.cult_id) return;

    try {
      // Cargar TODOS los premios del culto para la tienda
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("cult_id", profile.cult_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAvailableRewards(data || []);
    } catch (error) {
      console.error("Error loading all rewards:", error);
    }
  };

  const buyReward = async (rewardId: string, cost: number) => {
    if (!user || !profile?.cult_id) return;

    if (myFaithPoints < cost) {
      toast({
        title: "Puntos insuficientes",
        description: `Necesitas ${cost} Puntos de Fe`,
        variant: "destructive",
      });
      return;
    }

    try {
      const reward = availableRewards.find((r) => r.id === rewardId);
      if (!reward) return;

      // Crear premio en follower_rewards
      const { error: insertError } = await supabase.from("follower_rewards").insert({
        follower_id: user.id,
        cult_id: profile.cult_id,
        title: reward.title,
        description: reward.description,
        faith_points: reward.faith_points,
        is_used: false,
      });

      if (insertError) throw insertError;

      // Restar puntos de fe
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ faith_points: myFaithPoints - cost })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Premio comprado",
        description: `Has adquirido "${reward.title}"`,
      });

      loadData();
    } catch (error) {
      console.error("Error buying reward:", error);
      toast({
        title: "Error",
        description: "No se pudo comprar el premio",
        variant: "destructive",
      });
    }
  };

  const handleUseReward = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from("follower_rewards")
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq("id", rewardId);

      if (error) throw error;

      toast({ title: "Premio utilizado" });
      loadData();
    } catch (error) {
      console.error("Error using reward:", error);
      toast({
        title: "Error",
        description: "No se pudo marcar como utilizado",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Mis Premios" icon={<Gift className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const availableRewardsList = myRewards.filter((r) => !r.is_used);
  const usedRewardsList = myRewards.filter((r) => r.is_used);

  return (
    <AppLayout title="Mis Premios" icon={<Gift className="w-5 h-5" />}>
      <BookPage pageKey="mis-premios">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Mis Premios</h1>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {myFaithPoints} Puntos de Fe
              </Badge>
            </div>
          </div>

          <RitualButton
            variant="gold"
            onClick={() => setShowShop(true)}
            className="w-full"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Abrir Tienda de Premios
          </RitualButton>

          {/* Premios Disponibles */}
          {availableRewardsList.length > 0 && (
            <ParchmentCard title="Disponibles" icon={<Gift className="w-4 h-4" />}>
              <div className="space-y-3">
                {availableRewardsList.map((reward) => (
                  <div
                    key={reward.id}
                    className="p-4 bg-background/50 rounded-sm border border-border/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-base text-foreground mb-1">
                          {reward.title}
                        </h3>
                        {reward.description && (
                          <p className="font-body text-sm text-muted-foreground">
                            {reward.description}
                          </p>
                        )}
                      </div>
                      {reward.faith_points > 0 && (
                        <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                          {reward.faith_points} PF
                        </Badge>
                      )}
                    </div>

                    <RitualButton
                      variant="outline"
                      onClick={() => handleUseReward(reward.id)}
                      className="w-full"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar como Utilizado
                    </RitualButton>
                  </div>
                ))}
              </div>
            </ParchmentCard>
          )}

          {/* Premios Utilizados */}
          {usedRewardsList.length > 0 && (
            <ParchmentCard title="Utilizados" icon={<Check className="w-4 h-4" />}>
              <div className="space-y-2">
                {usedRewardsList.map((reward) => (
                  <div
                    key={reward.id}
                    className="p-3 bg-background/50 rounded-sm border border-border/30 opacity-60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-sm text-foreground line-through">
                          {reward.title}
                        </h3>
                        {reward.used_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Utilizado: {new Date(reward.used_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {reward.faith_points > 0 && (
                        <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                          {reward.faith_points} PF
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ParchmentCard>
          )}

          {myRewards.length === 0 && (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground">
                No tienes premios. Visita la tienda para comprar con Puntos de Fe.
              </p>
            </div>
          )}
        </div>
      </BookPage>

      {/* Tienda de Premios */}
      <Dialog open={showShop} onOpenChange={setShowShop}>
        <DialogContent className="bg-card border-2 border-gold/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">
              Tienda de Premios
            </DialogTitle>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {myFaithPoints} Puntos de Fe disponibles
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-3">
            {availableRewards.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground text-center py-8">
                No hay premios disponibles en la tienda
              </p>
            ) : (
              availableRewards.map((reward) => {
                const canAfford = myFaithPoints >= reward.faith_points;
                return (
                  <div
                    key={reward.id}
                    className={`
                      p-4 rounded-sm border space-y-3
                      ${
                        canAfford
                          ? "bg-background/50 border-border/30"
                          : "bg-background/30 border-border/20 opacity-50"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-base text-foreground mb-1">
                          {reward.title}
                        </h3>
                        {reward.description && (
                          <p className="font-body text-sm text-muted-foreground">
                            {reward.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`
                          ${
                            canAfford
                              ? "bg-gold/10 text-gold border-gold/30"
                              : "bg-muted/10 text-muted-foreground border-muted/30"
                          }
                        `}
                      >
                        {reward.faith_points} PF
                      </Badge>
                    </div>

                    <RitualButton
                      variant={canAfford ? "gold" : "outline"}
                      onClick={() => buyReward(reward.id, reward.faith_points)}
                      disabled={!canAfford}
                      className="w-full"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {canAfford ? "Comprar" : "Puntos insuficientes"}
                    </RitualButton>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowShop(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cerrar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}