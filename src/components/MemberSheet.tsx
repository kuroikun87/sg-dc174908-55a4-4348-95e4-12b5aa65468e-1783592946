import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Sparkles,
  Heart,
  Calendar,
  Gift,
  AlertTriangle,
  Settings,
  Crown,
  Loader2,
  Star,
  Circle,
  CheckCircle2,
  Clock,
  Plus,
  CheckSquare,
  Trash2,
  Edit,
} from "lucide-react";

interface MemberSheetProps {
  memberId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface MemberData {
  id: string;
  full_name: string | null;
  display_name: string | null;
  nickname: string | null;
  title: string | null;
  bio: string | null;
  pronouns: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  role: "deity" | "follower" | null;
  faith_points: number;
  rank_id: string | null;
  cult_id: string | null;
  ranks: { name: string; level: number } | null;
}

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

interface Punishment {
  id: string;
  name: string;
  description: string | null;
  faith_points_cost: number;
}

export function MemberSheet({ memberId, isOpen, onClose }: MemberSheetProps) {
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const [member, setMember] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Datos asignados al fiel
  const [followerTasks, setFollowerTasks] = useState<any[]>([]);
  const [followerRewards, setFollowerRewards] = useState<any[]>([]);
  const [followerPunishments, setFollowerPunishments] = useState<any[]>([]);
  
  // Biblioteca de templates
  const [libraryTasks, setLibraryTasks] = useState<Task[]>([]);
  const [libraryRewards, setLibraryRewards] = useState<Reward[]>([]);
  const [libraryPunishments, setLibraryPunishments] = useState<Punishment[]>([]);
  
  const [events, setEvents] = useState<any[]>([]);
  const [fetishes, setFetishes] = useState<any[]>([]);
  const [faithLog, setFaithLog] = useState<any[]>([]);

  const [assignMode, setAssignMode] = useState<"library" | "custom">("library");
  const [rewardAssignMode, setRewardAssignMode] = useState<"library" | "custom">("library");
  const [punishmentAssignMode, setPunishmentAssignMode] = useState<"library" | "custom">("library");
  
  const [customTaskForm, setCustomTaskForm] = useState({
    title: "",
    description: "",
    faith_points: 0,
    requires_evidence: false,
  });

  const [customRewardForm, setCustomRewardForm] = useState({
    name: "",
    description: "",
  });

  const [customPunishmentForm, setCustomPunishmentForm] = useState({
    name: "",
    description: "",
    faith_points: 0,
  });

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    notes: "",
  });

  const isDeity = profile?.role === "deity";

  useEffect(() => {
    if (memberId && isOpen) {
      loadMemberData();
      if (isDeity) {
        loadLibrary();
      }
    }
  }, [memberId, isOpen, isDeity]);

  const loadLibrary = async () => {
    if (!profile?.cult_id) return;

    try {
      const [tasksRes, rewardsRes, punishmentsRes] = await Promise.all([
        supabase.from("tasks").select("*").eq("cult_id", profile.cult_id),
        supabase.from("rewards").select("*").eq("cult_id", profile.cult_id),
        supabase.from("punishments").select("*").eq("cult_id", profile.cult_id),
      ]);

      setLibraryTasks(tasksRes.data || []);
      setLibraryRewards(rewardsRes.data || []);
      setLibraryPunishments(punishmentsRes.data || []);
    } catch (error) {
      console.error("Error loading library:", error);
    }
  };

  const loadMemberData = async () => {
    if (!memberId) return;
    setIsLoading(true);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*, ranks(name, level)")
        .eq("id", memberId)
        .single();

      if (profileError) throw profileError;
      setMember(profileData);

      // Cargar tareas asignadas con JOIN
      const { data: tasksData } = await supabase
        .from("assigned_tasks")
        .select("*, tasks(*)")
        .eq("follower_id", memberId)
        .order("created_at", { ascending: false });
      setFollowerTasks(tasksData || []);

      // Cargar premios asignados con JOIN
      const { data: rewardsData } = await supabase
        .from("awarded_rewards")
        .select("*, rewards(*)")
        .eq("follower_id", memberId)
        .order("awarded_at", { ascending: false });
      setFollowerRewards(rewardsData || []);

      // Cargar consecuencias asignadas con JOIN
      const { data: punishmentsData } = await supabase
        .from("assigned_punishments")
        .select("*, punishments(*)")
        .eq("follower_id", memberId)
        .order("assigned_at", { ascending: false });
      setFollowerPunishments(punishmentsData || []);

      const { data: eventsData } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", memberId)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true, nullsFirst: false });
      setEvents(eventsData || []);

      const { data: fetishesData } = await supabase
        .from("fetish_ratings")
        .select("*, fetishes(*)")
        .eq("user_id", memberId);
      setFetishes(fetishesData || []);

      const { data: faithData } = await supabase
        .from("faith_points_log")
        .select("*")
        .eq("user_id", memberId)
        .order("created_at", { ascending: false })
        .limit(10);
      setFaithLog(faithData || []);

    } catch (error) {
      console.error("Error loading member data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del miembro",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const assignTaskFromLibrary = async (task: Task) => {
    if (!memberId || !profile?.cult_id) return;

    try {
      const { error } = await supabase.from("assigned_tasks").insert({
        task_id: task.id,
        follower_id: memberId,
        assigned_by: user?.id,
        status: "pending",
      });

      if (error) throw error;
      toast({ title: "Tarea asignada" });
      loadMemberData();
    } catch (error) {
      console.error("Error assigning task:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la tarea",
        variant: "destructive",
      });
    }
  };

  const assignCustomTask = async () => {
    if (!memberId || !profile?.cult_id || !customTaskForm.title.trim()) return;

    try {
      // Primero crear la tarea en tasks
      const { data: newTask, error: createError } = await supabase
        .from("tasks")
        .insert({
          cult_id: profile.cult_id,
          title: customTaskForm.title,
          description: customTaskForm.description || null,
          faith_points_reward: customTaskForm.faith_points,
          requires_evidence: customTaskForm.requires_evidence,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Luego asignarla en assigned_tasks
      const { error: assignError } = await supabase.from("assigned_tasks").insert({
        task_id: newTask.id,
        follower_id: memberId,
        assigned_by: user?.id,
        status: "pending",
      });

      if (assignError) throw assignError;

      toast({ title: "Tarea personalizada asignada" });
      setCustomTaskForm({ title: "", description: "", faith_points: 0, requires_evidence: false });
      loadMemberData();
    } catch (error) {
      console.error("Error assigning custom task:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la tarea personalizada",
        variant: "destructive",
      });
    }
  };

  const assignRewardFromLibrary = async (reward: Reward) => {
    if (!memberId || !profile?.cult_id) return;

    try {
      const { error } = await supabase.from("awarded_rewards").insert({
        reward_id: reward.id,
        follower_id: memberId,
        awarded_by: user?.id,
        is_redeemed: false,
      });

      if (error) throw error;
      toast({ title: "Premio asignado" });
      loadMemberData();
    } catch (error) {
      console.error("Error assigning reward:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el premio",
        variant: "destructive",
      });
    }
  };

  const assignCustomReward = async () => {
    if (!memberId || !profile?.cult_id || !customRewardForm.name.trim()) return;

    try {
      // Primero crear el premio en rewards
      const { data: newReward, error: createError } = await supabase
        .from("rewards")
        .insert({
          cult_id: profile.cult_id,
          name: customRewardForm.name,
          description: customRewardForm.description || null,
          faith_points_cost: 0,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Luego asignarlo en awarded_rewards
      const { error: assignError } = await supabase.from("awarded_rewards").insert({
        reward_id: newReward.id,
        follower_id: memberId,
        awarded_by: user?.id,
        is_redeemed: false,
      });

      if (assignError) throw assignError;

      toast({ title: "Premio personalizado asignado" });
      setCustomRewardForm({ name: "", description: "" });
      loadMemberData();
    } catch (error) {
      console.error("Error assigning custom reward:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el premio personalizado",
        variant: "destructive",
      });
    }
  };

  const assignPunishmentFromLibrary = async (punishment: Punishment) => {
    if (!memberId || !profile?.cult_id) return;

    try {
      const { error } = await supabase.from("assigned_punishments").insert({
        punishment_id: punishment.id,
        follower_id: memberId,
        assigned_by: user?.id,
        is_removed: false,
      });

      if (error) throw error;
      toast({ title: "Consecuencia asignada" });
      loadMemberData();
    } catch (error) {
      console.error("Error assigning punishment:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la consecuencia",
        variant: "destructive",
      });
    }
  };

  const assignCustomPunishment = async () => {
    if (!memberId || !profile?.cult_id || !customPunishmentForm.name.trim()) return;

    try {
      // Primero crear la consecuencia en punishments
      const { data: newPunishment, error: createError } = await supabase
        .from("punishments")
        .insert({
          cult_id: profile.cult_id,
          name: customPunishmentForm.name,
          description: customPunishmentForm.description || null,
          faith_points_cost: customPunishmentForm.faith_points,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Luego asignarla en assigned_punishments
      const { error: assignError } = await supabase.from("assigned_punishments").insert({
        punishment_id: newPunishment.id,
        follower_id: memberId,
        assigned_by: user?.id,
        is_removed: false,
      });

      if (assignError) throw assignError;

      toast({ title: "Consecuencia personalizada asignada" });
      setCustomPunishmentForm({ name: "", description: "", faith_points: 0 });
      loadMemberData();
    } catch (error) {
      console.error("Error assigning custom punishment:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la consecuencia personalizada",
        variant: "destructive",
      });
    }
  };

  const saveEvent = async () => {
    if (!memberId || !profile?.cult_id || !eventForm.title.trim() || !eventForm.date) return;

    try {
      if (editingEvent) {
        // Actualizar evento existente
        const { error } = await supabase
          .from("calendar_events")
          .update({
            title: eventForm.title,
            event_date: eventForm.date,
            event_time: eventForm.time || null,
            notes: eventForm.notes || null,
          })
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast({ title: "Evento actualizado" });
      } else {
        // Crear nuevo evento
        const { error } = await supabase.from("calendar_events").insert({
          user_id: memberId,
          title: eventForm.title,
          event_date: eventForm.date,
          event_time: eventForm.time || null,
          notes: eventForm.notes || null,
          created_by: user?.id,
        });

        if (error) throw error;
        toast({ title: "Evento creado" });
      }

      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({ title: "", date: "", time: "", notes: "" });
      loadMemberData();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el evento",
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm("¿Eliminar este evento?")) return;

    try {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      toast({ title: "Evento eliminado" });
      loadMemberData();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  const ratingLabels: Record<number, string> = {
    5: "Me encanta",
    4: "Me gusta",
    3: "Me da igual",
    2: "Límite blando",
    1: "Límite duro",
  };

  const ratingColors: Record<number, string> = {
    5: "text-gold",
    4: "text-green-400",
    3: "text-muted-foreground",
    2: "text-yellow-400",
    1: "text-wine",
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-background border-l border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        ) : member ? (
          <>
            <SheetHeader className="space-y-4 pb-6 border-b border-border/30">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 border-2 border-gold/30">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback className="bg-muted text-foreground font-display text-2xl">
                    {member.display_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="font-display text-2xl text-foreground">
                      {member.display_name || "Sin nombre"}
                    </SheetTitle>
                    {member.role === "deity" && <Crown className="w-5 h-5 text-wine" />}
                  </div>
                  <div className="space-y-1">
                    {member.title && (
                      <p className="font-heading text-sm text-gold">{member.title}</p>
                    )}
                    {member.nickname && (
                      <p className="font-body text-xs text-muted-foreground">
                        "{member.nickname}"
                      </p>
                    )}
                    {member.ranks && (
                      <Badge variant="outline" className="text-xs">
                        {member.ranks.name} (Nivel {member.ranks.level})
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 p-3 bg-gold/10 rounded-sm border border-gold/30">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="font-heading text-sm text-muted-foreground">
                  Puntos de Fe:
                </span>
                <span className="font-display text-xl text-gold">
                  {member.faith_points || 0}
                </span>
              </div>
            </SheetHeader>

            <Tabs defaultValue="info" className="mt-6">
              <TabsList className="grid w-full grid-cols-3 bg-muted/30">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="tasks">Tareas</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              {/* Tab: Información */}
              <TabsContent value="info" className="space-y-4">
                <ParchmentCard title="Información Personal" icon={<User className="w-4 h-4" />}>
                  <div className="space-y-3">
                    {member.bio && (
                      <div>
                        <p className="font-heading text-xs text-muted-foreground uppercase mb-1">Bio</p>
                        <p className="font-body text-sm text-foreground">{member.bio}</p>
                      </div>
                    )}
                    {member.pronouns && (
                      <div>
                        <p className="font-heading text-xs text-muted-foreground uppercase mb-1">Pronombres</p>
                        <p className="font-body text-sm text-foreground">{member.pronouns}</p>
                      </div>
                    )}
                    {member.birth_date && (
                      <div>
                        <p className="font-heading text-xs text-muted-foreground uppercase mb-1">Fecha de nacimiento</p>
                        <p className="font-body text-sm text-foreground">
                          {new Date(member.birth_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </ParchmentCard>

                <ParchmentCard title="Próximos Eventos" icon={<Calendar className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {events.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin eventos</p>
                    ) : (
                      events.map((event) => {
                        const eventDate = new Date(event.event_date);
                        return (
                          <div key={event.id} className="p-3 bg-background/50 rounded-sm border border-border/20">
                            <p className="font-heading text-sm text-foreground">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {eventDate.toLocaleDateString()}
                              {event.event_time && ` · ${event.event_time}`}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ParchmentCard>

                <ParchmentCard title="Historial de Fe" icon={<Sparkles className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {faithLog.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin movimientos</p>
                    ) : (
                      faithLog.map((log) => (
                        <div key={log.id} className="flex items-start justify-between p-2 bg-background/50 rounded-sm border border-border/20">
                          <div className="flex-1">
                            <p className="font-heading text-xs text-foreground">{log.reason || "—"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-mono text-xs ${log.amount > 0 ? "text-gold" : "text-wine"}`}>
                              {log.amount > 0 ? "+" : ""}{log.amount}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ParchmentCard>
              </TabsContent>

              {/* Tab: Tareas */}
              <TabsContent value="tasks" className="space-y-6">
                {/* Sección: Tareas Asignadas */}
                <div className="space-y-3">
                  <h3 className="font-heading text-sm text-gold uppercase tracking-wide">Tareas Asignadas</h3>
                  {followerTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay tareas asignadas
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {followerTasks.map((at) => (
                        <div key={at.id} className="p-3 bg-muted/20 rounded-sm border border-border/40">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-heading text-sm text-foreground">{at.tasks?.title || "Tarea eliminada"}</p>
                              {at.tasks?.description && (
                                <p className="text-xs text-muted-foreground mt-1">{at.tasks.description}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Badge variant={at.status === "completed" ? "default" : "outline"} className="text-xs">
                                  {at.status === "completed" ? "Completada" : at.status === "verified" ? "Verificada" : "Pendiente"}
                                </Badge>
                                {at.tasks?.faith_points_reward > 0 && (
                                  <Badge variant="outline" className="text-xs bg-gold/10 text-gold">
                                    +{at.tasks.faith_points_reward} PF
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {isDeity && at.status === "pending" && (
                              <button
                                onClick={() => {
                                  if (confirm("¿Eliminar esta tarea?")) {
                                    supabase.from("assigned_tasks").delete().eq("id", at.id).then(() => {
                                      toast({ title: "Tarea eliminada" });
                                      loadMemberData();
                                    });
                                  }
                                }}
                                className="p-1.5 text-muted-foreground/30 hover:text-wine transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isDeity && (
                  <>
                    <Separator className="bg-border/40" />

                    {/* Sección: Asignar Nueva Tarea */}
                    <div className="space-y-4">
                      <h3 className="font-heading text-sm text-gold uppercase tracking-wide">Asignar Nueva Tarea</h3>
                      
                      <div className="flex gap-2">
                        <RitualButton
                          variant={assignMode === "library" ? "gold" : "outline"}
                          onClick={() => setAssignMode("library")}
                          className="flex-1"
                        >
                          Biblioteca
                        </RitualButton>
                        <RitualButton
                          variant={assignMode === "custom" ? "gold" : "outline"}
                          onClick={() => setAssignMode("custom")}
                          className="flex-1"
                        >
                          Personalizada
                        </RitualButton>
                      </div>

                      {assignMode === "library" && (
                        <div className="space-y-3">
                          {libraryTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No hay tareas en la biblioteca
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                              {libraryTasks.map((task) => (
                                <div key={task.id} className="p-3 bg-background/60 rounded-sm border border-border/30 hover:border-gold/40 transition-colors">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="font-heading text-sm text-foreground">{task.title}</p>
                                      {task.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                      )}
                                      <div className="flex gap-2 mt-2">
                                        {task.faith_points_reward > 0 && (
                                          <Badge variant="outline" className="text-xs bg-gold/10 text-gold">
                                            +{task.faith_points_reward} PF
                                          </Badge>
                                        )}
                                        {task.requires_evidence && (
                                          <Badge variant="outline" className="text-xs">Requiere evidencia</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <RitualButton
                                      variant="outline"
                                      onClick={() => assignTaskFromLibrary(task)}
                                      className="shrink-0"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </RitualButton>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {assignMode === "custom" && (
                        <div className="space-y-3">
                          <Input
                            placeholder="Título de la tarea"
                            value={customTaskForm.title}
                            onChange={(e) => setCustomTaskForm({ ...customTaskForm, title: e.target.value })}
                          />
                          <Textarea
                            placeholder="Descripción (opcional)"
                            value={customTaskForm.description}
                            onChange={(e) => setCustomTaskForm({ ...customTaskForm, description: e.target.value })}
                            rows={3}
                          />
                          <Input
                            type="number"
                            placeholder="Puntos de Fe"
                            value={customTaskForm.faith_points}
                            onChange={(e) => setCustomTaskForm({ ...customTaskForm, faith_points: parseInt(e.target.value) || 0 })}
                          />
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customTaskForm.requires_evidence}
                              onChange={(e) => setCustomTaskForm({ ...customTaskForm, requires_evidence: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-foreground">Requiere evidencia fotográfica</span>
                          </label>
                          <RitualButton
                            variant="gold"
                            onClick={assignCustomTask}
                            disabled={!customTaskForm.title.trim()}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Asignar Tarea Personalizada
                          </RitualButton>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-border/40" />

                    {/* Sección: Premios Asignados */}
                    <div className="space-y-3">
                      <h3 className="font-heading text-sm text-gold uppercase tracking-wide">Premios Asignados</h3>
                      {followerRewards.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay premios asignados
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {followerRewards.map((ar) => (
                            <div key={ar.id} className="p-3 bg-muted/20 rounded-sm border border-border/40">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-heading text-sm text-foreground">{ar.rewards?.name || "Premio eliminado"}</p>
                                  {ar.rewards?.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{ar.rewards.description}</p>
                                  )}
                                  <Badge variant={ar.is_redeemed ? "outline" : "default"} className="text-xs mt-2">
                                    {ar.is_redeemed ? "Utilizado" : "Disponible"}
                                  </Badge>
                                </div>
                                {!ar.is_redeemed && (
                                  <button
                                    onClick={() => {
                                      if (confirm("¿Eliminar este premio?")) {
                                        supabase.from("awarded_rewards").delete().eq("id", ar.id).then(() => {
                                          toast({ title: "Premio eliminado" });
                                          loadMemberData();
                                        });
                                      }
                                    }}
                                    className="p-1.5 text-muted-foreground/30 hover:text-wine transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator className="bg-border/40" />

                    {/* Sección: Asignar Nuevo Premio */}
                    <div className="space-y-4">
                      <h3 className="font-heading text-sm text-gold uppercase tracking-wide">Asignar Nuevo Premio</h3>
                      
                      <div className="flex gap-2">
                        <RitualButton
                          variant={rewardAssignMode === "library" ? "gold" : "outline"}
                          onClick={() => setRewardAssignMode("library")}
                          className="flex-1"
                        >
                          Biblioteca
                        </RitualButton>
                        <RitualButton
                          variant={rewardAssignMode === "custom" ? "gold" : "outline"}
                          onClick={() => setRewardAssignMode("custom")}
                          className="flex-1"
                        >
                          Personalizado
                        </RitualButton>
                      </div>

                      {rewardAssignMode === "library" && (
                        <div className="space-y-3">
                          {libraryRewards.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No hay premios en la biblioteca
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                              {libraryRewards.map((reward) => (
                                <div key={reward.id} className="p-3 bg-background/60 rounded-sm border border-border/30 hover:border-gold/40 transition-colors">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="font-heading text-sm text-foreground">{reward.name}</p>
                                      {reward.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{reward.description}</p>
                                      )}
                                      {reward.faith_points_cost > 0 && (
                                        <Badge variant="outline" className="text-xs bg-gold/10 text-gold mt-2">
                                          {reward.faith_points_cost} PF
                                        </Badge>
                                      )}
                                    </div>
                                    <RitualButton
                                      variant="outline"
                                      onClick={() => assignRewardFromLibrary(reward)}
                                      className="shrink-0"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </RitualButton>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {rewardAssignMode === "custom" && (
                        <div className="space-y-3">
                          <Input
                            placeholder="Nombre del premio"
                            value={customRewardForm.name}
                            onChange={(e) => setCustomRewardForm({ ...customRewardForm, name: e.target.value })}
                          />
                          <Textarea
                            placeholder="Descripción (opcional)"
                            value={customRewardForm.description}
                            onChange={(e) => setCustomRewardForm({ ...customRewardForm, description: e.target.value })}
                            rows={3}
                          />
                          <RitualButton
                            variant="gold"
                            onClick={assignCustomReward}
                            disabled={!customRewardForm.name.trim()}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Asignar Premio Personalizado
                          </RitualButton>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-border/40" />

                    {/* Sección: Consecuencias Asignadas */}
                    <div className="space-y-3">
                      <h3 className="font-heading text-sm text-gold uppercase tracking-wide">Consecuencias Asignadas</h3>
                      {followerPunishments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay consecuencias asignadas
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {followerPunishments.map((ap) => (
                            <div key={ap.id} className="p-3 bg-muted/20 rounded-sm border border-border/40">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-heading text-sm text-foreground">{ap.punishments?.name || "Consecuencia eliminada"}</p>
                                  {ap.punishments?.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{ap.punishments.description}</p>
                                  )}
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant={ap.is_removed ? "outline" : "default"} className="text-xs">
                                      {ap.is_removed ? "Cumplida" : "Activa"}
                                    </Badge>
                                    {ap.punishments?.faith_points_cost > 0 && (
                                      <Badge variant="outline" className="text-xs bg-wine/20 text-wine">
                                        {ap.punishments.faith_points_cost} PF para quitar
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {!ap.is_removed && (
                                  <button
                                    onClick={() => {
                                      if (confirm("¿Eliminar esta consecuencia?")) {
                                        supabase.from("assigned_punishments").delete().eq("id", ap.id).then(() => {
                                          toast({ title: "Consecuencia eliminada" });
                                          loadMemberData();
                                        });
                                      }
                                    }}
                                    className="p-1.5 text-muted-foreground/30 hover:text-wine transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator className="bg-border/40" />

                    {/* Sección: Asignar Nueva Consecuencia */}
                    <div className="space-y-4">
                      <h3 className="font-heading text-sm text-gold uppercase tracking-wide">Asignar Nueva Consecuencia</h3>
                      
                      <div className="flex gap-2">
                        <RitualButton
                          variant={punishmentAssignMode === "library" ? "gold" : "outline"}
                          onClick={() => setPunishmentAssignMode("library")}
                          className="flex-1"
                        >
                          Biblioteca
                        </RitualButton>
                        <RitualButton
                          variant={punishmentAssignMode === "custom" ? "gold" : "outline"}
                          onClick={() => setPunishmentAssignMode("custom")}
                          className="flex-1"
                        >
                          Personalizada
                        </RitualButton>
                      </div>

                      {punishmentAssignMode === "library" && (
                        <div className="space-y-3">
                          {libraryPunishments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No hay consecuencias en la biblioteca
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                              {libraryPunishments.map((punishment) => (
                                <div key={punishment.id} className="p-3 bg-background/60 rounded-sm border border-border/30 hover:border-gold/40 transition-colors">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="font-heading text-sm text-foreground">{punishment.name}</p>
                                      {punishment.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{punishment.description}</p>
                                      )}
                                      {punishment.faith_points_cost > 0 && (
                                        <Badge variant="outline" className="text-xs bg-wine/20 text-wine mt-2">
                                          {punishment.faith_points_cost} PF para quitar
                                        </Badge>
                                      )}
                                    </div>
                                    <RitualButton
                                      variant="outline"
                                      onClick={() => assignPunishmentFromLibrary(punishment)}
                                      className="shrink-0"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </RitualButton>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {punishmentAssignMode === "custom" && (
                        <div className="space-y-3">
                          <Input
                            placeholder="Nombre de la consecuencia"
                            value={customPunishmentForm.name}
                            onChange={(e) => setCustomPunishmentForm({ ...customPunishmentForm, name: e.target.value })}
                          />
                          <Textarea
                            placeholder="Descripción (opcional)"
                            value={customPunishmentForm.description}
                            onChange={(e) => setCustomPunishmentForm({ ...customPunishmentForm, description: e.target.value })}
                            rows={3}
                          />
                          <Input
                            type="number"
                            placeholder="Puntos de Fe para quitar"
                            value={customPunishmentForm.faith_points}
                            onChange={(e) => setCustomPunishmentForm({ ...customPunishmentForm, faith_points: parseInt(e.target.value) || 0 })}
                          />
                          <RitualButton
                            variant="gold"
                            onClick={assignCustomPunishment}
                            disabled={!customPunishmentForm.name.trim()}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Asignar Consecuencia Personalizada
                          </RitualButton>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Tab: Notas */}
              <TabsContent value="notes" className="space-y-4">
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sección de notas próximamente
                </p>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No se pudo cargar la información</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}