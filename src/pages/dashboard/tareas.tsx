import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Plus, Trash2, Loader2, Settings } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  faith_points: number;
  status: "pending" | "completed";
  assigned_to: string;
  assigned_by: string;
  created_at: string;
}

export default function TareasPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskFaithPoints, setNewTaskFaithPoints] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar las tareas: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setTasks(data || []);
    }
    setIsLoading(false);
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "pending" ? "completed" : "pending";

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: newStatus === "completed" ? "Tarea completada" : "Tarea reactivada",
        description: newStatus === "completed" 
          ? `Has completado: ${task.title}` 
          : `Tarea marcada como pendiente`,
      });
      loadTasks();
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    const { error } = await supabase.from("tasks").insert({
      title: newTaskTitle,
      description: newTaskDescription || null,
      faith_points: newTaskFaithPoints,
      status: "pending",
      assigned_to: user.id,
      assigned_by: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear la tarea: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Tarea creada",
        description: `${newTaskTitle} ha sido asignada.`,
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskFaithPoints(0);
      setShowForm(false);
      loadTasks();
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido borrada.",
      });
      loadTasks();
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Tareas" icon={<Settings className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <AppLayout title="Tareas" icon={<Settings className="w-5 h-5" />}>
      <BookPage pageKey="tareas">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Mis Tareas</h1>
            <p className="font-body text-muted-foreground">
              Asignaciones y rituales pendientes
            </p>
          </div>

          {/* Tareas pendientes */}
          <ParchmentCard title="Pendientes" icon={<Circle className="w-4 h-4" />}>
            <div className="space-y-2">
              {pendingTasks.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center py-4">
                  No hay tareas pendientes
                </p>
              ) : (
                pendingTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-background/50 rounded-sm border border-border/30"
                  >
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="p-1 text-muted-foreground hover:text-gold transition-colors"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-heading text-sm text-foreground">{task.title}</h3>
                      {task.description && (
                        <p className="font-body text-xs text-muted-foreground">{task.description}</p>
                      )}
                      {task.faith_points > 0 && (
                        <span className="inline-block px-2 py-0.5 bg-gold/20 text-gold text-xs font-heading rounded-sm">
                          +{task.faith_points} PF
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </ParchmentCard>

          {/* Tareas completadas */}
          {completedTasks.length > 0 && (
            <ParchmentCard title="Completadas" icon={<CheckCircle2 className="w-4 h-4" />}>
              <div className="space-y-2">
                {completedTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-background/30 rounded-sm border border-border/20 opacity-60"
                  >
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="p-1 text-gold"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-heading text-sm text-foreground line-through">{task.title}</h3>
                      {task.faith_points > 0 && (
                        <span className="inline-block px-2 py-0.5 bg-gold/20 text-gold text-xs font-heading rounded-sm">
                          +{task.faith_points} PF
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </ParchmentCard>
          )}

          {/* Formulario para agregar tarea (solo para deidades) */}
          {profile?.role === "deity" && (
            <ParchmentCard title="Nueva Tarea" icon={<Plus className="w-4 h-4" />}>
              {!showForm ? (
                <RitualButton
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Tarea
                </RitualButton>
              ) : (
                <form onSubmit={addTask} className="space-y-4">
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Título
                    </label>
                    <input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      required
                      placeholder="Ej: Meditar 10 minutos"
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Detalles adicionales..."
                      rows={2}
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Puntos de Fe
                    </label>
                    <input
                      type="number"
                      value={newTaskFaithPoints}
                      onChange={(e) => setNewTaskFaithPoints(parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <RitualButton type="submit" variant="gold" className="flex-1">
                      Guardar
                    </RitualButton>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </ParchmentCard>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}