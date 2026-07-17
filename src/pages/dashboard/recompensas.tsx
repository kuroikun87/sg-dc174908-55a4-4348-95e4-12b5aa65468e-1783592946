import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckSquare,
  Gift,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  faith_points_reward: number;
  requires_evidence: boolean;
}

interface Reward {
  id: string;
  name: string;
  description: string | null;
  faith_points_cost: number;
}

interface Consequence {
  id: string;
  name: string;
  description: string | null;
  faith_points_cost: number;
}

export default function RecompensasPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Templates
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [consequences, setConsequences] = useState<Consequence[]>([]);

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showConsequenceModal, setShowConsequenceModal] = useState(false);

  // Form states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    faith_points: 0,
    requires_evidence: false,
  });

  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState({
    title: "",
    description: "",
    faith_points: 0,
  });

  const [editingConsequence, setEditingConsequence] = useState<Consequence | null>(null);
  const [consequenceForm, setConsequenceForm] = useState({
    title: "",
    description: "",
    faith_points: 0,
  });

  useEffect(() => {
    loadAllData();
  }, [profile]);

  const loadAllData = async () => {
    if (!profile?.cult_id) return;

    try {
      const [tasksRes, rewardsRes, consequencesRes] = await Promise.all([
        supabase.from("tasks").select("*").eq("cult_id", profile.cult_id).order("created_at", { ascending: false }),
        supabase.from("rewards").select("*").eq("cult_id", profile.cult_id).order("created_at", { ascending: false }),
        supabase.from("punishments").select("*").eq("cult_id", profile.cult_id).order("created_at", { ascending: false }),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (rewardsRes.error) throw rewardsRes.error;
      if (consequencesRes.error) throw consequencesRes.error;

      setTasks(tasksRes.data || []);
      setRewards(rewardsRes.data || []);
      setConsequences(consequencesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    if (!user || !profile?.cult_id) {
      setIsLoading(false);
      return;
    }

    try {
      if (profile.role === "deity") {
        // Cargar todas las recompensas del culto
        const { data: rewardsData, error: rewardsError } = await supabase
          .from("rewards")
          .select("*")
          .eq("cult_id", profile.cult_id)
          .order("is_active", { ascending: false })
          .order("name");

        if (rewardsError) throw rewardsError;
        setRewards(rewardsData || []);

        const { data: punishmentsData, error: punishmentsError } = await supabase
          .from("punishments")
          .select("*")
          .eq("cult_id", profile.cult_id)
          .order("is_active", { ascending: false })
          .order("name");

        if (punishmentsError) throw punishmentsError;
        setConsequences(punishmentsData || []);
      } else {
        // Cargar recompensas activas para la tienda
        const { data: rewardsData, error: rewardsError } = await supabase
          .from("rewards")
          .select("*")
          .eq("cult_id", profile.cult_id)
          .eq("is_active", true)
          .order("cost", { ascending: true });

        if (rewardsError) throw rewardsError;
        setRewards(rewardsData || []);

        // Cargar premios del fiel
        const { data: myRewardsData, error: myRewardsError } = await supabase
          .from("follower_rewards")
          .select(`
            *,
            rewards(*)
          `)
          .eq("follower_id", user.id);

        if (myRewardsError) throw myRewardsError;
        setRewards(myRewardsData || []);

        // Cargar consecuencias activas
        const { data: punishmentsData, error: punishmentsError } = await supabase
          .from("punishments")
          .select("*")
          .eq("cult_id", profile.cult_id)
          .eq("is_active", true)
          .order("cost", { ascending: true });

        if (punishmentsError) throw punishmentsError;
        setConsequences(punishmentsData || []);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los datos: ${error.message}`,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  // Task CRUD
  const openTaskModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || "",
        faith_points: task.faith_points_reward,
        requires_evidence: task.requires_evidence,
      });
    } else {
      setEditingTask(null);
      setTaskForm({ title: "", description: "", faith_points: 0, requires_evidence: false });
    }
    setShowTaskModal(true);
  };

  const saveTask = async () => {
    if (!profile?.cult_id || !taskForm.title.trim()) return;

    try {
      if (editingTask) {
        const { error } = await supabase
          .from("tasks")
          .update({
            title: taskForm.title,
            description: taskForm.description || null,
            faith_points_reward: taskForm.faith_points,
            requires_evidence: taskForm.requires_evidence,
          })
          .eq("id", editingTask.id);

        if (error) throw error;
        toast({ title: "Tarea actualizada" });
      } else {
        const { error } = await supabase.from("tasks").insert({
          cult_id: profile.cult_id,
          title: taskForm.title,
          description: taskForm.description || null,
          faith_points_reward: taskForm.faith_points,
          requires_evidence: taskForm.requires_evidence,
        });

        if (error) throw error;
        toast({ title: "Tarea creada" });
      }

      setShowTaskModal(false);
      loadAllData();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la tarea",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Tarea eliminada" });
      loadAllData();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive",
      });
    }
  };

  // Reward CRUD
  const openRewardModal = (reward?: Reward) => {
    if (reward) {
      setEditingReward(reward);
      setRewardForm({
        title: reward.name,
        description: reward.description || "",
        faith_points: reward.faith_points_cost,
      });
    } else {
      setEditingReward(null);
      setRewardForm({ title: "", description: "", faith_points: 0 });
    }
    setShowRewardModal(true);
  };

  const saveReward = async () => {
    if (!profile?.cult_id || !rewardForm.title.trim()) return;

    try {
      if (editingReward) {
        const { error } = await supabase
          .from("rewards")
          .update({
            name: rewardForm.title,
            description: rewardForm.description || null,
            faith_points_cost: rewardForm.faith_points,
          })
          .eq("id", editingReward.id);

        if (error) throw error;
        toast({ title: "Premio actualizado" });
      } else {
        const { error } = await supabase.from("rewards").insert({
          cult_id: profile.cult_id,
          name: rewardForm.title,
          description: rewardForm.description || null,
          faith_points_cost: rewardForm.faith_points,
        });

        if (error) throw error;
        toast({ title: "Premio creado" });
      }

      setShowRewardModal(false);
      loadAllData();
    } catch (error) {
      console.error("Error saving reward:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el premio",
        variant: "destructive",
      });
    }
  };

  const deleteReward = async (id: string) => {
    try {
      const { error } = await supabase.from("rewards").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Premio eliminado" });
      loadAllData();
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el premio",
        variant: "destructive",
      });
    }
  };

  // Consequence CRUD
  const openConsequenceModal = (consequence?: Consequence) => {
    if (consequence) {
      setEditingConsequence(consequence);
      setConsequenceForm({
        title: consequence.name,
        description: consequence.description || "",
        faith_points: consequence.faith_points_cost,
      });
    } else {
      setEditingConsequence(null);
      setConsequenceForm({ title: "", description: "", faith_points: 0 });
    }
    setShowConsequenceModal(true);
  };

  const saveConsequence = async () => {
    if (!profile?.cult_id || !consequenceForm.title.trim()) return;

    try {
      if (editingConsequence) {
        const { error } = await supabase
          .from("punishments")
          .update({
            name: consequenceForm.title,
            description: consequenceForm.description || null,
            faith_points_cost: consequenceForm.faith_points,
          })
          .eq("id", editingConsequence.id);

        if (error) throw error;
        toast({ title: "Consecuencia actualizada" });
      } else {
        const { error } = await supabase.from("punishments").insert({
          cult_id: profile.cult_id,
          name: consequenceForm.title,
          description: consequenceForm.description || null,
          faith_points_cost: consequenceForm.faith_points,
        });

        if (error) throw error;
        toast({ title: "Consecuencia creada" });
      }

      setShowConsequenceModal(false);
      loadAllData();
    } catch (error) {
      console.error("Error saving consequence:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la consecuencia",
        variant: "destructive",
      });
    }
  };

  const deleteConsequence = async (id: string) => {
    try {
      const { error } = await supabase.from("punishments").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Consecuencia eliminada" });
      loadAllData();
    } catch (error) {
      console.error("Error deleting consequence:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la consecuencia",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Recompensas" icon={<Gift className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Biblioteca de Recompensas" icon={<Gift className="w-5 h-5" />}>
      <BookPage pageKey="recompensas">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Biblioteca de Recompensas</h1>
            <p className="font-body text-sm text-muted-foreground">
              Crea plantillas para asignar desde las fichas de los fieles
            </p>
          </div>

          <Tabs defaultValue="tasks" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/30">
              <TabsTrigger value="tasks" className="data-[state=active]:bg-gold/20">
                <CheckSquare className="w-4 h-4 mr-2" />
                Tareas
              </TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-gold/20">
                <Gift className="w-4 h-4 mr-2" />
                Premios
              </TabsTrigger>
              <TabsTrigger value="consequences" className="data-[state=active]:bg-gold/20">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Consecuencias
              </TabsTrigger>
            </TabsList>

            {/* TAREAS */}
            <TabsContent value="tasks" className="space-y-4">
              <RitualButton variant="gold" onClick={() => openTaskModal()} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Tarea
              </RitualButton>

              {tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 font-body text-sm">
                  No hay tareas creadas. Crea plantillas para asignar a los fieles.
                </p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <ParchmentCard key={task.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-heading text-base text-foreground mb-1">{task.title}</h3>
                          {task.description && (
                            <p className="font-body text-sm text-muted-foreground">{task.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            {task.faith_points_reward > 0 && (
                              <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                                +{task.faith_points_reward} PF
                              </Badge>
                            )}
                            {task.requires_evidence && (
                              <Badge variant="outline">Requiere evidencia</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openTaskModal(task)}
                            className="p-2 text-gold hover:text-gold/80 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 text-muted-foreground/30 hover:text-wine transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </ParchmentCard>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* PREMIOS */}
            <TabsContent value="rewards" className="space-y-4">
              <RitualButton variant="gold" onClick={() => openRewardModal()} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Premio
              </RitualButton>

              {rewards.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 font-body text-sm">
                  No hay premios creados. Los fieles podrán comprarlos en la tienda.
                </p>
              ) : (
                <div className="space-y-2">
                  {rewards.map((reward) => (
                    <ParchmentCard key={reward.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-heading text-base text-foreground mb-1">{reward.name}</h3>
                          {reward.description && (
                            <p className="font-body text-sm text-muted-foreground">{reward.description}</p>
                          )}
                          {reward.faith_points_cost > 0 && (
                            <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30 mt-2">
                              {reward.faith_points_cost} PF
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openRewardModal(reward)}
                            className="p-2 text-gold hover:text-gold/80 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteReward(reward.id)}
                            className="p-2 text-muted-foreground/30 hover:text-wine transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </ParchmentCard>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* CONSECUENCIAS */}
            <TabsContent value="consequences" className="space-y-4">
              <RitualButton variant="gold" onClick={() => openConsequenceModal()} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Consecuencia
              </RitualButton>

              {consequences.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 font-body text-sm">
                  No hay consecuencias creadas.
                </p>
              ) : (
                <div className="space-y-2">
                  {consequences.map((consequence) => (
                    <ParchmentCard key={consequence.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-heading text-base text-foreground mb-1">{consequence.name}</h3>
                          {consequence.description && (
                            <p className="font-body text-sm text-muted-foreground">{consequence.description}</p>
                          )}
                          {consequence.faith_points_cost > 0 && (
                            <Badge variant="outline" className="bg-wine/20 text-wine border-wine/40 mt-2">
                              {consequence.faith_points_cost} PF para quitar
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openConsequenceModal(consequence)}
                            className="p-2 text-gold hover:text-gold/80 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteConsequence(consequence.id)}
                            className="p-2 text-muted-foreground/30 hover:text-wine transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </ParchmentCard>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </BookPage>

      {/* Modal Tarea */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="bg-card border-2 border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">
              {editingTask ? "Editar Tarea" : "Nueva Tarea"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">
                Título *
              </label>
              <Input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Nombre de la tarea"
              />
            </div>

            <div>
              <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">
                Descripción
              </label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Detalles opcionales"
                rows={3}
              />
            </div>

            <div>
              <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">
                Puntos de Fe
              </label>
              <Input
                type="number"
                value={taskForm.faith_points}
                onChange={(e) => setTaskForm({ ...taskForm, faith_points: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={taskForm.requires_evidence}
                onChange={(e) => setTaskForm({ ...taskForm, requires_evidence: e.target.checked })}
                className="w-4 h-4 accent-gold"
              />
              <span className="font-body text-sm text-foreground">Requiere evidencia fotográfica</span>
            </label>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowTaskModal(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <RitualButton variant="gold" onClick={saveTask}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </RitualButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Premio */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="bg-card border-2 border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">
              {editingReward ? "Editar Premio" : "Nuevo Premio"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">
                Título *
              </label>
              <Input
                value={rewardForm.title}
                onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                placeholder="Nombre del premio"
              />
            </div>

            <div>
              <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">
                Descripción
              </label>
              <Textarea
                value={rewardForm.description}
                onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                placeholder="Detalles opcionales"
                rows={3}
              />
            </div>

            <div>
              <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">
                Costo en Puntos de Fe
              </label>
              <Input
                type="number"
                value={rewardForm.faith_points}
                onChange={(e) => setRewardForm({ ...rewardForm, faith_points: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowRewardModal(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <RitualButton variant="gold" onClick={saveReward}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </RitualButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Consecuencia */}
      <Dialog open={showConsequenceModal} onOpenChange={setShowConsequenceModal}>
        <DialogContent className="bg-card border-2 border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">
              {editingConsequence ? "Editar Consecuencia" : "Nueva Consecuencia"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">
                Título *
              </label>
              <Input
                value={consequenceForm.title}
                onChange={(e) => setConsequenceForm({ ...consequenceForm, title: e.target.value })}
                placeholder="Nombre de la consecuencia"
              />
            </div>

            <div>
              <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">
                Descripción
              </label>
              <Textarea
                value={consequenceForm.description}
                onChange={(e) => setConsequenceForm({ ...consequenceForm, description: e.target.value })}
                placeholder="Detalles opcionales"
                rows={3}
              />
            </div>

            <div>
              <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">
                Puntos de Fe para eliminar
              </label>
              <Input
                type="number"
                value={consequenceForm.faith_points}
                onChange={(e) => setConsequenceForm({ ...consequenceForm, faith_points: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowConsequenceModal(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <RitualButton variant="gold" onClick={saveConsequence}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </RitualButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}