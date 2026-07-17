import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Loader2, Upload, CheckCircle2, Clock, Sparkles, Camera, Plus, AlertTriangle } from "lucide-react";
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
      if (profile.role === "deity") {
        // Cargar tareas asignadas por esta deidad
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
      } else {
        // Cargar tareas asignadas a este fiel
        const { data: assignedData } = await supabase
          .from("assigned_tasks")
          .select(`
            *,
            tasks(*),
            rewards(name),
            punishments(name)
          `)
          .eq("follower_id", user?.id)
          .order("created_at", { ascending: false });
        setTasks(assignedData || []);
      }

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

  const uploadEvidence = async (assignmentId: string, file: File) => {
    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato no válido",
        description: "Por favor sube una imagen (JPG, PNG, GIF, WebP o BMP)",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo permitido es 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(assignmentId);

    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user?.id}/${assignmentId}-${Date.now()}.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("task-evidence")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from("task-evidence")
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error("No se pudo obtener la URL del archivo");
      }

      // Actualizar la tarea con la URL de evidencia
      const { error: updateError } = await supabase
        .from("assigned_tasks")
        .update({ evidence_url: urlData.publicUrl })
        .eq("id", assignmentId);

      if (updateError) throw updateError;

      toast({
        title: "Evidencia subida",
        description: "La imagen se subió correctamente",
      });

      loadData();
    } catch (error: any) {
      console.error("Error uploading evidence:", error);
      toast({
        title: "Error al subir evidencia",
        description: error.message || "No se pudo subir el archivo. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const completeTask = async (assignedTaskId: string, faithPoints: number) => {
    if (!user || !profile?.cult_id) return;

    try {
      // Obtener la tarea asignada para saber quién la asignó
      const { data: taskData } = await supabase
        .from("assigned_tasks")
        .select("assigned_by")
        .eq("id", assignedTaskId)
        .single();

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
        const newBalance = (profile.faith_points || 0) + faithPoints;
        
        const { error: pointsError } = await supabase
          .from("profiles")
          .update({
            faith_points: newBalance,
          })
          .eq("id", user.id);

        if (pointsError) throw pointsError;

        // Registrar en el log con todos los campos requeridos
        await supabase.from("faith_points_log").insert({
          user_id: user.id,
          deity_id: taskData?.assigned_by || null,
          amount: faithPoints,
          balance_after: newBalance,
          reason: "Tarea completada",
          transaction_type: "grant",
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

          {/* Lista de tareas asignadas (solo deidades) */}
          {profile?.role === "deity" && tasks.length > 0 && (
            <ParchmentCard title="Tareas Asignadas" icon={<CheckSquare className="w-4 h-4" />}>
              <div className="space-y-3">
                {tasks.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 bg-background/50 rounded-sm border border-border/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-base text-foreground">
                          {assignment.tasks?.title || "Tarea"}
                        </h3>
                        {assignment.tasks?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {assignment.tasks.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 ${
                          assignment.status === "completed"
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : assignment.status === "failed"
                            ? "border-wine/40 bg-wine/10 text-wine"
                            : "border-border/40 bg-muted/10 text-muted-foreground"
                        }`}
                      >
                        {assignment.status === "completed" ? "Completada" : assignment.status === "failed" ? "Fallida" : "Pendiente"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Asignada a:</span>
                      <span className="text-sm text-foreground">
                        {assignment.profiles?.display_name || "Sin nombre"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Tipo: </span>
                        <span className="text-foreground">
                          {assignment.tasks?.recurrence_type === "once"
                            ? "Única"
                            : assignment.tasks?.recurrence_type === "daily"
                            ? "Diaria"
                            : "Semanal"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Límite: </span>
                        <span className="text-foreground">
                          {assignment.due_date
                            ? new Date(assignment.due_date).toLocaleString()
                            : assignment.tasks?.time_limit || "—"}
                        </span>
                      </div>
                    </div>

                    {(assignment.rewards || assignment.reward_faith_points > 0) && (
                      <div className="flex items-center gap-2 p-2 bg-gold/5 rounded-sm">
                        <Sparkles className="w-3 h-3 text-gold shrink-0" />
                        <span className="text-xs text-muted-foreground">Premio:</span>
                        <span className="text-xs text-foreground">
                          {assignment.rewards?.name}
                          {assignment.rewards?.name && assignment.reward_faith_points > 0 && " + "}
                          {assignment.reward_faith_points > 0 && `${assignment.reward_faith_points} Puntos de Fe`}
                        </span>
                      </div>
                    )}

                    {(assignment.punishments || assignment.punishment_faith_points > 0) && (
                      <div className="flex items-center gap-2 p-2 bg-wine/5 rounded-sm">
                        <AlertTriangle className="w-3 h-3 text-wine shrink-0" />
                        <span className="text-xs text-muted-foreground">Consecuencia:</span>
                        <span className="text-xs text-foreground">
                          {assignment.punishments?.name}
                          {assignment.punishments?.name && assignment.punishment_faith_points > 0 && " + "}
                          {assignment.punishment_faith_points > 0 && `-${assignment.punishment_faith_points} Puntos de Fe`}
                        </span>
                      </div>
                    )}

                    {assignment.evidence_url && (
                      <div className="flex items-center gap-2">
                        <Camera className="w-3 h-3 text-gold" />
                        <a
                          href={assignment.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gold hover:text-gold/80 transition-colors"
                        >
                          Ver evidencia
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ParchmentCard>
          )}

          {/* Lista de tareas del fiel */}
          {profile?.role === "follower" && tasks.length > 0 && (
            <ParchmentCard title="Mis Tareas" icon={<CheckSquare className="w-4 h-4" />}>
              <div className="space-y-3">
                {tasks.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 bg-background/50 rounded-sm border border-border/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-base text-foreground">
                          {assignment.tasks?.title || "Tarea"}
                        </h3>
                        {assignment.tasks?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {assignment.tasks.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 ${
                          assignment.status === "completed"
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : assignment.status === "failed"
                            ? "border-wine/40 bg-wine/10 text-wine"
                            : "border-border/40 bg-muted/10 text-muted-foreground"
                        }`}
                      >
                        {assignment.status === "completed" ? "Completada" : assignment.status === "failed" ? "Fallida" : "Pendiente"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {assignment.due_date
                          ? `Fecha límite: ${new Date(assignment.due_date).toLocaleString()}`
                          : assignment.tasks?.time_limit
                          ? `Horario límite: ${assignment.tasks.time_limit}`
                          : "Sin límite"}
                      </span>
                    </div>

                    {assignment.status === "pending" && (
                      <div className="space-y-2">
                        {assignment.tasks?.requires_evidence && !assignment.evidence_url && (
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">
                              Subir evidencia (requerida)
                            </label>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadEvidence(assignment.id, file);
                              }}
                              disabled={!!uploading}
                              className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 
                                         file:text-xs file:bg-silver/10 file:text-silver hover:file:bg-silver/20 
                                         file:cursor-pointer cursor-pointer"
                            />
                            <p className="text-[10px] text-muted-foreground">
                              Formatos: JPG, PNG, GIF, WebP, BMP • Máximo 10MB
                            </p>
                          </div>
                        )}
                        <RitualButton
                          variant="gold"
                          onClick={() => completeTask(assignment.id, assignment.reward_faith_points || 0)}
                          disabled={assignment.tasks?.requires_evidence && !assignment.evidence_url}
                          className="w-full"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Completar Tarea
                        </RitualButton>
                      </div>
                    )}

                    {assignment.evidence_url && (
                      <div className="flex items-center gap-2">
                        <Camera className="w-3 h-3 text-gold" />
                        <a
                          href={assignment.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gold hover:text-gold/80 transition-colors"
                        >
                          Ver evidencia subida
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ParchmentCard>
          )}

          {tasks.length === 0 && !showTaskForm && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {profile?.role === "deity" ? "No hay tareas asignadas" : "No tienes tareas pendientes"}
              </p>
            </div>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}