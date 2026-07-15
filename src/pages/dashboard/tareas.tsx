import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Loader2, Upload, CheckCircle2, Clock } from "lucide-react";

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
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("follower_tasks")
        .select("*")
        .eq("follower_id", user.id)
        .order("is_completed", { ascending: true })
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

  const uploadEvidence = async (taskId: string, file: File) => {
    if (!user || !profile?.cult_id) return;

    setUploading(taskId);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${taskId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("task-evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("task-evidence")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("follower_tasks")
        .update({ evidence_url: urlData.publicUrl })
        .eq("id", taskId);

      if (updateError) throw updateError;

      toast({ title: "Evidencia subida correctamente" });
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

  const completeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("follower_tasks")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (error) throw error;

      toast({ title: "Tarea completada" });
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
                        onClick={() => completeTask(task.id)}
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

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground">
                No tienes tareas asignadas
              </p>
            </div>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}