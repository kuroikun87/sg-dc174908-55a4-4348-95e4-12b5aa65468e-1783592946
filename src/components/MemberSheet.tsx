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
  Lock,
  Unlock,
  HeartCrack,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

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
  title_locked_until: string | null;
  title_locked_by: string | null;
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
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [lockDuration, setLockDuration] = useState<"permanent" | "temporary">("permanent");
  const [lockHours, setLockHours] = useState(24);
  const [lockDays, setLockDays] = useState(0);
  const [lockMinutes, setLockMinutes] = useState(0);
  
  const [faithPointsAdjustment, setFaithPointsAdjustment] = useState(0);
  const [faithReason, setFaithReason] = useState("");
  const [showFaithDialog, setShowFaithDialog] = useState(false);
  
  const [favorPoints, setFavorPoints] = useState<any[]>([]);
  const [myFavorRating, setMyFavorRating] = useState(50);
  const [showAllFavor, setShowAllFavor] = useState(false);
  const [isAdjustingFavor, setIsAdjustingFavor] = useState(false);
  
  const [faithPoints, setFaithPoints] = useState(0);
  const [isAdjustingFaith, setIsAdjustingFaith] = useState(false);

  const isDeity = profile?.role === "deity";

  useEffect(() => {
    if (memberId && isOpen) {
      loadMemberData();
      if (isDeity) {
        loadLibrary();
      }
    }
  }, [memberId, isOpen, isDeity]);

  useEffect(() => {
    if (member) {
      setTitleInput(member.title || "");
    }
  }, [member]);

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

      const { data: eventsData, error: eventsError } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", memberId)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true, nullsFirst: false });
      
      console.log("Eventos cargados para memberId:", memberId, eventsData);
      if (eventsError) console.error("Error cargando eventos:", eventsError);
      setEvents(eventsData || []);

      // Forzar actualización del calendario
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()));

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

      // Cargar puntos de favor
      if (isDeity) {
        const { data: favorData } = await supabase
          .from("favor_points")
          .select("*, profiles!favor_points_deity_id_fkey(display_name, avatar_url)")
          .eq("follower_id", memberId);
        setFavorPoints(favorData || []);

        // Encontrar mi rating de favor
        const myRating = favorData?.find((f) => f.deity_id === user?.id);
        if (myRating) {
          setMyFavorRating(myRating.points);
        } else {
          // Crear rating inicial si no existe
          const { data: newRating } = await supabase
            .from("favor_points")
            .insert({
              deity_id: user?.id,
              follower_id: memberId,
              points: 50,
            })
            .select()
            .single();
          if (newRating) {
            setMyFavorRating(50);
            setFavorPoints([...(favorData || []), newRating]);
          }
        }
      }

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
          })
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast({ title: "Evento actualizado" });
      } else {
        // Crear nuevo evento
        const { data, error } = await supabase.from("calendar_events").insert({
          user_id: memberId,
          title: eventForm.title,
          event_type: "event",
          event_date: eventForm.date,
          event_time: eventForm.time || null,
          created_by: user?.id,
        }).select();

        console.log("Evento creado:", data, "Error:", error);
        if (error) throw error;
        toast({ title: "Evento creado" });
      }

      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({ title: "", date: "", time: "" });
      
      // Pequeño delay para asegurar que la base de datos haya propagado el cambio
      await new Promise(resolve => setTimeout(resolve, 100));
      await loadMemberData();
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

  // Helpers para el calendario
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getMonthEvents = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return events.filter((event) => {
      const eventDate = new Date(event.event_date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    const dayEvents = events.filter((event) => event.event_date === dateStr);
    // Ordenar por hora (event_time) - los que no tienen hora van al final
    dayEvents.sort((a, b) => {
      if (!a.event_time && !b.event_time) return 0;
      if (!a.event_time) return 1;
      if (!b.event_time) return -1;
      return a.event_time.localeCompare(b.event_time);
    });
    console.log("getEventsForDay:", dateStr, "eventos encontrados:", dayEvents.length, dayEvents);
    return dayEvents;
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const updateTitle = async () => {
    if (!memberId || !isDeity) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ title: titleInput.trim() || null })
        .eq("id", memberId);

      if (error) throw error;
      toast({ title: "Título actualizado" });
      setIsEditingTitle(false);
      loadMemberData();
    } catch (error) {
      console.error("Error updating title:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el título",
        variant: "destructive",
      });
    }
  };

  const lockTitle = async () => {
    if (!memberId || !user?.id) return;

    try {
      let lockedUntil = null;
      if (lockDuration === "temporary") {
        const totalMinutes = lockDays * 24 * 60 + lockHours * 60 + lockMinutes;
        lockedUntil = new Date(Date.now() + totalMinutes * 60 * 1000).toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          title_locked_until: lockedUntil,
          title_locked_by: user.id,
        })
        .eq("id", memberId);

      if (error) throw error;
      toast({ title: lockDuration === "permanent" ? "Título bloqueado permanentemente" : "Título bloqueado temporalmente" });
      setShowLockDialog(false);
      loadMemberData();
    } catch (error) {
      console.error("Error locking title:", error);
      toast({
        title: "Error",
        description: "No se pudo bloquear el título",
        variant: "destructive",
      });
    }
  };

  const unlockTitle = async () => {
    if (!memberId) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          title_locked_until: null,
          title_locked_by: null,
        })
        .eq("id", memberId);

      if (error) throw error;
      toast({ title: "Título desbloqueado" });
      loadMemberData();
    } catch (error) {
      console.error("Error unlocking title:", error);
      toast({
        title: "Error",
        description: "No se pudo desbloquear el título",
        variant: "destructive",
      });
    }
  };

  const adjustFaithPoints = async (delta: number, reason: string) => {
    if (!memberId || !isDeity || delta === 0) return;

    const newTotal = (member?.faith_points || 0) + delta;
    if (newTotal < 0) {
      toast({
        title: "Error",
        description: "Los puntos de fe no pueden ser negativos",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ faith_points: newTotal })
        .eq("id", memberId);

      if (updateError) throw updateError;

      // Registrar en el log
      await supabase.from("faith_points_log").insert({
        user_id: memberId,
        deity_id: user?.id,
        amount: delta,
        balance_after: newTotal,
        reason: reason || (delta > 0 ? "Concedido por deidad" : "Revocado por deidad"),
        transaction_type: delta > 0 ? "grant" : "revoke",
      });

      toast({ 
        title: delta > 0 ? "Puntos concedidos" : "Puntos revocados",
        description: `${delta > 0 ? "+" : ""}${delta} Puntos de Fe`
      });
      
      setShowFaithDialog(false);
      setFaithPointsAdjustment(0);
      setFaithReason("");
      loadMemberData();
    } catch (error) {
      console.error("Error adjusting faith points:", error);
      toast({
        title: "Error",
        description: "No se pudieron ajustar los puntos de fe",
        variant: "destructive",
      });
    }
  };

  const updateFavorPoints = async (newValue: number) => {
    if (!memberId || !user?.id || !isDeity) return;

    try {
      setIsAdjustingFavor(true);
      
      const { error } = await supabase
        .from("favor_points")
        .update({ points: newValue, updated_at: new Date().toISOString() })
        .eq("deity_id", user.id)
        .eq("follower_id", memberId);

      if (error) throw error;

      setMyFavorRating(newValue);
      toast({ title: "Puntos de favor actualizados" });
      
      // Recargar favor points
      const { data: favorData } = await supabase
        .from("favor_points")
        .select("*, profiles!favor_points_deity_id_fkey(display_name, avatar_url)")
        .eq("follower_id", memberId);
      setFavorPoints(favorData || []);
    } catch (error) {
      console.error("Error updating favor points:", error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los puntos de favor",
        variant: "destructive",
      });
    } finally {
      setIsAdjustingFavor(false);
    }
  };

  const isTitleLocked = member?.title_locked_until 
    ? new Date(member.title_locked_until) > new Date() 
    : false;
  const canUnlockTitle = member?.title_locked_by === user?.id || !member?.title_locked_by;

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
                    {member.nickname && (
                      <p className="font-body text-xs text-muted-foreground">
                        "{member.nickname}"
                      </p>
                    )}
                    
                    {/* Título editable con lock */}
                    {isDeity && (
                      <div className="flex items-center gap-2">
                        {isEditingTitle ? (
                          <div className="flex items-center gap-1 flex-1">
                            <Input
                              value={titleInput}
                              onChange={(e) => setTitleInput(e.target.value)}
                              placeholder="Título..."
                              className="h-7 text-xs"
                              disabled={isTitleLocked}
                            />
                            <button
                              onClick={updateTitle}
                              className="p-1 text-gold hover:text-gold/80 transition-colors"
                              disabled={isTitleLocked}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingTitle(false);
                                setTitleInput(member.title || "");
                              }}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => !isTitleLocked && setIsEditingTitle(true)}
                              className={`font-heading text-sm text-gold flex items-center gap-1 ${isTitleLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-gold/80'}`}
                              disabled={isTitleLocked}
                            >
                              {member.title || "Sin título"}
                              {!isTitleLocked && <Edit className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => {
                                if (isTitleLocked && canUnlockTitle) {
                                  unlockTitle();
                                } else if (!isTitleLocked) {
                                  setShowLockDialog(true);
                                }
                              }}
                              className={`p-1 transition-colors ${
                                isTitleLocked 
                                  ? canUnlockTitle ? "text-wine hover:text-wine/80" : "text-muted-foreground/30 cursor-not-allowed"
                                  : "text-muted-foreground hover:text-gold"
                              }`}
                              disabled={isTitleLocked && !canUnlockTitle}
                              title={
                                isTitleLocked 
                                  ? canUnlockTitle 
                                    ? "Desbloquear título" 
                                    : "Solo la deidad que bloqueó puede desbloquear"
                                  : "Bloquear título"
                              }
                            >
                              {isTitleLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    
                    {!isDeity && member.title && (
                      <p className="font-heading text-sm text-gold">{member.title}</p>
                    )}
                    
                    {member.ranks && (
                      <Badge variant="outline" className="text-xs">
                        {member.ranks.name} (Nivel {member.ranks.level})
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Puntos de Fe (solo para deidades) */}
              {isDeity && (
                <div className="space-y-3 p-4 bg-muted/20 rounded-sm border border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold" />
                      <span className="font-heading text-sm text-foreground">Puntos de Fe</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl text-gold">
                        {member.faith_points || 0}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setShowFaithDialog(true)}
                          className="p-1.5 bg-gold/20 hover:bg-gold/30 rounded-sm border border-gold/40 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gold" />
                        </button>
                        <button
                          onClick={() => {
                            setFaithPointsAdjustment(-1);
                            setShowFaithDialog(true);
                          }}
                          className="p-1.5 bg-wine/20 hover:bg-wine/30 rounded-sm border border-wine/40 transition-colors"
                        >
                          <svg className="w-4 h-4 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Puntos de Favor (solo para deidades) */}
              {isDeity && (
                <div className="space-y-2 p-4 bg-muted/20 rounded-sm border border-border/30">
                  <button
                    onClick={() => setShowAllFavor(!showAllFavor)}
                    className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-wine" />
                      <span className="font-heading text-sm text-foreground">Puntos de Favor</span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-muted-foreground transition-transform ${showAllFavor ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Mi rating de favor (siempre visible) */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Mi valoración</span>
                      <span className="font-mono text-sm text-foreground">{myFavorRating} / 100</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HeartCrack className="w-4 h-4 text-wine/60 shrink-0" />
                      <Slider
                        value={[myFavorRating]}
                        onValueChange={([val]) => setMyFavorRating(val)}
                        onValueCommit={([val]) => updateFavorPoints(val)}
                        max={100}
                        step={1}
                        className="flex-1"
                        disabled={isAdjustingFavor}
                      />
                      <Heart className="w-4 h-4 text-gold shrink-0" />
                    </div>
                  </div>

                  {/* Otras deidades (desplegable) */}
                  {showAllFavor && favorPoints.filter((f) => f.deity_id !== user?.id).length > 0 && (
                    <div className="pt-3 border-t border-border/30 space-y-3">
                      <p className="text-xs text-muted-foreground">Valoraciones de otras deidades</p>
                      {favorPoints
                        .filter((f) => f.deity_id !== user?.id)
                        .map((favor) => (
                          <div key={favor.id} className="space-y-2 p-2 bg-background/50 rounded-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={favor.profiles?.avatar_url || undefined} />
                                  <AvatarFallback className="text-[10px]">
                                    {favor.profiles?.display_name?.[0] || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-foreground">
                                  {favor.profiles?.display_name || "Deidad"}
                                </span>
                              </div>
                              <span className="font-mono text-xs text-muted-foreground">
                                {favor.points} / 100
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <HeartCrack className="w-3 h-3 text-wine/60 shrink-0" />
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-wine via-gold/50 to-gold transition-all"
                                  style={{ width: `${favor.points}%` }}
                                />
                              </div>
                              <Heart className="w-3 h-3 text-gold shrink-0" />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Display de puntos para fieles */}
              {!isDeity && (
                <div className="flex items-center justify-center gap-2 p-3 bg-gold/10 rounded-sm border border-gold/30">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span className="font-heading text-sm text-muted-foreground">
                    Puntos de Fe:
                  </span>
                  <span className="font-display text-xl text-gold">
                    {member.faith_points || 0}
                  </span>
                </div>
              )}
            </SheetHeader>

            {/* Dialog para ajustar puntos de fe */}
            {showFaithDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFaithDialog(false)}>
                <div className="bg-background border border-border rounded-sm p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-heading text-lg text-foreground mb-4">
                    {faithPointsAdjustment >= 0 ? "Conceder" : "Revocar"} Puntos de Fe
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Cantidad</label>
                      <Input
                        type="number"
                        value={Math.abs(faithPointsAdjustment)}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setFaithPointsAdjustment(faithPointsAdjustment < 0 ? -Math.abs(val) : Math.abs(val));
                        }}
                        placeholder="0"
                        min={0}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Motivo (opcional)</label>
                      <Textarea
                        value={faithReason}
                        onChange={(e) => setFaithReason(e.target.value)}
                        placeholder="Ej: Completó todas las tareas del mes"
                        rows={3}
                      />
                    </div>

                    <div className="p-3 bg-muted/20 rounded-sm">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total actual:</span>
                        <span className="font-mono text-foreground">{member?.faith_points || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Cambio:</span>
                        <span className={`font-mono ${faithPointsAdjustment >= 0 ? 'text-gold' : 'text-wine'}`}>
                          {faithPointsAdjustment >= 0 ? '+' : ''}{faithPointsAdjustment}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1 pt-2 border-t border-border/30">
                        <span className="text-foreground font-heading">Nuevo total:</span>
                        <span className="font-mono font-bold text-foreground">
                          {(member?.faith_points || 0) + faithPointsAdjustment}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <RitualButton
                        variant={faithPointsAdjustment >= 0 ? "gold" : "outline"}
                        onClick={() => adjustFaithPoints(faithPointsAdjustment, faithReason)}
                        className="flex-1"
                        disabled={faithPointsAdjustment === 0}
                      >
                        {faithPointsAdjustment >= 0 ? "Conceder" : "Revocar"}
                      </RitualButton>
                      <RitualButton
                        variant="outline"
                        onClick={() => {
                          setShowFaithDialog(false);
                          setFaithPointsAdjustment(0);
                          setFaithReason("");
                        }}
                      >
                        Cancelar
                      </RitualButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dialog para configurar lock del título */}
            {showLockDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLockDialog(false)}>
                <div className="bg-background border border-border rounded-sm p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-heading text-lg text-foreground mb-4">Bloquear Título</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={lockDuration === "permanent"}
                          onChange={() => setLockDuration("permanent")}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">Permanente (hasta que yo lo desbloquee)</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={lockDuration === "temporary"}
                          onChange={() => setLockDuration("temporary")}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">Temporal</span>
                      </label>
                    </div>

                    {lockDuration === "temporary" && (
                      <div className="pl-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={lockDays}
                            onChange={(e) => setLockDays(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20"
                            min={0}
                          />
                          <span className="text-sm text-muted-foreground">días</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={lockHours}
                            onChange={(e) => setLockHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                            className="w-20"
                            min={0}
                            max={23}
                          />
                          <span className="text-sm text-muted-foreground">horas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={lockMinutes}
                            onChange={(e) => setLockMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                            className="w-20"
                            min={0}
                            max={59}
                          />
                          <span className="text-sm text-muted-foreground">minutos</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <RitualButton
                        variant="gold"
                        onClick={lockTitle}
                        className="flex-1"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Bloquear
                      </RitualButton>
                      <RitualButton
                        variant="outline"
                        onClick={() => setShowLockDialog(false)}
                      >
                        Cancelar
                      </RitualButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

                {/* Calendario */}
                {isDeity && (
                  <ParchmentCard title="Calendario" icon={<Calendar className="w-4 h-4" />}>
                    <div className="space-y-4">
                      {/* Navegación de mes */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={previousMonth}
                          className="p-2 hover:bg-muted/30 rounded-sm transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <h3 className="font-heading text-lg text-foreground">
                          {currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                        </h3>
                        <button
                          onClick={nextMonth}
                          className="p-2 hover:bg-muted/30 rounded-sm transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Días de la semana */}
                      <div className="grid grid-cols-7 gap-1">
                        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                          <div
                            key={day}
                            className="text-center font-heading text-xs text-muted-foreground uppercase py-2"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Grid de días del mes */}
                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((day, index) => {
                          const dayEvents = getEventsForDay(day);
                          const isSelected = isSameDay(day, selectedDate);
                          const isToday = day && isSameDay(day, new Date());

                          return (
                            <button
                              key={index}
                              onClick={() => {
                                if (day) {
                                  setSelectedDate(day);
                                  const dateStr = day.toISOString().split("T")[0];
                                  setEventForm({ ...eventForm, date: dateStr });
                                  setShowEventForm(true);
                                  setEditingEvent(null);
                                }
                              }}
                              disabled={!day}
                              className={`
                                aspect-square p-1 rounded-sm border transition-all relative
                                ${!day ? "invisible" : ""}
                                ${isSelected ? "border-gold bg-gold/10" : "border-border/30 hover:border-gold/40"}
                                ${isToday && !isSelected ? "border-gold/60" : ""}
                                ${dayEvents.length > 0 ? "bg-muted/20" : "bg-background/50"}
                              `}
                            >
                              {day && (
                                <>
                                  <span className={`font-heading text-xs ${isToday ? "text-gold font-bold" : "text-foreground"}`}>
                                    {day.getDate()}
                                  </span>
                                  {dayEvents.length > 0 && (
                                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                                      {dayEvents.slice(0, 3).map((event) => {
                                        const isDeityEvent = event.created_by !== memberId;
                                        return (
                                          <div
                                            key={event.id}
                                            className={`w-1.5 h-1.5 rounded-full ${isDeityEvent ? "bg-gold" : "bg-wine"}`}
                                          />
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Eventos del día seleccionado */}
                      {selectedDate && (
                        <div className="space-y-2 pt-2 border-t border-border/30">
                          <h4 className="font-heading text-sm text-gold">
                            {selectedDate.toLocaleDateString("es-ES", { 
                              weekday: "long", 
                              day: "numeric", 
                              month: "long" 
                            })}
                          </h4>

                          {/* Formulario para crear evento */}
                          {showEventForm && (
                            <div className="p-3 bg-background/50 rounded-sm border border-gold/30 space-y-3">
                              <Input
                                placeholder="Título del evento"
                                value={eventForm.title}
                                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                              />
                              <Input
                                type="time"
                                placeholder="Hora (opcional)"
                                value={eventForm.time}
                                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                              />
                              <div className="flex gap-2">
                                <RitualButton
                                  variant="gold"
                                  onClick={saveEvent}
                                  disabled={!eventForm.title.trim()}
                                  className="flex-1"
                                >
                                  {editingEvent ? "Actualizar" : "Crear Evento"}
                                </RitualButton>
                                <RitualButton
                                  variant="outline"
                                  onClick={() => {
                                    setShowEventForm(false);
                                    setEditingEvent(null);
                                    setEventForm({ title: "", date: "", time: "" });
                                  }}
                                >
                                  Cancelar
                                </RitualButton>
                              </div>
                            </div>
                          )}

                          {/* Lista de eventos del día */}
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {getEventsForDay(selectedDate).length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-2">
                                No hay eventos este día
                              </p>
                            ) : (
                              getEventsForDay(selectedDate).map((event) => {
                                const isDeityEvent = event.created_by !== memberId;
                                return (
                                  <div
                                    key={event.id}
                                    className={`
                                      p-2 bg-background/50 rounded-sm space-y-1
                                      ${isDeityEvent ? "border-2 border-gold/60" : "border border-border/30"}
                                    `}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-heading text-xs text-foreground">
                                            {event.title}
                                          </h5>
                                          {isDeityEvent && (
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 bg-gold/10 text-gold border-gold/30">
                                              Deidad
                                            </Badge>
                                          )}
                                        </div>
                                        {event.event_time && (
                                          <p className="text-[10px] text-muted-foreground">
                                            {event.event_time}
                                          </p>
                                        )}
                                      </div>
                                      {isDeityEvent && (
                                        <div className="flex gap-0.5">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingEvent(event);
                                              setEventForm({
                                                title: event.title,
                                                date: event.event_date,
                                                time: event.event_time || "",
                                              });
                                              setShowEventForm(true);
                                            }}
                                            className="p-1 text-gold hover:text-gold/80 transition-colors"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteEvent(event.id);
                                            }}
                                            className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </ParchmentCard>
                )}

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