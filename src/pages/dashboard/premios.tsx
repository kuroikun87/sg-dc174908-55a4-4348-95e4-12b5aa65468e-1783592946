import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import {
  Gift,
  Plus,
  X,
  Star,
  Sparkles,
  Loader2,
  ShoppingCart,
  Crown,
  Users,
  Tag,
  AlertTriangle,
} from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  faith_points_cost: number;
  favor_points_required: number;
  is_exclusive: boolean;
  exclusive_to: string | null;
  tags: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
}

interface AwardedReward {
  id: string;
  reward_id: string;
  follower_id: string;
  awarded_by: string;
  awarded_at: string;
  notes: string | null;
  is_redeemed: boolean;
  redeemed_at: string | null;
  rewards: Reward;
}

export default function PremiosPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myRewards, setMyRewards] = useState<AwardedReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCost, setNewCost] = useState(0);
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    if (profile?.role === "deity") {
      await loadRewards();
    } else {
      await loadMyRewards();
    }

    setIsLoading(false);
  };

  const loadRewards = async () => {
    if (!profile?.cult_id) return;

    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("cult_id", profile.cult_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar los premios: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setRewards(data || []);
    }
  };

  const loadMyRewards = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("awarded_rewards")
      .select("*, rewards(*)")
      .eq("follower_id", user.id)
      .order("awarded_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar tus premios: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setMyRewards(data || []);
    }
  };

  const createReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !user || !profile?.cult_id) return;

    setIsSaving(true);

    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { error } = await supabase.from("rewards").insert({
      cult_id: profile.cult_id,
      created_by: user.id,
      name: newName,
      description: newDescription || null,
      faith_points_cost: newCost,
      tags: tags,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear el premio: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Premio creado",
        description: `${newName} ha sido inscrito.`,
      });
      setNewName("");
      setNewDescription("");
      setNewCost(0);
      setNewTags("");
      setShowCreateForm(false);
      loadRewards();
    }

    setIsSaving(false);
  };

  const purchaseReward = async (reward: Reward) => {
    if (!user || !profile) return;

    if ((profile.faith_points || 0) < reward.faith_points_cost) {
      toast({
        title: "Puntos insuficientes",
        description: `Necesitas ${reward.faith_points_cost} PF para este premio.`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Llamar función RPC que:
      // 1. Resta los PF del usuario
      // 2. Registra el log
      // 3. Asigna el premio
      const { data, error } = await supabase.rpc("purchase_reward", {
        p_reward_id: reward.id,
        p_follower_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "¡Premio obtenido!",
        description: `Has canjeado ${reward.name}.`,
      });

      loadMyRewards();
      // Recargar perfil para actualizar PF
      window.location.reload();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: `No se pudo canjear: ${msg}`,
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  const deleteReward = async (id: string) => {
    const { error } = await supabase.from("rewards").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Premio eliminado",
        description: "El premio ha sido borrado.",
      });
      loadRewards();
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Premios" icon={<Gift className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Vista para Deidades
  if (profile?.role === "deity") {
    return (
      <AppLayout title="Premios" icon={<Gift className="w-5 h-5" />}>
        <BookPage pageKey="premios">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl text-foreground">Premios del Culto</h1>
              <p className="font-body text-muted-foreground">
                Recompensas que los fieles pueden canjear con Puntos de Fe
              </p>
            </div>

            {/* Premios existentes */}
            <ParchmentCard title="Premios Disponibles" icon={<Star className="w-4 h-4" />}>
              <div className="space-y-3">
                {rewards.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground text-center py-4">
                    No hay premios creados
                  </p>
                ) : (
                  rewards.map((reward, i) => (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-background/50 rounded-sm border border-border/30"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-gold" />
                          <h3 className="font-heading text-base text-foreground">{reward.name}</h3>
                        </div>
                        {reward.description && (
                          <p className="font-body text-sm text-muted-foreground">
                            {reward.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="px-2 py-1 bg-gold/20 text-gold font-heading rounded-sm">
                            {reward.faith_points_cost} PF
                          </span>
                          {reward.tags.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {reward.tags.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteReward(reward.id)}
                        className="p-2 text-muted-foreground/30 hover:text-wine transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </ParchmentCard>

            {/* Crear premio */}
            <ParchmentCard title="Crear Premio" icon={<Plus className="w-4 h-4" />}>
              {!showCreateForm ? (
                <RitualButton
                  variant="outline"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Premio
                </RitualButton>
              ) : (
                <form onSubmit={createReward} className="space-y-4">
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Nombre del premio
                    </label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      placeholder="Ej: Día libre de tareas"
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Detalles del premio..."
                      rows={2}
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Costo en Puntos de Fe
                    </label>
                    <input
                      type="number"
                      value={newCost}
                      onChange={(e) => setNewCost(parseInt(e.target.value) || 0)}
                      min={0}
                      required
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Etiquetas (separadas por comas)
                    </label>
                    <input
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="Ej: Servicio, Disciplina"
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <RitualButton type="submit" variant="gold" className="flex-1" disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
                    </RitualButton>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </ParchmentCard>
          </div>
        </BookPage>
      </AppLayout>
    );
  }

  // Vista para Fieles
  return (
    <AppLayout title="Premios" icon={<Gift className="w-5 h-5" />}>
      <BookPage pageKey="premios">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Mis Premios</h1>
            <p className="font-body text-muted-foreground">
              Recompensas obtenidas y tienda
            </p>
          </div>

          {/* Balance de PF */}
          <div className="text-center p-6 bg-gradient-to-b from-gold/10 to-transparent rounded-sm border border-gold/30">
            <p className="font-heading text-xs text-gold uppercase tracking-wider mb-2">
              Puntos de Fe Disponibles
            </p>
            <p className="font-display text-4xl text-gold">{profile?.faith_points || 0}</p>
          </div>

          {/* Premios obtenidos */}
          <ParchmentCard title="Premios Obtenidos" icon={<Crown className="w-4 h-4" />}>
            <div className="space-y-2">
              {myRewards.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center py-4">
                  Aún no tienes premios
                </p>
              ) : (
                myRewards.map((ar, i) => (
                  <motion.div
                    key={ar.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-background/50 rounded-sm border border-gold/20"
                  >
                    <Crown className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <h3 className="font-heading text-sm text-foreground">{ar.rewards.name}</h3>
                      {ar.rewards.description && (
                        <p className="font-body text-xs text-muted-foreground">
                          {ar.rewards.description}
                        </p>
                      )}
                      <p className="font-body text-xs text-muted-foreground/70">
                        Otorgado el {new Date(ar.awarded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ParchmentCard>

          {/* Tienda de premios */}
          <ParchmentCard title="Tienda de Premios" icon={<ShoppingCart className="w-4 h-4" />}>
            <div className="space-y-3">
              {rewards.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center py-4">
                  No hay premios disponibles en la tienda
                </p>
              ) : (
                rewards.map((reward, i) => {
                  const canAfford = (profile?.faith_points || 0) >= reward.faith_points_cost;

                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-background/50 rounded-sm border border-border/30"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-gold" />
                          <h3 className="font-heading text-base text-foreground">{reward.name}</h3>
                        </div>
                        {reward.description && (
                          <p className="font-body text-sm text-muted-foreground">
                            {reward.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-gold/20 text-gold font-heading rounded-sm text-xs">
                            {reward.faith_points_cost} PF
                          </span>
                          {!canAfford && (
                            <div className="flex items-center gap-1.5 text-xs text-wine">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Puntos insuficientes</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <RitualButton
                        variant={canAfford ? "gold" : "outline"}
                        onClick={() => purchaseReward(reward)}
                        disabled={!canAfford || isSaving}
                        className="flex-shrink-0"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Canjear"
                        )}
                      </RitualButton>
                    </motion.div>
                  );
                })
              )}
            </div>
          </ParchmentCard>
        </div>
      </BookPage>
    </AppLayout>
  );
}