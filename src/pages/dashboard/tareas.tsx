import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Loader2, Upload, CheckCircle2, Clock, Sparkles, Camera } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  faith_points: number;
  requires_evidence: boolean;
  is_completed: boolean;
  completed_at: string | null;
  evidence_url: string | null;
}

export default function TareasPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    if (!user || !profile?.cult_id) return;

    try {
      const { data, error } = await supabase
        .from("assigned_tasks")
        .select("*, tasks(*)")
        .eq("follower_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      loadTasks();
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

      loadTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "No se pudo completar la tarea",
        variant: "destructive",
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

  const pendingTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);

  return (
    <AppLayout title="Mis Tareas" icon={<CheckSquare className="w-5 h-5" />}>
      <BookPage pageKey="tareas">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Tareas Asignadas</h1>
            <p className="font-body text-muted-foreground">
              {pendingTasks.length} pendiente{pendingTasks.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Tareas Pendientes */}
          {pendingTasks.length > 0 && (
            <ParchmentCard title="Por Completar" icon={<Clock className="w-4 h-4" />}>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-background/50 rounded-sm border border-border/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-base text-foreground mb-1">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="font-body text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                      </div>
                      {task.faith_points > 0 && (
                        <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                          +{task.faith_points} PF
                        </Badge>
                      )}
                    </div>

                    {task.requires_evidence && !task.evidence_url && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer w-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadEvidence(task.id, file);
                            }}
                            className="hidden"
                            disabled={uploading === task.id}
                          />
                          <div
                            className={`
                              w-full flex items-center justify-center gap-2 px-4 py-2.5
                              bg-background/80 border border-border/40 rounded-sm
                              font-heading text-sm tracking-wide uppercase
                              transition-all duration-200
                              ${uploading === task.id ? 'opacity-50 cursor-not-allowed' : 'hover:border-gold/60 hover:bg-background'}
                            `}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading === task.id ? "Subiendo..." : "Subir Evidencia"}
                          </div>
                        </label>
                        <p className="text-xs text-muted-foreground text-center">
                          Esta tarea requiere evidencia fotográfica
                        </p>
                      </div>
                    )}

                    {task.evidence_url && (
                      <div className="text-center">
                        <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                          Evidencia subida
                        </Badge>
                      </div>
                    )}

                    {(!task.requires_evidence || task.evidence_url) && (
                      <RitualButton
                        variant="gold"
                        onClick={() => completeTask(task.id, task.faith_points)}
                        className="w-full"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marcar como Completada
                      </RitualButton>
                    )}
                  </div>
                ))}
              </div>
            </ParchmentCard>
          )}

          {/* Tareas Completadas */}
          {completedTasks.length > 0 && (
            <ParchmentCard title="Completadas" icon={<CheckCircle2 className="w-4 h-4" />}>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-background/50 rounded-sm border border-border/30 opacity-60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-sm text-foreground line-through">
                          {task.title}
                        </h3>
                        {task.completed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Completada: {new Date(task.completed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {task.faith_points > 0 && (
                        <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                          +{task.faith_points} PF
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ParchmentCard>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground">No tienes tareas asignadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((at) => {
                const task = at.tasks;
                if (!task) return null;
                
                return (
                  <ParchmentCard key={at.id}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-heading text-lg text-foreground mb-1">{task.title}</h3>
                          {task.description && (
                            <p className="font-body text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                        <Badge
                          variant={at.status === "completed" || at.status === "verified" ? "default" : "outline"}
                          className="shrink-0"
                        >
                          {at.status === "completed" ? "Completada" : at.status === "verified" ? "Verificada" : "Pendiente"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.faith_points_reward > 0 && (
                          <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            +{task.faith_points_reward} PF
                          </Badge>
                        )}
                        {task.requires_evidence && (
                          <Badge variant="outline">
                            <Camera className="w-3 h-3 mr-1" />
                            Requiere evidencia
                          </Badge>
                        )}
                      </div>

                      {at.status === "pending" && (
                        <>
                          {task.requires_evidence && !at.evidence_url && (
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer w-full">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadEvidence(at.id, file);
                                  }}
                                  className="hidden"
                                  disabled={uploading === at.id}
                                />
                                <div
                                  className={`
                                    w-full flex items-center justify-center gap-2 px-4 py-2.5
                                    bg-background/80 border border-border/40 rounded-sm
                                    font-heading text-sm tracking-wide uppercase
                                    transition-all duration-200
                                    ${uploading === at.id ? 'opacity-50 cursor-not-allowed' : 'hover:border-gold/60 hover:bg-background'}
                                  `}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {uploading === at.id ? "Subiendo..." : "Subir Evidencia"}
                                </div>
                              </label>
                              <p className="text-xs text-muted-foreground text-center">
                                Esta tarea requiere evidencia fotográfica
                              </p>
                            </div>
                          )}

                          {at.evidence_url && (
                            <div className="p-2 bg-muted/20 rounded-sm border border-border/30">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                                <span className="text-xs text-muted-foreground">Evidencia subida</span>
                              </div>
                            </div>
                          )}

                          {(!task.requires_evidence || at.evidence_url) && (
                            <RitualButton
                              variant="gold"
                              onClick={() => completeTask(at.id, task.faith_points_reward)}
                              className="w-full"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marcar como Completada
                            </RitualButton>
                          )}
                        </>
                      )}

                      {at.completed_at && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          Completada: {new Date(at.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </ParchmentCard>
                );
              })}
            </div>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}