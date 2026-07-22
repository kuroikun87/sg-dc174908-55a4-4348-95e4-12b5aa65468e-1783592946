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
  Check,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Grid,
  List,
  Camera,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

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
  timezone: string | null;
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
  const [practices, setPractices] = useState<any[]>([]);
  const [userPractices, setUserPractices] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

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
    start_time: "",
    end_time: "",
    is_important: false,
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [globalTitles, setGlobalTitles] = useState<any[]>([]);
  const [unlockedTitles, setUnlockedTitles] = useState<string[]>([]);
  const [newTitleName, setNewTitleName] = useState("");
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [titleLockExpiry, setTitleLockExpiry] = useState<string | null>(null);
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

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    task_id: "", // Para seleccionar de biblioteca
    title: "",
    description: "",
    requires_evidence: false,
    recurrence_type: "once" as "once" | "daily" | "weekly" | "monthly",
    recurrence_days: [] as number[],
    time_limit: "",
    due_date: "",
    reward_id: "",
    reward_faith_points: 0,
    punishment_id: "",
    punishment_faith_points: 0,
  });
  const [taskMode, setTaskMode] = useState<"library" | "custom">("library");
  const [taskLibrary, setTaskLibrary] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [punishments, setPunishments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "info" | "tasks" | "practices" | "events" | "notes" | "rewards-punishments" | "evidences"
  >("info");

  // Estados para la pestaña de evidencias
  const [evidenceView, setEvidenceView] = useState<"list" | "gallery">("list");
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<any | null>(null);
  const [deletingEvidence, setDeletingEvidence] = useState<string | null>(null);

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
      // Cargar perfil del fiel
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          display_name,
          nickname,
          title,
          title_locked_until,
          title_locked_by,
          bio,
          pronouns,
          birth_date,
          avatar_url,
          role,
          faith_points,
          rank_id,
          cult_id,
          timezone,
          ranks(name, level)
        `)
        .eq("id", memberId)
        .single();

      if (profileError) throw profileError;
      console.log("Profile data loaded:", profileData);
      
      // Asegurar que ranks sea un objeto y no un array si Supabase lo devuelve como array
      const formattedProfileData = {
        ...profileData,
        ranks: Array.isArray(profileData.ranks) ? profileData.ranks[0] : profileData.ranks
      };
      
      setMember(formattedProfileData as any);

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
        .select("*, profiles!calendar_events_created_by_fkey(display_name, role)")
        .eq("user_id", memberId)
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true, nullsFirst: false });
      
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

        // Cargar títulos globales del culto
        const { data: cultTitlesData } = await supabase
          .from("cult_titles")
          .select("*")
          .eq("cult_id", profileData.cult_id)
          .order("name");
        setGlobalTitles(cultTitlesData || []);

        // Cargar títulos desbloqueados por este fiel
        const { data: followerTitlesData } = await supabase
          .from("follower_titles")
          .select("title_id")
          .eq("follower_id", memberId);
        setUnlockedTitles(followerTitlesData?.map(ft => ft.title_id) || []);

        // Cargar premios activos
        const { data: activeRewards } = await supabase
          .from("rewards")
          .select("*")
          .eq("cult_id", profileData.cult_id)
          .eq("is_active", true)
          .order("name");
        setRewards(activeRewards || []);

        // Cargar consecuencias activas
        const { data: activePunishments } = await supabase
          .from("punishments")
          .select("*")
          .eq("cult_id", profileData.cult_id)
          .eq("is_active", true)
          .order("name");
        setPunishments(activePunishments || []);

        // Cargar biblioteca de tareas
        const { data: tasksLibrary } = await supabase
          .from("tasks")
          .select("*")
          .eq("cult_id", profileData.cult_id)
          .order("created_at", { ascending: false });
        setTaskLibrary(tasksLibrary || []);

        // Cargar premios activos del fiel
        const { data: followerRewardsData } = await supabase
          .from("awarded_rewards")
          .select(`
            *,
            rewards(name, description),
            profiles!awarded_rewards_awarded_by_fkey(display_name)
          `)
          .eq("follower_id", memberId)
          .eq("is_redeemed", false)
          .order("awarded_at", { ascending: false });
        setFollowerRewards(followerRewardsData || []);

        // Cargar consecuencias activas del fiel
        const { data: followerPunishmentsData } = await supabase
          .from("follower_punishments")
          .select(`
            *,
            punishments(name, description),
            profiles!follower_punishments_assigned_by_fkey(display_name)
          `)
          .eq("follower_id", memberId)
          .eq("is_completed", false)
          .order("assigned_at", { ascending: false });
        setFollowerPunishments(followerPunishmentsData || []);
      }

      // Cargar notas del fiel
      const { data: notesData } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", memberId)
        .order("created_at", { ascending: false });
      setNotes(notesData || []);

      // Cargar fetiches del culto y los marcados por el usuario
      const { data: fetchesData } = await supabase
        .from("fetishes")
        .select("*")
        .eq("cult_id", profileData.cult_id)
        .order("name");
      setPractices(fetchesData || []);

      const { data: userFetchesData } = await supabase
        .from("fetish_ratings")
        .select("*")
        .eq("user_id", memberId);
      setUserPractices(userFetchesData || []);

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading member data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del fiel",
        variant: "destructive",
      });
      setIsLoading(false);
    }
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
            start_time: eventForm.start_time || null,
            end_time: eventForm.end_time || null,
            is_important: isDeity ? true : eventForm.is_important,
          })
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast({ title: "Evento actualizado" });
      } else {
        // Crear nuevo evento
        const { data, error } = await supabase.from("calendar_events").insert({
          user_id: memberId,
          title: eventForm.title,
          event_date: eventForm.date,
          start_time: eventForm.start_time || null,
          end_time: eventForm.end_time || null,
          is_important: isDeity ? true : eventForm.is_important,
          created_by: user?.id,
        }).select();

        console.log("Evento creado:", data, "Error:", error);
        if (error) throw error;
        toast({ title: "Evento creado" });
      }

      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({ 
        title: "", 
        date: "", 
        start_time: "",
        end_time: "",
        is_important: false,
      });
      
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
      // Comparar substrings de la fecha YYYY-MM-DD
      const dateParts = event.event_date.split("-");
      const eventYear = parseInt(dateParts[0]);
      const eventMonth = parseInt(dateParts[1]) - 1; // 0-indexed
      return eventYear === year && eventMonth === month;
    });
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    
    // Crear string YYYY-MM-DD forzando hora local para evitar offsets de timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dayNum = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${dayNum}`;
    
    const dayEvents = events.filter((event) => event.event_date === dateStr);
    
    // Ordenar por hora de inicio - los que no tienen hora van al final
    dayEvents.sort((a, b) => {
      if (!a.start_time && !b.start_time) return 0;
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      return a.start_time.localeCompare(b.start_time);
    });
    
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

  // Funciones de gestión de Títulos
  const createCultTitle = async () => {
    if (!newTitleName.trim() || !profile?.cult_id) return;
    try {
      const { data, error } = await supabase.from("cult_titles").insert({
        cult_id: profile.cult_id,
        name: newTitleName.trim()
      }).select().single();
      
      if (error) throw error;
      setGlobalTitles([...globalTitles, data]);
      setNewTitleName("");
      toast({ title: "Título agregado a la grilla global" });
    } catch (error: any) {
      console.error(error);
      toast({ 
        title: "Error al crear título", 
        description: error.message?.includes("unique") ? "Ese título ya existe" : "No se pudo agregar",
        variant: "destructive" 
      });
    }
  };

  const unlockTitleForFollower = async (titleId: string) => {
    if (!memberId) return;
    try {
      const { error } = await supabase.from("follower_titles").insert({
        follower_id: memberId,
        title_id: titleId
      });
      if (error) throw error;
      
      setUnlockedTitles([...unlockedTitles, titleId]);
      toast({ title: "Título desbloqueado para este fiel" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error al desbloquear título", variant: "destructive" });
    }
  };

  const setActiveTitle = async (titleName: string) => {
    if (!memberId || !isDeity) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ title: titleName })
        .eq("id", memberId);

      if (error) throw error;

      // Registrar el cambio de título
      await supabase.from("faith_points_log").insert({
        user_id: memberId,
        deity_id: user?.id,
        amount: 0,
        balance_after: member?.faith_points || 0,
        reason: `Nuevo Título Activo: ${titleName}`,
        transaction_type: "grant",
      });

      toast({ title: "Título activo actualizado" });
      
      // Actualizar el estado local inmediatamente
      setMember(prev => prev ? { ...prev, title: titleName } : null);
      setIsEditingTitle(false);
      
      // Recargar datos completos para asegurar sincronización
      await loadMemberData();
    } catch (error) {
      console.error("Error updating active title:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el título activo",
        variant: "destructive",
      });
    }
  };

  const lockTitle = async () => {
    if (!memberId || !user?.id) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          title_locked_until: titleLockExpiry || null,
          title_locked_by: user.id,
        })
        .eq("id", memberId);

      if (error) throw error;

      toast({ title: "Título bloqueado" });
      setShowLockDialog(false);
      setTitleLockExpiry(null);
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

  // Funciones de gestión de premios y consecuencias
  const completeReward = async (rewardId: string, rewardName: string) => {
    if (!memberId || !user?.id) return;

    try {
      // Marcar como canjeado
      const { error: updateError } = await supabase
        .from("awarded_rewards")
        .update({
          is_redeemed: true,
          redeemed_at: new Date().toISOString(),
        })
        .eq("id", rewardId);

      if (updateError) throw updateError;

      // Registrar en historial
      await supabase.from("faith_points_log").insert({
        user_id: memberId,
        deity_id: user.id,
        amount: 0,
        balance_after: member?.faith_points || 0,
        reason: `Premio cumplido: ${rewardName}`,
        transaction_type: "reward_redeemed",
      });

      toast({ title: "Premio marcado como cumplido" });
      loadMemberData();
    } catch (error) {
      console.error("Error completing reward:", error);
      toast({
        title: "Error",
        description: "No se pudo marcar el premio como cumplido",
        variant: "destructive",
      });
    }
  };

  const deleteReward = async (rewardId: string) => {
    if (!memberId) return;

    try {
      const { error } = await supabase
        .from("awarded_rewards")
        .delete()
        .eq("id", rewardId);

      if (error) throw error;

      toast({ title: "Premio eliminado" });
      loadMemberData();
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el premio",
        variant: "destructive",
      });
    }
  };

  const completePunishment = async (punishmentId: string, punishmentName: string) => {
    if (!memberId || !user?.id) return;

    try {
      // Marcar como completada
      const { error: updateError } = await supabase
        .from("follower_punishments")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", punishmentId);

      if (updateError) throw updateError;

      // Registrar en historial
      await supabase.from("faith_points_log").insert({
        user_id: memberId,
        deity_id: user.id,
        amount: 0,
        balance_after: member?.faith_points || 0,
        reason: `Consecuencia cumplida: ${punishmentName}`,
        transaction_type: "punishment_completed",
      });

      toast({ title: "Consecuencia marcada como cumplida" });
      loadMemberData();
    } catch (error) {
      console.error("Error completing punishment:", error);
      toast({
        title: "Error",
        description: "No se pudo marcar la consecuencia como cumplida",
        variant: "destructive",
      });
    }
  };

  const deletePunishment = async (punishmentId: string) => {
    if (!memberId) return;

    try {
      const { error } = await supabase
        .from("follower_punishments")
        .delete()
        .eq("id", punishmentId);

      if (error) throw error;

      toast({ title: "Consecuencia eliminada" });
      loadMemberData();
    } catch (error) {
      console.error("Error deleting punishment:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la consecuencia",
        variant: "destructive",
      });
    }
  };

  const deleteEvidence = async (assignmentId: string, evidenceUrl: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta evidencia? Esta acción no se puede deshacer.")) {
      return;
    }

    setDeletingEvidence(assignmentId);

    try {
      // Extraer el path del archivo de la URL
      const urlParts = evidenceUrl.split("/task-evidence/");
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        
        // Eliminar el archivo de Supabase Storage
        const { error: storageError } = await supabase.storage
          .from("task-evidence")
          .remove([filePath]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
        }
      }

      // Eliminar la URL de evidencia de la base de datos
      const { error: updateError } = await supabase
        .from("assigned_tasks")
        .update({ evidence_url: null })
        .eq("id", assignmentId);

      if (updateError) throw updateError;

      toast({
        title: "Evidencia eliminada",
        description: "La imagen ha sido eliminada correctamente",
      });

      loadMemberData();
    } catch (error) {
      console.error("Error deleting evidence:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la evidencia",
        variant: "destructive",
      });
    } finally {
      setDeletingEvidence(null);
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

  const saveTask = async () => {
    if (!profile?.cult_id || !memberId) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    // Validar según modo
    if (taskMode === "library" && !taskForm.task_id) {
      toast({
        title: "Error",
        description: "Seleccione una tarea de la biblioteca",
        variant: "destructive",
      });
      return;
    }

    if (taskMode === "custom" && !taskForm.title.trim()) {
      toast({
        title: "Error",
        description: "El título es requerido",
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

    if ((taskForm.recurrence_type === "daily" || taskForm.recurrence_type === "weekly" || taskForm.recurrence_type === "monthly") && !taskForm.time_limit) {
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
      let taskId = taskForm.task_id;

      // Si es personalizada, crear en biblioteca primero
      if (taskMode === "custom") {
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
        taskId = newTask.id;
      }

      // Asignar al fiel
      const { error: assignError } = await supabase
        .from("assigned_tasks")
        .insert({
          task_id: taskId,
          follower_id: memberId,
          assigned_by: user?.id,
          due_date: taskForm.recurrence_type === "once" ? taskForm.due_date : null,
          reward_id: taskForm.reward_id || null,
          reward_faith_points: taskForm.reward_faith_points || 0,
          punishment_id: taskForm.punishment_id || null,
          punishment_faith_points: taskForm.punishment_faith_points || 0,
          deity_timezone: profile.timezone || "UTC",
          follower_timezone: member?.timezone || "UTC",
        });

      if (assignError) throw assignError;

      toast({ title: "Tarea asignada" });

      setShowTaskForm(false);
      setTaskForm({
        task_id: "",
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
      setTaskMode("library");
      loadMemberData();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la tarea",
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
                    {member.nickname && (
                      <p className="font-body text-xs text-muted-foreground">
                        "{member.nickname}"
                      </p>
                    )}
                    
                    {/* Título editable con lock y grilla */}
                    {isDeity && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => !isTitleLocked && setIsEditingTitle(!isEditingTitle)}
                            className={`font-heading text-sm text-silver flex items-center gap-1 ${isTitleLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-silver/80'}`}
                            disabled={isTitleLocked}
                          >
                            {member.title || "Sin título activo"}
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
                                ? canUnlockTitle ? "text-red hover:text-red/80" : "text-muted-foreground/30 cursor-not-allowed"
                                : "text-muted-foreground hover:text-silver"
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
                        </div>

                        {/* Grilla interactiva de títulos */}
                        {isEditingTitle && !isTitleLocked && (
                          <div className="p-4 border border-border/30 rounded-sm bg-background/50 space-y-4 shadow-xl">
                            <div className="flex items-center justify-between">
                              <h4 className="font-heading text-sm text-silver">Gestión de Títulos</h4>
                              <button 
                                onClick={() => setIsEditingTitle(false)} 
                                className="p-1 hover:text-red transition-colors text-muted-foreground"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="flex gap-2">
                              <Input 
                                value={newTitleName} 
                                onChange={(e) => setNewTitleName(e.target.value)} 
                                placeholder="Crear título para el culto..." 
                                className="text-xs h-8 bg-background border-border/40 focus-visible:ring-silver/50"
                              />
                              <RitualButton variant="outline" onClick={createCultTitle} className="h-8 py-0 px-3 text-xs whitespace-nowrap">
                                <Plus className="w-3 h-3 mr-1"/> Añadir a grilla
                              </RitualButton>
                            </div>

                            {globalTitles.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-2 text-center">No hay títulos en la grilla del culto. Agrega uno arriba.</p>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-60 overflow-y-auto pr-1">
                                {globalTitles.map(t => {
                                  const isUnlocked = unlockedTitles.includes(t.id);
                                  const isActive = member.title === t.name;
                                  
                                  return (
                                    <button
                                      key={t.id}
                                      onClick={() => {
                                        if (isUnlocked && !isActive) {
                                          setActiveTitle(t.name);
                                        } else if (!isUnlocked) {
                                          unlockTitleForFollower(t.id);
                                        }
                                      }}
                                      className={`p-2 border rounded-sm text-xs transition-all flex flex-col items-center justify-center gap-1.5 h-16 ${
                                        isActive 
                                          ? "border-red bg-red/10 text-red font-bold" 
                                          : isUnlocked
                                          ? "border-silver bg-silver/10 text-silver hover:bg-silver/20"
                                          : "border-border/30 bg-muted/5 text-muted-foreground hover:border-silver/30"
                                      }`}
                                    >
                                      <span className="text-center leading-tight line-clamp-2">{t.name}</span>
                                      {isActive ? (
                                        <span className="text-[9px] text-red uppercase font-bold tracking-wider">Activo</span>
                                      ) : isUnlocked ? (
                                        <span className="text-[9px] text-silver uppercase tracking-wider">Desbloqueado</span>
                                      ) : (
                                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 opacity-70">
                                          <Lock className="w-2.5 h-2.5"/> Bloqueado
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!isDeity && member.title && (
                      <p className="font-heading text-sm text-silver">{member.title}</p>
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

            {/* Navegación de tabs */}
            <div className="flex gap-2 border-b border-border/30 mt-6">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 py-2 text-sm font-heading transition-colors ${
                  activeTab === "info"
                    ? "text-silver border-b-2 border-silver"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Información
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-4 py-2 text-sm font-heading transition-colors ${
                  activeTab === "tasks"
                    ? "text-silver border-b-2 border-silver"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tareas
              </button>
              {isDeity && (
                <button
                  onClick={() => setActiveTab("practices")}
                  className={`px-4 py-2 text-sm font-heading transition-colors ${
                    activeTab === "practices"
                      ? "text-silver border-b-2 border-silver"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Prácticas
                </button>
              )}
              <button
                onClick={() => setActiveTab("events")}
                className={`px-4 py-2 text-sm font-heading transition-colors ${
                  activeTab === "events"
                    ? "text-silver border-b-2 border-silver"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Calendario
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-4 py-2 text-sm font-heading transition-colors ${
                  activeTab === "notes"
                    ? "text-silver border-b-2 border-silver"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Notas
              </button>
              {isDeity && (
                <>
                  <button
                    onClick={() => setActiveTab("rewards-punishments")}
                    className={`px-4 py-2 text-sm font-heading transition-colors ${
                      activeTab === "rewards-punishments"
                        ? "text-silver border-b-2 border-silver"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Premios y Consecuencias
                  </button>
                  <button
                    onClick={() => setActiveTab("evidences")}
                    className={`px-4 py-2 text-sm font-heading transition-colors ${
                      activeTab === "evidences"
                        ? "text-silver border-b-2 border-silver"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Evidencias
                  </button>
                </>
              )}
            </div>

            {/* Contenido de tabs */}
            <div className="mt-6 space-y-4">
              {/* Tab: Información */}
              {activeTab === "info" && (
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
              )}

              {/* Tab: Tareas */}
              {activeTab === "tasks" && (
                <>
                  {/* Botón para crear nueva tarea */}
                  {isDeity && !showTaskForm && (
                    <div className="flex justify-center">
                      <RitualButton variant="gold" onClick={() => setShowTaskForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Tarea
                      </RitualButton>
                    </div>
                  )}

                  {/* Formulario de asignación de tarea */}
                  {showTaskForm && (
                    <ParchmentCard title="Nueva Tarea" icon={<Plus className="w-4 h-4" />}>
                      <div className="space-y-4">
                        {/* Selector de modo */}
                        <div className="space-y-2">
                          <label className="text-sm text-muted-foreground">Origen de la tarea</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setTaskMode("library")}
                              className={`p-3 rounded-sm border text-sm transition-all ${
                                taskMode === "library"
                                  ? "border-silver bg-silver/10 text-silver"
                                  : "border-border/30 hover:border-silver/40"
                              }`}
                            >
                              Biblioteca
                            </button>
                            <button
                              onClick={() => setTaskMode("custom")}
                              className={`p-3 rounded-sm border text-sm transition-all ${
                                taskMode === "custom"
                                  ? "border-silver bg-silver/10 text-silver"
                                  : "border-border/30 hover:border-silver/40"
                              }`}
                            >
                              Personalizada
                            </button>
                          </div>
                        </div>

                        {/* Selector de tarea de biblioteca */}
                        {taskMode === "library" && (
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Seleccionar tarea *</label>
                            <select
                              value={taskForm.task_id}
                              onChange={(e) => {
                                const selectedTask = taskLibrary.find(t => t.id === e.target.value);
                                setTaskForm({
                                  ...taskForm,
                                  task_id: e.target.value,
                                  requires_evidence: selectedTask?.requires_evidence || false,
                                });
                              }}
                              className="w-full p-2 bg-background border border-border/30 rounded-sm text-sm"
                            >
                              <option value="">Seleccione una tarea...</option>
                              {taskLibrary.map((task) => (
                                <option key={task.id} value={task.id}>
                                  {task.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Campos de tarea personalizada */}
                        {taskMode === "custom" && (
                          <>
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
                                placeholder="Descripción detallada..."
                                rows={3}
                              />
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-sm">
                              <Checkbox
                                checked={taskForm.requires_evidence}
                                onCheckedChange={(checked) =>
                                  setTaskForm({ ...taskForm, requires_evidence: checked as boolean })
                                }
                              />
                              <label className="text-sm text-foreground">Requiere evidencia fotográfica</label>
                            </div>
                          </>
                        )}

                        <Separator className="my-4" />

                        <div className="space-y-2">
                          <label className="text-sm text-muted-foreground">Frecuencia *</label>
                          <div className="grid grid-cols-4 gap-2">
                            <button
                              onClick={() => setTaskForm({ ...taskForm, recurrence_type: "once" })}
                              className={`p-3 rounded-sm border text-sm transition-all ${
                                taskForm.recurrence_type === "once"
                                  ? "border-silver bg-silver/10 text-silver"
                                  : "border-border/30 hover:border-silver/40"
                              }`}
                            >
                              Única
                            </button>
                            <button
                              onClick={() => setTaskForm({ ...taskForm, recurrence_type: "daily" })}
                              className={`p-3 rounded-sm border text-sm transition-all ${
                                taskForm.recurrence_type === "daily"
                                  ? "border-silver bg-silver/10 text-silver"
                                  : "border-border/30 hover:border-silver/40"
                              }`}
                            >
                              Diaria
                            </button>
                            <button
                              onClick={() => setTaskForm({ ...taskForm, recurrence_type: "weekly" })}
                              className={`p-3 rounded-sm border text-sm transition-all ${
                                taskForm.recurrence_type === "weekly"
                                  ? "border-silver bg-silver/10 text-silver"
                                  : "border-border/30 hover:border-silver/40"
                              }`}
                            >
                              Semanal
                            </button>
                            <button
                              onClick={() => setTaskForm({ ...taskForm, recurrence_type: "monthly" })}
                              className={`p-3 rounded-sm border text-sm transition-all ${
                                taskForm.recurrence_type === "monthly"
                                  ? "border-silver bg-silver/10 text-silver"
                                  : "border-border/30 hover:border-silver/40"
                              }`}
                            >
                              Mensual
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

                        {(taskForm.recurrence_type === "daily" || taskForm.recurrence_type === "weekly" || taskForm.recurrence_type === "monthly") && (
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
                                      ? "border-silver bg-silver/10 text-silver"
                                      : "border-border/30 hover:border-silver/40"
                                  }`}
                                >
                                  {day.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <Separator className="my-4" />

                        <div className="space-y-3">
                          <h4 className="font-heading text-sm text-silver">Premio al completar</h4>
                          
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

                        <div className="flex gap-2 pt-2">
                          <RitualButton variant="gold" onClick={saveTask} className="flex-1">
                            Asignar Tarea
                          </RitualButton>
                          <RitualButton
                            variant="outline"
                            onClick={() => {
                              setShowTaskForm(false);
                              setTaskForm({
                                task_id: "",
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
                              setTaskMode("library");
                            }}
                          >
                            Cancelar
                          </RitualButton>
                        </div>
                      </div>
                    </ParchmentCard>
                  )}

                  {/* Lista de tareas asignadas */}
                  <ParchmentCard title="Tareas Asignadas" icon={<CheckSquare className="w-4 h-4" />}>
                    {followerTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No hay tareas asignadas
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {followerTasks.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="p-3 bg-background/50 rounded-sm border border-border/30 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-heading text-sm text-foreground">
                                  {assignment.tasks?.title || "Tarea"}
                                </h4>
                                {assignment.tasks?.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {assignment.tasks.description}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs shrink-0 ${
                                  assignment.status === "completed"
                                    ? "border-gold/40 bg-gold/10 text-gold"
                                    : assignment.status === "failed"
                                    ? "border-wine/40 bg-wine/10 text-wine"
                                    : "border-border/40 bg-muted/10 text-muted-foreground"
                                }`}
                              >
                                {assignment.status === "completed"
                                  ? "Completada"
                                  : assignment.status === "failed"
                                  ? "Fallida"
                                  : "Pendiente"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Tipo: </span>
                                <span className="text-foreground">
                                  {assignment.tasks?.recurrence_type === "once"
                                    ? "Única"
                                    : assignment.tasks?.recurrence_type === "daily"
                                    ? "Diaria"
                                    : assignment.tasks?.recurrence_type === "weekly"
                                    ? "Semanal"
                                    : "Mensual"}
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
                              <a
                                href={assignment.evidence_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gold hover:text-gold/80 transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Ver evidencia
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ParchmentCard>
                </>
              )}

              {/* Tab: Prácticas */}
              {activeTab === "practices" && isDeity && (
                <div className="space-y-4">
                  <ParchmentCard title="Prácticas y Fetiches" icon={<User className="w-4 h-4" />}>
                    {practices.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay prácticas registradas en el culto
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {practices.map((practice) => {
                          const userPractice = userPractices.find((up) => up.fetish_id === practice.id);
                          const interest = userPractice?.interest_level;
                          const isStarred = userPractice?.is_starred || false;

                          return (
                            <div
                              key={practice.id}
                              className="p-3 bg-muted/20 rounded-sm border border-border/30 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-heading text-sm text-foreground">{practice.name}</h4>
                                    {isStarred && (
                                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                    )}
                                  </div>
                                  {practice.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{practice.description}</p>
                                  )}
                                </div>
                              </div>

                              {interest && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Interés:</span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      interest === "love"
                                        ? "border-green-500/40 bg-green-500/10 text-green-400"
                                        : interest === "like"
                                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                                        : interest === "neutral"
                                        ? "border-border/40 bg-muted/10 text-muted-foreground"
                                        : interest === "soft_limit"
                                        ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                                        : "border-red/40 bg-red/10 text-red"
                                    }`}
                                  >
                                    {interest === "love"
                                      ? "Me encanta"
                                      : interest === "like"
                                      ? "Me gusta"
                                      : interest === "neutral"
                                      ? "Me da igual"
                                      : interest === "soft_limit"
                                      ? "Límite blando"
                                      : "Límite duro"}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ParchmentCard>
                </div>
              )}

              {/* Tab: Calendario */}
              {activeTab === "events" && (
                <div className="space-y-4">
                  {/* Vista de calendario */}
                  <ParchmentCard title="Almanaque" icon={<Calendar className="w-4 h-4" />}>
                    <div className="space-y-4">
                      {/* Navegación del mes */}
                      <div className="flex items-center justify-between">
                        <button onClick={previousMonth} className="p-2 hover:bg-muted/20 rounded-sm transition-colors">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <h3 className="font-heading text-lg">
                          {currentMonth.toLocaleDateString("es", { month: "long", year: "numeric" })}
                        </h3>
                        <button onClick={nextMonth} className="p-2 hover:bg-muted/20 rounded-sm transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Días de la semana */}
                      <div className="grid grid-cols-7 gap-1">
                        {["D", "L", "M", "X", "J", "V", "S"].map((day) => (
                          <div key={day} className="text-center text-xs font-heading text-muted-foreground py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Días del mes */}
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
                                  const year = day.getFullYear();
                                  const month = String(day.getMonth() + 1).padStart(2, "0");
                                  const dayNum = String(day.getDate()).padStart(2, "0");
                                  const dateStr = `${year}-${month}-${dayNum}`;
                                  
                                  setEventForm({ ...eventForm, date: dateStr });
                                  setShowEventForm(true);
                                  setEditingEvent(null);
                                }
                              }}
                              disabled={!day}
                              className={`
                                aspect-square p-1 rounded-sm border transition-all relative
                                ${!day ? "invisible" : ""}
                                ${isSelected ? "border-silver bg-silver/10" : "border-border/30 hover:border-silver/40"}
                                ${isToday && !isSelected ? "border-silver/60" : ""}
                                ${dayEvents.length > 0 ? "bg-muted/20" : "bg-background/50"}
                              `}
                            >
                              {day && (
                                <>
                                  <span className="text-xs">{day.getDate()}</span>
                                  {dayEvents.length > 0 && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                      {dayEvents.slice(0, 3).map((event, i) => (
                                        <div
                                          key={i}
                                          className="w-1 h-1 rounded-full"
                                          style={{
                                            backgroundColor:
                                              event.type === "free"
                                                ? "#22c55e"
                                                : event.type === "busy"
                                                ? "#ef4444"
                                                : event.type === "event"
                                                ? "#3b82f6"
                                                : "#a855f7",
                                          }}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </ParchmentCard>

                  {/* Eventos del día seleccionado */}
                  {selectedDate && (
                    <ParchmentCard
                      title={`Eventos - ${selectedDate.toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}`}
                      icon={<Calendar className="w-4 h-4" />}
                    >
                      <div className="space-y-3">
                        {getEventsForDay(selectedDate).length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No hay eventos en esta fecha
                          </p>
                        ) : (
                          getEventsForDay(selectedDate).map((event) => {
                            const isImportant = event.is_important;
                            const creatorName = event.profiles?.display_name || (event.profiles?.role === 'deity' ? 'Deidad' : 'Fiel');
                            const canEdit = event.created_by === user?.id;
                            
                            return (
                              <div
                                key={event.id}
                                className={`p-3 rounded-sm border space-y-2 ${
                                  isImportant 
                                    ? 'bg-gold/10 border-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                                    : 'bg-muted/20 border-border/30'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-heading text-sm text-foreground flex items-center gap-2">
                                      {isImportant && <Star className="w-3.5 h-3.5 text-gold fill-gold" />}
                                      <span className="text-muted-foreground">{creatorName}:</span>
                                      <span>{event.title}</span>
                                    </h4>
                                    {(event.start_time || event.end_time) && (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Clock className="w-3 h-3" />
                                        {event.start_time && <span>{event.start_time.slice(0, 5)}</span>}
                                        {event.end_time && (
                                          <>
                                            <span>-</span>
                                            <span>{event.end_time.slice(0, 5)}</span>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {canEdit && (
                                  <div className="flex gap-2">
                                    <RitualButton
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingEvent(event);
                                        setEventForm({
                                          title: event.title,
                                          date: event.event_date,
                                          start_time: event.start_time || "",
                                          end_time: event.end_time || "",
                                          is_important: event.is_important || false,
                                        });
                                        setShowEventForm(true);
                                      }}
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Editar
                                    </RitualButton>
                                    <RitualButton
                                      variant="outline"
                                      size="sm"
                                      onClick={() => deleteEvent(event.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </RitualButton>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}

                        {/* Botón para agregar evento */}
                        {!showEventForm && (
                          <RitualButton
                            variant="outline"
                            onClick={() => {
                              const year = selectedDate.getFullYear();
                              const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
                              const dayNum = String(selectedDate.getDate()).padStart(2, "0");
                              const dateStr = `${year}-${month}-${dayNum}`;
                              
                              setEventForm({ 
                                title: "", 
                                date: dateStr,
                                start_time: "",
                                end_time: "",
                                is_important: false,
                              });
                              setShowEventForm(true);
                              setEditingEvent(null);
                            }}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Evento
                          </RitualButton>
                        )}

                        {/* Formulario de evento */}
                        {showEventForm && (
                          <div className="p-4 bg-background/50 border border-border/30 rounded-sm space-y-3">
                            <h4 className="font-heading text-sm text-silver">
                              {editingEvent ? "Editar Evento" : "Nuevo Evento"}
                            </h4>

                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Título *</label>
                              <Input
                                value={eventForm.title}
                                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                placeholder="Título del evento"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">Hora de inicio</label>
                                <Input
                                  type="time"
                                  value={eventForm.start_time}
                                  onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">Hora de fin (opcional)</label>
                                <Input
                                  type="time"
                                  value={eventForm.end_time}
                                  onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                                />
                              </div>
                            </div>

                            {!isDeity && (
                              <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-sm">
                                <Checkbox
                                  checked={eventForm.is_important}
                                  onCheckedChange={(checked) =>
                                    setEventForm({ ...eventForm, is_important: checked as boolean })
                                  }
                                />
                                <label className="text-sm text-foreground">Marcar como importante</label>
                              </div>
                            )}

                            {isDeity && (
                              <div className="p-2 bg-gold/10 rounded-sm border border-gold/30 text-xs text-muted-foreground flex items-center gap-2">
                                <Star className="w-3 h-3 text-gold fill-gold" />
                                Los eventos creados por deidades son siempre importantes
                              </div>
                            )}

                            <div className="flex gap-2">
                              <RitualButton variant="gold" onClick={saveEvent} className="flex-1">
                                {editingEvent ? "Actualizar" : "Guardar"}
                              </RitualButton>
                              <RitualButton
                                variant="outline"
                                onClick={() => {
                                  setShowEventForm(false);
                                  setEditingEvent(null);
                                }}
                              >
                                Cancelar
                              </RitualButton>
                            </div>
                          </div>
                        )}
                      </div>
                    </ParchmentCard>
                  )}
                </div>
              )}

              {/* Tab: Notas */}
              {activeTab === "notes" && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sección de notas próximamente
                </p>
              )}

              {/* Tab: Premios y Consecuencias */}
              {activeTab === "rewards-punishments" && isDeity && (
                <div className="space-y-6">
                  {/* Premios activos */}
                  <ParchmentCard title="Premios Pendientes" icon={<Gift className="w-4 h-4" />}>
                    {followerRewards.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No tiene premios pendientes
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {followerRewards.map((reward) => (
                          <div
                            key={reward.id}
                            className="p-3 bg-muted/20 rounded-sm border border-border/30 space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-heading text-sm text-foreground">
                                  {reward.rewards?.name || "Premio"}
                                </h4>
                                {reward.rewards?.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {reward.rewards.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Otorgado por: {reward.profiles?.display_name || "Sistema"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(reward.awarded_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {reward.notes && (
                                  <p className="text-xs text-muted-foreground italic mt-1">
                                    Nota: {reward.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <RitualButton
                                variant="outline"
                                size="sm"
                                onClick={() => completeReward(reward.id, reward.rewards?.name || "Premio")}
                                className="flex-1 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Marcar cumplido
                              </RitualButton>
                              <RitualButton
                                variant="outline"
                                size="sm"
                                onClick={() => deleteReward(reward.id)}
                                className="border-red/40 text-red hover:bg-red/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </RitualButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ParchmentCard>

                  {/* Consecuencias activas */}
                  <ParchmentCard title="Consecuencias Pendientes" icon={<AlertTriangle className="w-4 h-4" />}>
                    {followerPunishments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No tiene consecuencias pendientes
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {followerPunishments.map((punishment) => (
                          <div
                            key={punishment.id}
                            className="p-3 bg-muted/20 rounded-sm border border-border/30 space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-heading text-sm text-foreground">
                                  {punishment.punishments?.name || "Consecuencia"}
                                </h4>
                                {punishment.punishments?.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {punishment.punishments.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Asignada por: {punishment.profiles?.display_name || "Sistema"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(punishment.assigned_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {punishment.notes && (
                                  <p className="text-xs text-muted-foreground italic mt-1">
                                    Nota: {punishment.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <RitualButton
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  completePunishment(punishment.id, punishment.punishments?.name || "Consecuencia")
                                }
                                className="flex-1 border-red/40 text-red hover:bg-red/10"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Marcar cumplida
                              </RitualButton>
                              <RitualButton
                                variant="outline"
                                size="sm"
                                onClick={() => deletePunishment(punishment.id)}
                                className="border-red/40 text-red hover:bg-red/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </RitualButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ParchmentCard>
                </div>
              )}

              {/* Tab: Evidencias */}
              {activeTab === "evidences" && isDeity && (
                <div className="space-y-4">
                  {/* Toggle entre vista de lista y galería */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-sm text-silver">Evidencias Fotográficas</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEvidenceView("list")}
                        className={`p-2 rounded-sm border transition-colors ${
                          evidenceView === "list"
                            ? "border-silver bg-silver/10 text-silver"
                            : "border-border/30 hover:border-silver/40 text-muted-foreground"
                        }`}
                        title="Vista de lista"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEvidenceView("gallery")}
                        className={`p-2 rounded-sm border transition-colors ${
                          evidenceView === "gallery"
                            ? "border-silver bg-silver/10 text-silver"
                            : "border-border/30 hover:border-silver/40 text-muted-foreground"
                        }`}
                        title="Vista de galería"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Vista de lista */}
                  {evidenceView === "list" && (
                    <ParchmentCard title="Lista de Evidencias" icon={<Camera className="w-4 h-4" />}>
                      {followerTasks.filter((t) => t.evidence_url && t.status === "completed").length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No hay evidencias fotográficas
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {followerTasks
                            .filter((t) => t.evidence_url && t.status === "completed")
                            .map((task) => (
                              <div
                                key={task.id}
                                className="p-3 bg-background/50 rounded-sm border border-border/30 space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h4 className="font-heading text-sm text-foreground">
                                      {task.tasks?.title || "Tarea"}
                                    </h4>
                                    {task.tasks?.description && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {task.tasks.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      <Clock className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        Completada: {new Date(task.completed_at).toLocaleDateString("es", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    <button
                                      onClick={() =>
                                        setExpandedEvidence(
                                          expandedEvidence === task.id ? null : task.id
                                        )
                                      }
                                      className="p-2 rounded-sm border border-silver/40 hover:bg-silver/10 transition-colors"
                                      title={expandedEvidence === task.id ? "Ocultar evidencia" : "Ver evidencia"}
                                    >
                                      {expandedEvidence === task.id ? (
                                        <EyeOff className="w-4 h-4 text-silver" />
                                      ) : (
                                        <Eye className="w-4 h-4 text-silver" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => deleteEvidence(task.id, task.evidence_url)}
                                      disabled={deletingEvidence === task.id}
                                      className="p-2 rounded-sm border border-wine/40 hover:bg-wine/10 transition-colors disabled:opacity-50"
                                      title="Eliminar evidencia"
                                    >
                                      {deletingEvidence === task.id ? (
                                        <Loader2 className="w-4 h-4 text-wine animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4 text-wine" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Imagen expandible */}
                                {expandedEvidence === task.id && (
                                  <div className="mt-3 pt-3 border-t border-border/30">
                                    <img
                                      src={task.evidence_url}
                                      alt="Evidencia de tarea"
                                      className="w-full rounded-sm border border-gold/30 shadow-lg"
                                      style={{ maxHeight: "400px", objectFit: "contain" }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </ParchmentCard>
                  )}

                  {/* Vista de galería */}
                  {evidenceView === "gallery" && (
                    <ParchmentCard title="Galería de Evidencias" icon={<ImageIcon className="w-4 h-4" />}>
                      {followerTasks.filter((t) => t.evidence_url && t.status === "completed").length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No hay evidencias fotográficas
                        </p>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {followerTasks
                              .filter((t) => t.evidence_url && t.status === "completed")
                              .map((task) => (
                                <button
                                  key={task.id}
                                  onClick={() => setSelectedGalleryImage(task)}
                                  className="aspect-square rounded-sm overflow-hidden border border-border/30 hover:border-gold/40 transition-all hover:shadow-lg group"
                                >
                                  <img
                                    src={task.evidence_url}
                                    alt={task.tasks?.title || "Evidencia"}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                </button>
                              ))}
                          </div>

                          {/* Modal de imagen seleccionada */}
                          {selectedGalleryImage && (
                            <div
                              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                              onClick={() => setSelectedGalleryImage(null)}
                            >
                              <div
                                className="bg-background border border-border rounded-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="p-4 border-b border-border/30 flex items-center justify-between">
                                  <h3 className="font-heading text-lg text-foreground">
                                    {selectedGalleryImage.tasks?.title || "Evidencia"}
                                  </h3>
                                  <button
                                    onClick={() => setSelectedGalleryImage(null)}
                                    className="p-2 hover:bg-muted/20 rounded-sm transition-colors"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>

                                <div className="p-4 space-y-4">
                                  <img
                                    src={selectedGalleryImage.evidence_url}
                                    alt={selectedGalleryImage.tasks?.title || "Evidencia"}
                                    className="w-full rounded-sm border border-gold/30"
                                    style={{ maxHeight: "500px", objectFit: "contain" }}
                                  />

                                  <div className="space-y-2 p-3 bg-muted/20 rounded-sm">
                                    {selectedGalleryImage.tasks?.description && (
                                      <div>
                                        <p className="text-xs text-muted-foreground uppercase mb-1">
                                          Descripción
                                        </p>
                                        <p className="text-sm text-foreground">
                                          {selectedGalleryImage.tasks.description}
                                        </p>
                                      </div>
                                    )}

                                    <div>
                                      <p className="text-xs text-muted-foreground uppercase mb-1">
                                        Fecha de completado
                                      </p>
                                      <p className="text-sm text-foreground">
                                        {new Date(selectedGalleryImage.completed_at).toLocaleDateString("es", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                      <RitualButton
                                        variant="outline"
                                        onClick={() => {
                                          deleteEvidence(
                                            selectedGalleryImage.id,
                                            selectedGalleryImage.evidence_url
                                          );
                                          setSelectedGalleryImage(null);
                                        }}
                                        disabled={deletingEvidence === selectedGalleryImage.id}
                                        className="flex-1 border-wine/40 text-wine hover:bg-wine/10"
                                      >
                                        {deletingEvidence === selectedGalleryImage.id ? (
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                          <Trash2 className="w-4 h-4 mr-2" />
                                        )}
                                        Eliminar evidencia
                                      </RitualButton>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </ParchmentCard>
                  )}
                </div>
              )}
            </div>
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