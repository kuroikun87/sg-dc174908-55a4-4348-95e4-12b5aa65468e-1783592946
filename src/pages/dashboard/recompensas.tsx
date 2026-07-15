import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  Gift,
  AlertTriangle,
  Plus,
  Trash2,
  Check,
  Camera,
  Sparkles,
  ShoppingCart,
  Loader2,
  Calendar,
  X,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  faith_points_reward: number;
  requires_evidence: boolean;
  is_completed: boolean;
  completed_at: string | null;
  assigned_to: string;
  created_at: string;
}

interface Reward {
  id: string;
  name: string;
  description: string | null;
  faith_points_cost: number;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

interface AwardedReward {
  id: string;
  reward_id: string;
  follower_id: string;
  awarded_at: string;
  rewards: Reward;
}

interface Punishment {
  id: string;
  name: string;
  description: string | null;
  faith_points_cost: number;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

interface AssignedPunishment {
  id: string;
  punishment_id: string;
  follower_id: string;
  assigned_by: string;
  assigned_at: string;
  notes: string | null;
  is_removed: boolean;
  removed_at: string | null;
  punishments: Punishment;
}

interface Follower {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function RecompensasPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Tareas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskReward, setNewTaskReward] = useState(0);
  const [newTaskRequiresEvidence, setNewTaskRequiresEvidence] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState("");

  // Premios
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myRewards, setMyRewards] = useState<AwardedReward[]>([]);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardDescription, setNewRewardDescription] = useState("");
  const [newRewardCost, setNewRewardCost] = useState(0);
  const [newRewardTags, setNewRewardTags] = useState("");

  // Consecuencias
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [myPunishments, setMyPunishments] = useState<AssignedPunishment[]>([]);
  const [showPunishmentForm, setShowPunishmentForm] = useState(false);
  const [newPunishmentName, setNewPunishmentName] = useState("");
  const [newPunishmentDescription, setNewPunishmentDescription] = useState("");
  const [newPunishmentCost, setNewPunishmentCost] = useState(0);
  const [newPunishmentTags, setNewPunishmentTags] = useState("");

  // Fieles disponibles
  const [followers, setFollowers] = useState<Follower[]>([]);

  const isDeity = profile?.role === "deity";

  useEffect(() => {
    loadAllData();
  }, [profile?.cult_id, user?.id]);

  const loadAllData = async () => {
    if (!user || !profile?.cult_id) {
      setIsLoading(false);
      return;
    }

    await Promise.all([
      loadTasks(),
      loadRewards(),
      loadPunishments(),
      isDeity && loadFollowers(),
    ]);

    setIsLoading(false);
  };

  const loadTasks = async () => {
    if (!user || !profile?.cult_id) return;

    if (isDeity) {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("cult_id", profile.cult_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading tasks:", error);
      } else {
        setTasks(data || []);
      }
    } else {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", user.id)
        .order("is_completed", { ascending: true })
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Error loading my tasks:", error);
      } else {
        setMyTasks(data || []);
      }
    }
  };

  const loadRewards = async () => {
    if (!user || !profile?.cult_id) return;

    const { data: rewardsData, error: rewardsError } = await supabase
      .from("rewards")
      .select("*")
      .eq("cult_id", profile.cult_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (rewardsError) {
      console.error("Error loading rewards:", rewardsError);
    } else {
      setRewards(rewardsData || []);
    }

    if (!isDeity) {
      const { data: myRewardsData, error: myRewardsError } = await supabase
        .from("awarded_rewards")
        .select("*, rewards(*)")
        .eq("follower_id", user.id)
        .order("awarded_at", { ascending: false });

      if (myRewardsError) {
        console.error("Error loading my rewards:", myRewardsError);
      } else {
        setMyRewards(myRewardsData || []);
      }
    }
  };

  const loadPunishments = async () => {
    if (!user || !profile?.cult_id) return;

    const { data: punishmentsData, error: punishmentsError } = await supabase
      .from("punishments")
      .select("*")
      .eq("cult_id", profile.cult_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (punishmentsError) {
      console.error("Error loading punishments:", punishmentsError);
    } else {
      setPunishments(punishmentsData || []);
    }

    if (!isDeity) {
      const { data: myPunishmentsData, error: myPunishmentsError } = await supabase
        .from("assigned_punishments")
        .select("*, punishments(*)")
        .eq("follower_id", user.id)
        .eq("is_removed", false)
        .order("assigned_at", { ascending: false });

      if (myPunishmentsError) {
        console.error("Error loading my punishments:", myPunishmentsError);
      } else {
        setMyPunishments(myPunishmentsData || []);
      }
    }
  };

  const loadFollowers = async () => {
    if (!profile?.cult_id) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("cult_id", profile.cult_id)
      .eq("role", "follower");

    if (error) {
      console.error("Error loading followers:", error);
    } else {
      setFollowers(data || []);
    }
  };

  // ============ TAREAS ============
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user || !profile?.cult_id || !selectedFollower) return;

    setIsSaving(true);

    const { error } = await supabase.from("tasks").insert({
      cult_id: profile.cult_id,
      title: newTaskTitle,
      description: newTaskDescription || null,
      due_date: newTaskDueDate || null,
      faith_points_reward: newTaskReward,
      requires_evidence: newTaskRequiresEvidence,
      assigned_to: selectedFollower,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear la tarea: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Tarea creada" });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate("");
      setNewTaskReward(0);
      setNewTaskRequiresEvidence(false);
      setSelectedFollower("");
      setShowTaskForm(false);
      loadTasks();
    }

    setIsSaving(false);
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;

    setIsSaving(true);

    const { error } = await supabase
      .from("tasks")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo completar la tarea: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Tarea completada" });
      loadTasks();
    }

    setIsSaving(false);
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Tarea eliminada" });
      loadTasks();
    }
  };

  // ============ PREMIOS ============
  const createReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardName.trim() || !user || !profile?.cult_id) return;

    setIsSaving(true);

    const tags = newRewardTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { error } = await supabase.from("rewards").insert({
      cult_id: profile.cult_id,
      name: newRewardName,
      description: newRewardDescription || null,
      faith_points_cost: newRewardCost,
      tags: tags,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear el premio: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Premio creado" });
      setNewRewardName("");
      setNewRewardDescription("");
      setNewRewardCost(0);
      setNewRewardTags("");
      setShowRewardForm(false);
      loadRewards();
    }

    setIsSaving(false);
  };

  const purchaseReward = async (reward: Reward) => {
    if (!user || !profile) return;

    if ((profile.faith_points || 0) < reward.faith_points_cost) {
      toast({
        title: "Puntos insuficientes",
        description: `Necesitas ${reward.faith_points_cost} PF para comprar este premio.`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase.rpc("purchase_reward", {
        p_reward_id: reward.id,
        p_follower_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Premio adquirido",
        description: `Has obtenido: ${reward.name}`,
      });

      loadRewards();
      window.location.reload();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: `No se pudo comprar: ${msg}`,
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  const deleteReward = async (rewardId: string) => {
    const { error } = await supabase.from("rewards").delete().eq("id", rewardId);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Premio eliminado" });
      loadRewards();
    }
  };

  // ============ CONSECUENCIAS ============
  const createPunishment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPunishmentName.trim() || !user || !profile?.cult_id) return;

    setIsSaving(true);

    const tags = newPunishmentTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { error } = await supabase.from("punishments").insert({
      cult_id: profile.cult_id,
      name: newPunishmentName,
      description: newPunishmentDescription || null,
      faith_points_cost: newPunishmentCost,
      tags: tags,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear la consecuencia: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Consecuencia creada" });
      setNewPunishmentName("");
      setNewPunishmentDescription("");
      setNewPunishmentCost(0);
      setNewPunishmentTags("");
      setShowPunishmentForm(false);
      loadPunishments();
    }

    setIsSaving(false);
  };

  const removePunishment = async (ap: AssignedPunishment) => {
    if (!user || !profile) return;

    if ((profile.faith_points || 0) < ap.punishments.faith_points_cost) {
      toast({
        title: "Puntos insuficientes",
        description: `Necesitas ${ap.punishments.faith_points_cost} PF para eliminar esta consecuencia.`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase.rpc("remove_punishment", {
        p_assigned_punishment_id: ap.id,
        p_follower_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Consecuencia eliminada",
        description: `Has eliminado: ${ap.punishments.name}`,
      });

      loadPunishments();
      window.location.reload();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${msg}`,
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  const deletePunishment = async (punishmentId: string) => {
    const { error } = await supabase.from("punishments").delete().eq("id", punishmentId);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Consecuencia eliminada" });
      loadPunishments();
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Recompensas" icon={<Sparkles className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Recompensas" icon={<Sparkles className="w-5 h-5" />}>
      <BookPage pageKey="recompensas">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Sistema de Recompensas</h1>
            <p className="font-body text-muted-foreground">
              {isDeity ? "Gestión de tareas, premios y consecuencias" : "Tus tareas y recompensas"}
            </p>
          </div>

          <Tabs defaultValue="tasks" className="space-y-4">
            <TabsList className="grid grid-cols-3 gap-1 bg-muted/30 p-1">
              <TabsTrigger value="tasks">
                <Settings className="w-4 h-4 mr-2" />
                Tareas
              </TabsTrigger>
              <TabsTrigger value="rewards">
                <Gift className="w-4 h-4 mr-2" />
                Premios
              </TabsTrigger>
              <TabsTrigger value="punishments">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Consecuencias
              </TabsTrigger>
            </TabsList>

            {/* ============ TAB: TAREAS ============ */}
            <TabsContent value="tasks" className="space-y-4">
              <ParchmentCard title="Tareas" icon={<Settings className="w-4 h-4" />}>
                <div className="space-y-4">
                  {isDeity && (
                    <>
                      {!showTaskForm ? (
                        <RitualButton
                          variant="outline"
                          onClick={() => setShowTaskForm(true)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nueva Tarea
                        </RitualButton>
                      ) : (
                        <form onSubmit={createTask} className="space-y-3 p-4 bg-background/30 rounded-sm border border-border/30">
                          <input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Título de la tarea"
                            required
                            className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                     text-foreground font-body focus:outline-none focus:border-gold/50"
                          />
                          <textarea
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                            placeholder="Descripción (opcional)"
                            rows={2}
                            className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                     text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="font-body text-xs text-muted-foreground mb-1 block">
                                Fecha límite
                              </label>
                              <input
                                type="date"
                                value={newTaskDueDate}
                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                                className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                         text-foreground font-body focus:outline-none focus:border-gold/50"
                              />
                            </div>
                            <div>
                              <label className="font-body text-xs text-muted-foreground mb-1 block">
                                Puntos de Fe
                              </label>
                              <input
                                type="number"
                                value={newTaskReward}
                                onChange={(e) => setNewTaskReward(parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                         text-foreground font-body focus:outline-none focus:border-gold/50"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="font-body text-xs text-muted-foreground mb-1 block">
                              Asignar a
                            </label>
                            <select
                              value={selectedFollower}
                              onChange={(e) => setSelectedFollower(e.target.value)}
                              required
                              className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                       text-foreground font-body focus:outline-none focus:border-gold/50"
                            >
                              <option value="">Seleccionar fiel</option>
                              {followers.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.display_name || "Sin nombre"}
                                </option>
                              ))}
                            </select>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newTaskRequiresEvidence}
                              onChange={(e) => setNewTaskRequiresEvidence(e.target.checked)}
                              className="w-4 h-4 accent-gold"
                            />
                            <span className="font-body text-sm text-foreground">
                              Requiere evidencia fotográfica
                            </span>
                          </label>
                          <div className="flex gap-2">
                            <RitualButton
                              type="submit"
                              variant="gold"
                              className="flex-1"
                              disabled={isSaving}
                            >
                              Crear Tarea
                            </RitualButton>
                            <button
                              type="button"
                              onClick={() => setShowTaskForm(false)}
                              className="px-4 text-sm text-muted-foreground hover:text-foreground"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}

                  {/* Lista de tareas */}
                  <div className="space-y-2">
                    {(isDeity ? tasks : myTasks).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No hay tareas {isDeity ? "creadas" : "asignadas"}
                      </p>
                    ) : (
                      (isDeity ? tasks : myTasks).map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 bg-background/50 rounded-sm border transition-all ${
                            task.is_completed
                              ? "border-border/20 opacity-50"
                              : "border-border/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-heading text-sm text-foreground mb-1">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="font-body text-xs text-muted-foreground mb-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs">
                                {task.faith_points_reward > 0 && (
                                  <Badge variant="outline" className="bg-gold/10 border-gold/30">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {task.faith_points_reward} PF
                                  </Badge>
                                )}
                                {task.due_date && (
                                  <Badge variant="outline">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </Badge>
                                )}
                                {task.requires_evidence && (
                                  <Badge variant="outline">
                                    <Camera className="w-3 h-3 mr-1" />
                                    Evidencia
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {!isDeity && !task.is_completed && (
                                <button
                                  onClick={() => completeTask(task.id)}
                                  className="p-2 text-gold hover:text-gold/80 transition-colors"
                                  title="Completar"
                                  disabled={isSaving}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {isDeity && (
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-2 text-muted-foreground/30 hover:text-wine transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </ParchmentCard>
            </TabsContent>

            {/* ============ TAB: PREMIOS ============ */}
            <TabsContent value="rewards" className="space-y-4">
              {isDeity ? (
                <ParchmentCard title="Premios" icon={<Gift className="w-4 h-4" />}>
                  <div className="space-y-4">
                    {!showRewardForm ? (
                      <RitualButton
                        variant="outline"
                        onClick={() => setShowRewardForm(true)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Premio
                      </RitualButton>
                    ) : (
                      <form onSubmit={createReward} className="space-y-3 p-4 bg-background/30 rounded-sm border border-border/30">
                        <input
                          value={newRewardName}
                          onChange={(e) => setNewRewardName(e.target.value)}
                          placeholder="Nombre del premio"
                          required
                          className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body focus:outline-none focus:border-gold/50"
                        />
                        <textarea
                          value={newRewardDescription}
                          onChange={(e) => setNewRewardDescription(e.target.value)}
                          placeholder="Descripción (opcional)"
                          rows={2}
                          className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                        />
                        <div>
                          <label className="font-body text-xs text-muted-foreground mb-1 block">
                            Costo en Puntos de Fe
                          </label>
                          <input
                            type="number"
                            value={newRewardCost}
                            onChange={(e) => setNewRewardCost(parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                     text-foreground font-body focus:outline-none focus:border-gold/50"
                          />
                        </div>
                        <input
                          value={newRewardTags}
                          onChange={(e) => setNewRewardTags(e.target.value)}
                          placeholder="Etiquetas (separadas por comas)"
                          className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body focus:outline-none focus:border-gold/50"
                        />
                        <div className="flex gap-2">
                          <RitualButton
                            type="submit"
                            variant="gold"
                            className="flex-1"
                            disabled={isSaving}
                          >
                            Crear Premio
                          </RitualButton>
                          <button
                            type="button"
                            onClick={() => setShowRewardForm(false)}
                            className="px-4 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {rewards.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No hay premios creados
                        </p>
                      ) : (
                        rewards.map((reward) => (
                          <div
                            key={reward.id}
                            className="p-4 bg-background/50 rounded-sm border border-border/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-heading text-sm text-foreground mb-1">
                                  {reward.name}
                                </h4>
                                {reward.description && (
                                  <p className="font-body text-xs text-muted-foreground mb-2">
                                    {reward.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="bg-gold/10 border-gold/30">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {reward.faith_points_cost} PF
                                  </Badge>
                                  {reward.tags.map((tag, i) => (
                                    <Badge key={i} variant="outline">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => deleteReward(reward.id)}
                                className="p-2 text-muted-foreground/30 hover:text-wine transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </ParchmentCard>
              ) : (
                <>
                  {/* Tienda */}
                  <ParchmentCard title="Tienda de Premios" icon={<ShoppingCart className="w-4 h-4" />}>
                    <div className="space-y-3">
                      <div className="text-center p-3 bg-gold/10 rounded-sm border border-gold/30">
                        <p className="font-body text-sm text-muted-foreground">
                          Balance actual
                        </p>
                        <p className="font-display text-2xl text-gold">
                          {profile?.faith_points || 0} PF
                        </p>
                      </div>

                      <div className="space-y-2">
                        {rewards.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No hay premios disponibles
                          </p>
                        ) : (
                          rewards.map((reward) => {
                            const canAfford = (profile?.faith_points || 0) >= reward.faith_points_cost;
                            return (
                              <div
                                key={reward.id}
                                className="p-4 bg-background/50 rounded-sm border border-border/30"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-heading text-sm text-foreground mb-1">
                                      {reward.name}
                                    </h4>
                                    {reward.description && (
                                      <p className="font-body text-xs text-muted-foreground mb-2">
                                        {reward.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                      <Badge
                                        variant="outline"
                                        className={`${
                                          canAfford
                                            ? "bg-gold/10 border-gold/30"
                                            : "bg-muted/10 border-muted/30"
                                        }`}
                                      >
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        {reward.faith_points_cost} PF
                                      </Badge>
                                      {reward.tags.map((tag, i) => (
                                        <Badge key={i} variant="outline">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <RitualButton
                                    variant={canAfford ? "gold" : "outline"}
                                    onClick={() => purchaseReward(reward)}
                                    disabled={!canAfford || isSaving}
                                    className="flex-shrink-0"
                                  >
                                    <ShoppingCart className="w-4 h-4" />
                                  </RitualButton>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </ParchmentCard>

                  {/* Mis premios */}
                  <ParchmentCard title="Mis Premios" icon={<Gift className="w-4 h-4" />}>
                    <div className="space-y-2">
                      {myRewards.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No has obtenido premios todavía
                        </p>
                      ) : (
                        myRewards.map((ar) => (
                          <div
                            key={ar.id}
                            className="p-4 bg-background/50 rounded-sm border border-gold/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-heading text-sm text-foreground mb-1">
                                  {ar.rewards.name}
                                </h4>
                                {ar.rewards.description && (
                                  <p className="font-body text-xs text-muted-foreground mb-1">
                                    {ar.rewards.description}
                                  </p>
                                )}
                                <p className="font-body text-xs text-muted-foreground/70">
                                  Obtenido: {new Date(ar.awarded_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Gift className="w-5 h-5 text-gold flex-shrink-0" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ParchmentCard>
                </>
              )}
            </TabsContent>

            {/* ============ TAB: CONSECUENCIAS ============ */}
            <TabsContent value="punishments" className="space-y-4">
              {isDeity ? (
                <ParchmentCard title="Consecuencias" icon={<AlertTriangle className="w-4 h-4" />}>
                  <div className="space-y-4">
                    {!showPunishmentForm ? (
                      <RitualButton
                        variant="outline"
                        onClick={() => setShowPunishmentForm(true)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Consecuencia
                      </RitualButton>
                    ) : (
                      <form onSubmit={createPunishment} className="space-y-3 p-4 bg-background/30 rounded-sm border border-border/30">
                        <input
                          value={newPunishmentName}
                          onChange={(e) => setNewPunishmentName(e.target.value)}
                          placeholder="Nombre de la consecuencia"
                          required
                          className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body focus:outline-none focus:border-gold/50"
                        />
                        <textarea
                          value={newPunishmentDescription}
                          onChange={(e) => setNewPunishmentDescription(e.target.value)}
                          placeholder="Descripción (opcional)"
                          rows={2}
                          className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                        />
                        <div>
                          <label className="font-body text-xs text-muted-foreground mb-1 block">
                            Costo para eliminarla (PF)
                          </label>
                          <input
                            type="number"
                            value={newPunishmentCost}
                            onChange={(e) => setNewPunishmentCost(parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                     text-foreground font-body focus:outline-none focus:border-gold/50"
                          />
                        </div>
                        <input
                          value={newPunishmentTags}
                          onChange={(e) => setNewPunishmentTags(e.target.value)}
                          placeholder="Etiquetas (separadas por comas)"
                          className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body focus:outline-none focus:border-gold/50"
                        />
                        <div className="flex gap-2">
                          <RitualButton
                            type="submit"
                            variant="gold"
                            className="flex-1"
                            disabled={isSaving}
                          >
                            Crear Consecuencia
                          </RitualButton>
                          <button
                            type="button"
                            onClick={() => setShowPunishmentForm(false)}
                            className="px-4 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {punishments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No hay consecuencias creadas
                        </p>
                      ) : (
                        punishments.map((punishment) => (
                          <div
                            key={punishment.id}
                            className="p-4 bg-background/50 rounded-sm border border-border/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-heading text-sm text-foreground mb-1">
                                  {punishment.name}
                                </h4>
                                {punishment.description && (
                                  <p className="font-body text-xs text-muted-foreground mb-2">
                                    {punishment.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="bg-wine/10 border-wine/30">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {punishment.faith_points_cost} PF para eliminar
                                  </Badge>
                                  {punishment.tags.map((tag, i) => (
                                    <Badge key={i} variant="outline">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => deletePunishment(punishment.id)}
                                className="p-2 text-muted-foreground/30 hover:text-wine transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </ParchmentCard>
              ) : (
                <ParchmentCard title="Mis Consecuencias" icon={<AlertTriangle className="w-4 h-4" />}>
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-gold/10 rounded-sm border border-gold/30">
                      <p className="font-body text-sm text-muted-foreground">
                        Balance actual
                      </p>
                      <p className="font-display text-2xl text-gold">
                        {profile?.faith_points || 0} PF
                      </p>
                    </div>

                    <div className="space-y-2">
                      {myPunishments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No tienes consecuencias activas
                        </p>
                      ) : (
                        myPunishments.map((ap) => {
                          const canAfford = (profile?.faith_points || 0) >= ap.punishments.faith_points_cost;
                          return (
                            <div
                              key={ap.id}
                              className="p-4 bg-background/50 rounded-sm border border-wine/30"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-heading text-sm text-foreground mb-1">
                                    {ap.punishments.name}
                                  </h4>
                                  {ap.punishments.description && (
                                    <p className="font-body text-xs text-muted-foreground mb-1">
                                      {ap.punishments.description}
                                    </p>
                                  )}
                                  {ap.notes && (
                                    <p className="font-body text-xs text-muted-foreground/70 mb-2">
                                      Nota: {ap.notes}
                                    </p>
                                  )}
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      canAfford
                                        ? "bg-gold/10 border-gold/30"
                                        : "bg-muted/10 border-muted/30"
                                    }`}
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Eliminar: {ap.punishments.faith_points_cost} PF
                                  </Badge>
                                </div>
                                <RitualButton
                                  variant={canAfford ? "gold" : "outline"}
                                  onClick={() => removePunishment(ap)}
                                  disabled={!canAfford || isSaving}
                                  className="flex-shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </RitualButton>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </ParchmentCard>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </BookPage>
    </AppLayout>
  );
}