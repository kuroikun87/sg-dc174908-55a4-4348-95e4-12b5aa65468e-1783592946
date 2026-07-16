import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Loader2, Upload, CheckCircle2, Clock, Sparkles, Camera, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function TareasPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    requires_evidence: false,
    recurrence_type: "once" as "once" | "daily" | "weekly",
    recurrence_days: [] as number[],
    time_limit: "",
    due_date: "",
    reward_id: "",
    reward_faith_points: 0,
    punishment_id: "",
    punishment_faith_points: 0,
  });
  const [selectedFollowers, setSelectedFollowers] = useState<string[]>([]);

  const [rewards, setRewards] = useState<any[]>([]);
  const [punishments, setPunishments] = useState<any[]>([]);
  const [taskLibrary, setTaskLibrary] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [user, profile]);

  const loadData = async () => {
    if (!profile?.cult_id) return;
    setIsLoading(true);

    try {
      // Cargar tareas asignadas
      const { data: assignedData } = await supabase
        .from("assigned_tasks")
        .select(`
          *,
          tasks(*),
          profiles!assigned_tasks_follower_id_fkey(display_name, avatar_url),
          rewards(name),
          punishments(name)
        `)
        .eq("assigned_by", user?.id)
        .order("created_at", { ascending: false });
      setTasks(assignedData || []);

      // Cargar biblioteca de tareas
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("cult_id", profile.cult_id)
        .order("created_at", { ascending: false });
      setTaskLibrary(tasksData || []);

      // Cargar premios activos
      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("*")
        .eq("cult_id", profile.cult_id)
        .eq("is_active", true)
        .order("name");
      setRewards(rewardsData || []);

      // Cargar consecuencias activas
      const { data: punishmentsData } = await supabase
        .from("punishments")
        .select("*")
        .eq("cult_id", profile.cult_id)
        .eq("is_active", true)
        .order("name");
      setPunishments(punishmentsData || []);

      // Cargar fieles del culto
      const { data: followersData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, timezone")
        .eq("cult_id", profile.cult_id)
        .eq("role", "follower")
        .order("display_name");
      setFollowers(followersData || []);

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const uploadEvidence = async (assignedTaskId: string, file: File) => {
    if (!user) return;
    setUploading(assignedTaskId);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${assignedTaskId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("task_evidence")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("task_evidence")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("assigned_tasks")
        .update({ evidence_url: urlData.publicUrl })
        .eq("id", assignedTaskId);

      if (updateError) throw updateError;

      toast({ title: "Evidencia subida" });
      loadData();
    } catch (error) {
      console.error("Error uploading evidence:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la evidencia",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const completeTask = async (assignedTaskId: string, faithPoints: number) => {
    if (!user || !profile?.cult_id) return;

    try {
      // Marcar como completada
      const { error: updateError } = await supabase
        .from("assigned_tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", assignedTaskId);

      if (updateError) throw updateError;

      // Añadir puntos de fe
      if (faithPoints > 0) {
        const { error: pointsError } = await supabase
          .from("profiles")
          .update({
            faith_points: (profile.faith_points || 0) + faithPoints,
          })
          .eq("id", user.id);

        if (pointsError) throw pointsError;

        // Registrar en el log
        await supabase.from("faith_points_log").insert({
          user_id: user.id,
          amount: faithPoints,
          reason: "Tarea completada",
        });
      }

      toast({
        title: "Tarea completada",
        description: faithPoints > 0 ? `Has ganado ${faithPoints} Puntos de Fe` : undefined,
      });

      loadData();
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "No se pudo completar la tarea",
        variant: "destructive",
      });
    }
  };

  const saveTask = async () => {
    if (!profile?.cult_id || !taskForm.title.trim() || selectedFollowers.length === 0) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos y seleccione al menos un fiel",
        variant: "destructive",
      });
      return;
    }

    // Validar fecha/hora según tipo de tarea
    if (taskForm.recurrence_type === "once" && !taskForm.due_date) {
      toast({
        title: "Error",
        description: "Las tareas únicas requieren fecha límite",
        variant: "destructive",
      });
      return;
    }

    if ((taskForm.recurrence_type === "daily" || taskForm.recurrence_type === "weekly") && !taskForm.time_limit) {
      toast({
        title: "Error",
        description: "Las tareas recurrentes requieren horario límite",
        variant: "destructive",
      });
      return;
    }

    if (taskForm.recurrence_type === "weekly" && taskForm.recurrence_days.length === 0) {
      toast({
        title: "Error",
        description: "Seleccione al menos un día de la semana",
        variant: "destructive",
      });
      return;
    }

    try {
      // Crear tarea en biblioteca si no existe
      const { data: newTask, error: taskError } = await supabase
        .from("tasks")
        .insert({
          cult_id: profile.cult_id,
          title: taskForm.title,
          description: taskForm.description || null,
          requires_evidence: taskForm.requires_evidence,
          recurrence_type: taskForm.recurrence_type,
          recurrence_days: taskForm.recurrence_type === "weekly" ? taskForm.recurrence_days : null,
          time_limit: taskForm.time_limit || null,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Asignar a cada fiel seleccionado
      const assignments = selectedFollowers.map((followerId) => {
        const follower = followers.find((f) => f.id === followerId);
        return {
          task_id: newTask.id,
          follower_id: followerId,
          assigned_by: user?.id,
          due_date: taskForm.recurrence_type === "once" ? taskForm.due_date : null,
          reward_id: taskForm.reward_id || null,
          reward_faith_points: taskForm.reward_faith_points || 0,
          punishment_id: taskForm.punishment_id || null,
          punishment_faith_points: taskForm.punishment_faith_points || 0,
          deity_timezone: profile.timezone || "UTC",
          follower_timezone: follower?.timezone || "UTC",
        };
      });

      const { error: assignError } = await supabase
        .from("assigned_tasks")
        .insert(assignments);

      if (assignError) throw assignError;

      toast({
        title: "Tarea asignada",
        description: `Asignada a ${selectedFollowers.length} fiel(es)`,
      });

      setShowTaskForm(false);
      setTaskForm({
        title: "",
        description: "",
        requires_evidence: false,
        recurrence_type: "once",
        recurrence_days: [],
        time_limit: "",
        due_date: "",
        reward_id: "",
        reward_faith_points: 0,
        punishment_id: "",
        punishment_faith_points: 0,
      });
      setSelectedFollowers([]);
      loadData();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la tarea",
        variant: "destructive",
      });
    }
  };

  const weekDays = [
    { value: 0, label: "Dom" },
    { value: 1, label: "Lun" },
    { value: 2, label: "Mar" },
    { value: 3, label: "Mié" },
    { value: 4, label: "Jue" },
    { value: 5, label: "Vie" },
    { value: 6, label: "Sáb" },
  ];

  const toggleWeekDay = (day: number) => {
    if (taskForm.recurrence_days.includes(day)) {
      setTaskForm({
        ...taskForm,
        recurrence_days: taskForm.recurrence_days.filter((d) => d !== day),
      });
    } else {
      setTaskForm({
        ...taskForm,
        recurrence_days: [...taskForm.recurrence_days, day].sort(),
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Tareas" icon={<CheckSquare className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Mis Tareas" icon={<CheckSquare className="w-5 h-5" />}>
      <BookPage pageKey="tareas">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">
              {profile?.role === "deity" ? "Gestión de Tareas" : "Mis Tareas"}
            </h1>
          </div>

          {/* Botón para crear tarea (solo deidades) */}
          {profile?.role === "deity" && !showTaskForm && (
            <div className="flex justify-center">
              <RitualButton variant="gold" onClick={() => setShowTaskForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Tarea
              </RitualButton>
            </div>
          )}

          {/* Formulario de crear tarea */}
          {showTaskForm && (
            <ParchmentCard title="Nueva Tarea" icon={<Plus className="w-4 h-4" />}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Título *</label>
                  <Input
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Título de la tarea"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Descripción</label>
                  <Textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Descripción detallada de la tarea..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Tipo de tarea *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTaskForm({ ...taskForm, recurrence_type: "once" })}
                      className={`p-3 rounded-sm border text-sm transition-all ${
                        taskForm.recurrence_type === "once"
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border/30 hover:border-gold/40"
                      }`}
                    >
                      Única
                    </button>
                    <button
                      onClick={() => setTaskForm({ ...taskForm, recurrence_type: "daily" })}
                      className={`p-3 rounded-sm border text-sm transition-all ${
                        taskForm.recurrence_type === "daily"
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border/30 hover:border-gold/40"
                      }`}
                    >
                      Diaria
                    </button>
                    <button
                      onClick={() => setTaskForm({ ...taskForm, recurrence_type: "weekly" })}
                      className={`p-3 rounded-sm border text-sm transition-all ${
                        taskForm.recurrence_type === "weekly"
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border/30 hover:border-gold/40"
                      }`}
                    >
                      Semanal
                    </button>
                  </div>
                </div>

                {taskForm.recurrence_type === "once" && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Fecha límite *</label>
                    <Input
                      type="datetime-local"
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    />
                  </div>
                )}

                {(taskForm.recurrence_type === "daily" || taskForm.recurrence_type === "weekly") && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Horario límite *</label>
                    <Input
                      type="time"
                      value={taskForm.time_limit}
                      onChange={(e) => setTaskForm({ ...taskForm, time_limit: e.target.value })}
                    />
                  </div>
                )}

                {taskForm.recurrence_type === "weekly" && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Días de la semana *</label>
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => toggleWeekDay(day.value)}
                          className={`p-2 rounded-sm border text-xs font-heading transition-all ${
                            taskForm.recurrence_days.includes(day.value)
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-border/30 hover:border-gold/40"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-sm">
                  <Checkbox
                    checked={taskForm.requires_evidence}
                    onCheckedChange={(checked) =>
                      setTaskForm({ ...taskForm, requires_evidence: checked as boolean })
                    }
                  />
                  <label className="text-sm text-foreground">Requiere evidencia fotográfica</label>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <h4 className="font-heading text-sm text-gold">Premio al completar</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Premio de la lista (opcional)</label>
                    <select
                      value={taskForm.reward_id}
                      onChange={(e) => setTaskForm({ ...taskForm, reward_id: e.target.value })}
                      className="w-full p-2 bg-background border border-border/30 rounded-sm text-sm"
                    >
                      <option value="">Sin premio de lista</option>
                      {rewards.map((reward) => (
                        <option key={reward.id} value={reward.id}>
                          {reward.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Puntos de Fe adicionales</label>
                    <Input
                      type="number"
                      value={taskForm.reward_faith_points}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, reward_faith_points: parseInt(e.target.value) || 0 })
                      }
                      min={0}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <h4 className="font-heading text-sm text-wine">Consecuencia si no completa</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Consecuencia de la lista (opcional)</label>
                    <select
                      value={taskForm.punishment_id}
                      onChange={(e) => setTaskForm({ ...taskForm, punishment_id: e.target.value })}
                      className="w-full p-2 bg-background border border-border/30 rounded-sm text-sm"
                    >
                      <option value="">Sin consecuencia de lista</option>
                      {punishments.map((punishment) => (
                        <option key={punishment.id} value={punishment.id}>
                          {punishment.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Puntos de Fe a quitar</label>
                    <Input
                      type="number"
                      value={taskForm.punishment_faith_points}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, punishment_faith_points: parseInt(e.target.value) || 0 })
                      }
                      min={0}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Asignar a *</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-border/30 rounded-sm">
                    {followers.map((follower) => (
                      <label key={follower.id} className="flex items-center gap-2 p-2 hover:bg-muted/20 rounded-sm cursor-pointer">
                        <Checkbox
                          checked={selectedFollowers.includes(follower.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFollowers([...selectedFollowers, follower.id]);
                            } else {
                              setSelectedFollowers(selectedFollowers.filter((id) => id !== follower.id));
                            }
                          }}
                        />
                        <span className="text-sm text-foreground">{follower.display_name || "Sin nombre"}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {follower.timezone || "UTC"}
                        </span>
                      </label>
                    ))}
                  </div>
                  {selectedFollowers.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedFollowers.length} fiel(es) seleccionado(s)
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <RitualButton variant="gold" onClick={saveTask} className="flex-1">
                    Asignar Tarea
                  </RitualButton>
                  <RitualButton
                    variant="outline"
                    onClick={() => {
                      setShowTaskForm(false);
                      setTaskForm({
                        title: "",
                        description: "",
                        requires_evidence: false,
                        recurrence_type: "once",
                        recurrence_days: [],
                        time_limit: "",
                        due_date: "",
                        reward_id: "",
                        reward_faith_points: 0,
                        punishment_id: "",
                        punishment_faith_points: 0,
                      });
                      setSelectedFollowers([]);
                    }}
                  >
                    Cancelar
                  </RitualButton>
                </div>
              </div>
            </ParchmentCard>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}