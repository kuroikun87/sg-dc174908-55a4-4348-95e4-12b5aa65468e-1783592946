import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Users,
  Plus,
  Minus,
  Loader2,
  History
} from "lucide-react";

interface FaithPointsLog {
  id: string;
  user_id: string;
  deity_id: string | null;
  amount: number;
  balance_after: number;
  reason: string;
  transaction_type: "grant" | "revoke" | "task_reward" | "purchase" | "consequence";
  created_at: string;
  deity_profile?: {
    display_name: string | null;
  };
}

interface FollowerWithPoints {
  id: string;
  display_name: string | null;
  nickname: string | null;
  faith_points: number;
  role: string;
}

export default function PuntosFePage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState<FollowerWithPoints[]>([]);
  const [myHistory, setMyHistory] = useState<FaithPointsLog[]>([]);
  const [selectedFollower, setSelectedFollower] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.role === "deity") {
      loadFollowers();
    } else {
      loadMyHistory();
    }
  }, [user, profile]);

  const loadFollowers = async () => {
    if (!profile?.cult_id) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, nickname, faith_points, role")
      .eq("cult_id", profile.cult_id)
      .eq("role", "follower")
      .order("faith_points", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar los fieles: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setFollowers(data || []);
    }
    setIsLoading(false);
  };

  const loadMyHistory = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("faith_points_log")
      .select(`
        *,
        profiles!faith_points_log_deity_id_fkey(display_name, avatar_url)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo cargar el historial: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setMyHistory(data || []);
    }
    setIsLoading(false);
  };

  const grantPoints = async (type: "grant" | "revoke") => {
    if (!selectedFollower || !user || amount <= 0) return;

    setIsSaving(true);
    const finalAmount = type === "revoke" ? -amount : amount;

    try {
      const { error } = await supabase.rpc("log_faith_points_transaction", {
        p_user_id: selectedFollower,
        p_deity_id: user.id,
        p_amount: finalAmount,
        p_reason: reason || (type === "grant" ? "Otorgado por deidad" : "Retirado por deidad"),
        p_transaction_type: type,
      });

      if (error) throw error;

      toast({
        title: type === "grant" ? "Puntos otorgados" : "Puntos retirados",
        description: `${Math.abs(finalAmount)} PF ${type === "grant" ? "agregados" : "retirados"}.`,
      });

      setAmount(0);
      setReason("");
      setShowGrantForm(false);
      setSelectedFollower(null);
      loadFollowers();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "grant": return <TrendingUp className="w-4 h-4 text-gold" />;
      case "revoke": return <TrendingDown className="w-4 h-4 text-wine" />;
      case "task_reward": return <Sparkles className="w-4 h-4 text-gold" />;
      case "purchase": return <TrendingDown className="w-4 h-4 text-muted-foreground" />;
      case "consequence": return <TrendingDown className="w-4 h-4 text-wine" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? "text-gold" : "text-wine";
  };

  if (isLoading) {
    return (
      <AppLayout title="Puntos de Fe" icon={<Sparkles className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Vista para FIELES: solo ver su propio balance e historial
  if (profile?.role === "follower") {
    return (
      <AppLayout title="Puntos de Fe" icon={<Sparkles className="w-5 h-5" />}>
        <BookPage pageKey="puntos-fe">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl text-foreground">Mis Puntos de Fe</h1>
              <p className="font-body text-muted-foreground">
                Recompensas y progreso espiritual
              </p>
            </div>

            {/* Balance actual */}
            <ParchmentCard title="Balance Actual" icon={<Sparkles className="w-4 h-4" />}>
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-gold/10 rounded-sm border border-gold/30">
                  <Sparkles className="w-8 h-8 text-gold" />
                  <span className="font-display text-5xl text-gold">
                    {profile?.faith_points || 0}
                  </span>
                  <span className="font-heading text-sm text-gold/70 uppercase tracking-wider">PF</span>
                </div>
              </div>
            </ParchmentCard>

            {/* Historial */}
            <ParchmentCard title="Historial" icon={<History className="w-4 h-4" />}>
              <div className="space-y-2">
                {myHistory.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground text-center py-4">
                    No hay movimientos registrados
                  </p>
                ) : (
                  myHistory.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-sm border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(log.transaction_type)}
                        <div className="space-y-0.5">
                          <p className="font-heading text-sm text-foreground">{log.reason}</p>
                          <p className="font-body text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleDateString("es", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-heading text-lg ${getTransactionColor(log.amount)}`}>
                          {log.amount > 0 ? "+" : ""}{log.amount}
                        </span>
                        <p className="font-body text-xs text-muted-foreground">
                          Balance: {log.balance_after}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ParchmentCard>
          </div>
        </BookPage>
      </AppLayout>
    );
  }

  // Vista para DEIDADES: gestionar puntos de los fieles
  return (
    <AppLayout title="Puntos de Fe" icon={<Sparkles className="w-5 h-5" />}>
      <BookPage pageKey="puntos-fe">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Puntos de Fe</h1>
            <p className="font-body text-muted-foreground">
              Gestión de recompensas espirituales
            </p>
          </div>

          {/* Lista de fieles */}
          <ParchmentCard title="Fieles del Culto" icon={<Users className="w-4 h-4" />}>
            <div className="space-y-2">
              {followers.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center py-4">
                  No hay fieles en el culto
                </p>
              ) : (
                followers.map((follower, i) => (
                  <motion.div
                    key={follower.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-sm border border-border/30"
                  >
                    <div className="flex-1">
                      <h3 className="font-heading text-sm text-foreground">
                        {follower.display_name || follower.nickname || "Sin nombre"}
                      </h3>
                      {follower.nickname && follower.display_name && (
                        <p className="font-body text-xs text-muted-foreground">
                          @{follower.nickname}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-display text-2xl text-gold">
                          {follower.faith_points}
                        </span>
                        <span className="font-heading text-xs text-gold/70 ml-1">PF</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedFollower(follower.id);
                            setShowGrantForm(true);
                          }}
                          className="p-2 text-gold hover:bg-gold/10 rounded-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFollower(follower.id);
                            setShowGrantForm(true);
                          }}
                          className="p-2 text-wine hover:bg-wine/10 rounded-sm transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ParchmentCard>

          {/* Formulario para otorgar/retirar puntos */}
          {showGrantForm && selectedFollower && (
            <ParchmentCard title="Modificar Puntos" icon={<Sparkles className="w-4 h-4" />}>
              <div className="space-y-4">
                <div>
                  <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    min={0}
                    placeholder="0"
                    className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                               text-foreground font-body focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div>
                  <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Razón (opcional)
                  </label>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ej: Por completar ritual de meditación"
                    className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                               text-foreground font-body focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="flex gap-2">
                  <RitualButton
                    onClick={() => grantPoints("grant")}
                    disabled={amount <= 0 || isSaving}
                    variant="gold"
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Otorgar
                  </RitualButton>
                  <RitualButton
                    onClick={() => grantPoints("revoke")}
                    disabled={amount <= 0 || isSaving}
                    variant="outline"
                    className="flex-1 border-wine text-wine hover:bg-wine/10"
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    Retirar
                  </RitualButton>
                  <button
                    onClick={() => {
                      setShowGrantForm(false);
                      setSelectedFollower(null);
                      setAmount(0);
                      setReason("");
                    }}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </ParchmentCard>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}