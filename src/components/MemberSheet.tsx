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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

export function MemberSheet({ memberId, isOpen, onClose }: MemberSheetProps) {
  const { toast } = useToast();
  const { profile: viewerProfile } = useAuth();
  const [member, setMember] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [consequences, setConsequences] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [fetishes, setFetishes] = useState<any[]>([]);
  const [faithLog, setFaithLog] = useState<any[]>([]);

  // Para asignación
  const [taskTemplates, setTaskTemplates] = useState<any[]>([]);
  const [rewardTemplates, setRewardTemplates] = useState<any[]>([]);
  const [consequenceTemplates, setConsequenceTemplates] = useState<any[]>([]);

  // Modales de asignación
  const [showTaskAssign, setShowTaskAssign] = useState(false);
  const [showRewardAssign, setShowRewardAssign] = useState(false);
  const [showConsequenceAssign, setShowConsequenceAssign] = useState(false);

  // Formularios personalizados
  const [customTaskForm, setCustomTaskForm] = useState({
    title: "",
    description: "",
    faith_points: 0,
    requires_evidence: false,
  });
  const [customRewardForm, setCustomRewardForm] = useState({
    title: "",
    description: "",
    faith_points: 0,
  });
  const [customConsequenceForm, setCustomConsequenceForm] = useState({
    title: "",
    description: "",
    faith_points: 0,
  });

  const isDeity = viewerProfile?.role === "deity";

  useEffect(() => {
    if (memberId && isOpen) {
      loadMemberData();
      if (isDeity) {
        loadTemplates();
      }
    }
  }, [memberId, isOpen, isDeity]);

  const loadTemplates = async () => {
    if (!viewerProfile?.cult_id) return;

    try {
      const [tasksRes, rewardsRes, consequencesRes] = await Promise.all([
        supabase.from("tasks").select("*").eq("cult_id", viewerProfile.cult_id),
        supabase.from("rewards").select("*").eq("cult_id", viewerProfile.cult_id),
        supabase.from("consequences").select("*").eq("cult_id", viewerProfile.cult_id),
      ]);

      setTaskTemplates(tasksRes.data || []);
      setRewardTemplates(rewardsRes.data || []);
      setConsequenceTemplates(consequencesRes.data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
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

      const { data: tasksData } = await supabase
        .from("follower_tasks")
        .select("*")
        .eq("follower_id", memberId)
        .order("created_at", { ascending: false })
        .limit(10);
      setTasks(tasksData || []);

      const { data: rewardsData } = await supabase
        .from("follower_rewards")
        .select("*")
        .eq("follower_id", memberId)
        .order("created_at", { ascending: false })
        .limit(10);
      setRewards(rewardsData || []);

      const { data: consequencesData } = await supabase
        .from("follower_consequences")
        .select("*")
        .eq("follower_id", memberId)
        .eq("is_fulfilled", false)
        .order("created_at", { ascending: false });
      setConsequences(consequencesData || []);

      const { data: eventsData } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", memberId)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(5);
      setEvents(eventsData || []);

      const { data: fetishesData } = await supabase
        .from("user_fetishes")
        .select("*, fetishes(*)")
        .eq("user_id", memberId);
      setFetishes(fetishesData || []);

      const { data: faithData } = await supabase
        .from("faith_points_log")
        .select("*")
        .eq("follower_id", memberId)
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

  // Asignar tarea desde template
  const assignTaskFromTemplate = async (templateId: string) => {
    if (!member?.cult_id || !memberId) return;

    const template = taskTemplates.find((t) => t.id === templateId);
    if (!template) return;

    try {
      const { error } = await supabase.from("follower_tasks").insert({
        follower_id: memberId,
        cult_id: member.cult_id,
        title: template.title,
        description: template.description,
        faith_points: template.faith_points,
        requires_evidence: template.requires_evidence,
        is_completed: false,
      });

      if (error) throw error;

      toast({ title: "Tarea asignada" });
      setShowTaskAssign(false);
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

  // Asignar tarea personalizada
  const assignCustomTask = async () => {
    if (!member?.cult_id || !memberId || !customTaskForm.title.trim()) return;

    try {
      const { error } = await supabase.from("follower_tasks").insert({
        follower_id: memberId,
        cult_id: member.cult_id,
        title: customTaskForm.title,
        description: customTaskForm.description || null,
        faith_points: customTaskForm.faith_points,
        requires_evidence: customTaskForm.requires_evidence,
        is_completed: false,
      });

      if (error) throw error;

      toast({ title: "Tarea personalizada asignada" });
      setShowTaskAssign(false);
      setCustomTaskForm({ title: "", description: "", faith_points: 0, requires_evidence: false });
      loadMemberData();
    } catch (error) {
      console.error("Error assigning custom task:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la tarea",
        variant: "destructive",
      });
    }
  };

  // Asignar premio desde template
  const assignRewardFromTemplate = async (templateId: string) => {
    if (!member?.cult_id || !memberId) return;

    const template = rewardTemplates.find((t) => t.id === templateId);
    if (!template) return;

    try {
      const { error } = await supabase.from("follower_rewards").insert({
        follower_id: memberId,
        cult_id: member.cult_id,
        title: template.title,
        description: template.description,
        faith_points: template.faith_points,
        is_used: false,
      });

      if (error) throw error;

      toast({ title: "Premio otorgado" });
      setShowRewardAssign(false);
      loadMemberData();
    } catch (error) {
      console.error("Error assigning reward:", error);
      toast({
        title: "Error",
        description: "No se pudo otorgar el premio",
        variant: "destructive",
      });
    }
  };

  // Asignar premio personalizado
  const assignCustomReward = async () => {
    if (!member?.cult_id || !memberId || !customRewardForm.title.trim()) return;

    try {
      const { error } = await supabase.from("follower_rewards").insert({
        follower_id: memberId,
        cult_id: member.cult_id,
        title: customRewardForm.title,
        description: customRewardForm.description || null,
        faith_points: customRewardForm.faith_points,
        is_used: false,
      });

      if (error) throw error;

      toast({ title: "Premio personalizado otorgado" });
      setShowRewardAssign(false);
      setCustomRewardForm({ title: "", description: "", faith_points: 0 });
      loadMemberData();
    } catch (error) {
      console.error("Error assigning custom reward:", error);
      toast({
        title: "Error",
        description: "No se pudo otorgar el premio",
        variant: "destructive",
      });
    }
  };

  // Asignar consecuencia desde template
  const assignConsequenceFromTemplate = async (templateId: string) => {
    if (!member?.cult_id || !memberId) return;

    const template = consequenceTemplates.find((t) => t.id === templateId);
    if (!template) return;

    try {
      const { error } = await supabase.from("follower_consequences").insert({
        follower_id: memberId,
        cult_id: member.cult_id,
        title: template.title,
        description: template.description,
        faith_points: template.faith_points,
        is_fulfilled: false,
      });

      if (error) throw error;

      toast({ title: "Consecuencia asignada" });
      setShowConsequenceAssign(false);
      loadMemberData();
    } catch (error) {
      console.error("Error assigning consequence:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la consecuencia",
        variant: "destructive",
      });
    }
  };

  // Asignar consecuencia personalizada
  const assignCustomConsequence = async () => {
    if (!member?.cult_id || !memberId || !customConsequenceForm.title.trim()) return;

    try {
      const { error } = await supabase.from("follower_consequences").insert({
        follower_id: memberId,
        cult_id: member.cult_id,
        title: customConsequenceForm.title,
        description: customConsequenceForm.description || null,
        faith_points: customConsequenceForm.faith_points,
        is_fulfilled: false,
      });

      if (error) throw error;

      toast({ title: "Consecuencia personalizada asignada" });
      setShowConsequenceAssign(false);
      setCustomConsequenceForm({ title: "", description: "", faith_points: 0 });
      loadMemberData();
    } catch (error) {
      console.error("Error assigning custom consequence:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la consecuencia",
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

            <Tabs defaultValue="perfil" className="mt-6">
              <TabsList className={`grid ${isDeity ? 'grid-cols-5' : 'grid-cols-4'} gap-1 bg-muted/30 p-1`}>
                <TabsTrigger value="perfil" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="actividad" className="text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Actividad
                </TabsTrigger>
                <TabsTrigger value="calendario" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Eventos
                </TabsTrigger>
                <TabsTrigger value="fetiches" className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  Prácticas
                </TabsTrigger>
                {isDeity && (
                  <TabsTrigger value="asignar" className="text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Asignar
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Tab: Perfil */}
              <TabsContent value="perfil" className="space-y-4 mt-4">
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

                <ParchmentCard title="Historial de Fe" icon={<Sparkles className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {faithLog.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin movimientos</p>
                    ) : (
                      faithLog.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start justify-between p-2 bg-background/50 rounded-sm border border-border/20 text-xs"
                        >
                          <div className="flex-1">
                            <p className="font-heading text-foreground">{log.reason || "—"}</p>
                            <p className="text-muted-foreground/70">
                              {new Date(log.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-mono ${log.amount > 0 ? "text-gold" : "text-wine"}`}>
                              {log.amount > 0 ? "+" : ""}{log.amount}
                            </p>
                            <p className="text-muted-foreground/70">{log.balance_after} PF</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ParchmentCard>
              </TabsContent>

              {/* Tab: Actividad */}
              <TabsContent value="actividad" className="space-y-4 mt-4">
                <ParchmentCard title="Tareas" icon={<CheckSquare className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin tareas</p>
                    ) : (
                      tasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-2 p-2 bg-background/50 rounded-sm border border-border/20">
                          {task.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm text-foreground truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {task.is_completed ? "Completada" : "Pendiente"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ParchmentCard>

                <ParchmentCard title="Premios" icon={<Gift className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {rewards.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin premios</p>
                    ) : (
                      rewards.map((reward) => (
                        <div key={reward.id} className="flex items-start gap-2 p-2 bg-background/50 rounded-sm border border-gold/20">
                          <Gift className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm text-foreground truncate">{reward.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {reward.is_used ? "Utilizado" : "Disponible"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ParchmentCard>

                <ParchmentCard title="Consecuencias" icon={<AlertTriangle className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {consequences.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin consecuencias</p>
                    ) : (
                      consequences.map((cons) => (
                        <div key={cons.id} className="flex items-start gap-2 p-2 bg-background/50 rounded-sm border border-wine/20">
                          <AlertTriangle className="w-4 h-4 text-wine flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm text-foreground truncate">{cons.title}</p>
                            <p className="text-xs text-muted-foreground">Activa</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ParchmentCard>
              </TabsContent>

              {/* Tab: Calendario */}
              <TabsContent value="calendario" className="space-y-4 mt-4">
                <ParchmentCard title="Próximos Eventos" icon={<Clock className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {events.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin eventos</p>
                    ) : (
                      events.map((event) => {
                        const eventDate = new Date(event.event_date);
                        return (
                          <div key={event.id} className="p-3 bg-background/50 rounded-sm border border-border/20">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-heading text-sm text-foreground">{event.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {eventDate.toLocaleDateString()}
                                  {event.event_time && ` · ${event.event_time}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ParchmentCard>
              </TabsContent>

              {/* Tab: Fetiches */}
              <TabsContent value="fetiches" className="space-y-4 mt-4">
                <ParchmentCard title="Prácticas y Fetiches" icon={<Heart className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {fetishes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin prácticas</p>
                    ) : (
                      fetishes.map((uf) => (
                        <div key={uf.id} className="flex items-center justify-between p-2 bg-background/50 rounded-sm border border-border/20">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="font-heading text-sm text-foreground truncate">
                              {uf.fetishes.name}
                            </p>
                            {uf.is_starred && <Star className="w-3 h-3 text-gold flex-shrink-0" />}
                          </div>
                          <Badge variant="outline" className={`text-xs ${ratingColors[uf.rating]}`}>
                            {ratingLabels[uf.rating]}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ParchmentCard>
              </TabsContent>

              {/* Tab: Asignar (solo deidades) */}
              {isDeity && (
                <TabsContent value="asignar" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <RitualButton variant="gold" onClick={() => setShowTaskAssign(true)} className="w-full">
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Asignar Tarea
                    </RitualButton>
                    <RitualButton variant="gold" onClick={() => setShowRewardAssign(true)} className="w-full">
                      <Gift className="w-4 h-4 mr-2" />
                      Otorgar Premio
                    </RitualButton>
                    <RitualButton variant="outline" onClick={() => setShowConsequenceAssign(true)} className="w-full border-wine/30 hover:bg-wine/10">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Asignar Consecuencia
                    </RitualButton>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No se pudo cargar la información</p>
          </div>
        )}
      </SheetContent>

      {/* Modal: Asignar Tarea */}
      <Dialog open={showTaskAssign} onOpenChange={setShowTaskAssign}>
        <DialogContent className="bg-card border-2 border-gold/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">Asignar Tarea</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30">
              <TabsTrigger value="templates">Biblioteca</TabsTrigger>
              <TabsTrigger value="custom">Personalizada</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-2">
              {taskTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay tareas en la biblioteca
                </p>
              ) : (
                taskTemplates.map((task) => (
                  <div key={task.id} className="p-3 bg-background/50 rounded-sm border border-border/30 space-y-2">
                    <div>
                      <h4 className="font-heading text-sm text-foreground">{task.title}</h4>
                      {task.description && (
                        <p className="font-body text-xs text-muted-foreground mt-1">{task.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {task.faith_points > 0 && (
                          <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30 text-xs">
                            +{task.faith_points} PF
                          </Badge>
                        )}
                        {task.requires_evidence && (
                          <Badge variant="outline" className="text-xs">Requiere evidencia</Badge>
                        )}
                      </div>
                    </div>
                    <RitualButton variant="outline" onClick={() => assignTaskFromTemplate(task.id)} className="w-full">
                      Asignar
                    </RitualButton>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">Título *</label>
                <Input
                  value={customTaskForm.title}
                  onChange={(e) => setCustomTaskForm({ ...customTaskForm, title: e.target.value })}
                  placeholder="Nombre de la tarea"
                />
              </div>
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">Descripción</label>
                <Textarea
                  value={customTaskForm.description}
                  onChange={(e) => setCustomTaskForm({ ...customTaskForm, description: e.target.value })}
                  placeholder="Detalles opcionales"
                  rows={3}
                />
              </div>
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">Puntos de Fe</label>
                <Input
                  type="number"
                  value={customTaskForm.faith_points}
                  onChange={(e) => setCustomTaskForm({ ...customTaskForm, faith_points: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customTaskForm.requires_evidence}
                  onChange={(e) => setCustomTaskForm({ ...customTaskForm, requires_evidence: e.target.checked })}
                  className="w-4 h-4 accent-gold"
                />
                <span className="font-body text-sm text-foreground">Requiere evidencia fotográfica</span>
              </label>
              <RitualButton variant="gold" onClick={assignCustomTask} className="w-full">
                Asignar Tarea Personalizada
              </RitualButton>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <button onClick={() => setShowTaskAssign(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              Cerrar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Otorgar Premio */}
      <Dialog open={showRewardAssign} onOpenChange={setShowRewardAssign}>
        <DialogContent className="bg-card border-2 border-gold/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">Otorgar Premio</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30">
              <TabsTrigger value="templates">Biblioteca</TabsTrigger>
              <TabsTrigger value="custom">Personalizado</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-2">
              {rewardTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay premios en la biblioteca
                </p>
              ) : (
                rewardTemplates.map((reward) => (
                  <div key={reward.id} className="p-3 bg-background/50 rounded-sm border border-border/30 space-y-2">
                    <div>
                      <h4 className="font-heading text-sm text-foreground">{reward.title}</h4>
                      {reward.description && (
                        <p className="font-body text-xs text-muted-foreground mt-1">{reward.description}</p>
                      )}
                      {reward.faith_points > 0 && (
                        <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30 text-xs mt-2">
                          {reward.faith_points} PF
                        </Badge>
                      )}
                    </div>
                    <RitualButton variant="outline" onClick={() => assignRewardFromTemplate(reward.id)} className="w-full">
                      Otorgar
                    </RitualButton>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">Título *</label>
                <Input
                  value={customRewardForm.title}
                  onChange={(e) => setCustomRewardForm({ ...customRewardForm, title: e.target.value })}
                  placeholder="Nombre del premio"
                />
              </div>
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">Descripción</label>
                <Textarea
                  value={customRewardForm.description}
                  onChange={(e) => setCustomRewardForm({ ...customRewardForm, description: e.target.value })}
                  placeholder="Detalles opcionales"
                  rows={3}
                />
              </div>
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">Costo en Puntos de Fe</label>
                <Input
                  type="number"
                  value={customRewardForm.faith_points}
                  onChange={(e) => setCustomRewardForm({ ...customRewardForm, faith_points: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <RitualButton variant="gold" onClick={assignCustomReward} className="w-full">
                Otorgar Premio Personalizado
              </RitualButton>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <button onClick={() => setShowRewardAssign(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              Cerrar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Asignar Consecuencia */}
      <Dialog open={showConsequenceAssign} onOpenChange={setShowConsequenceAssign}>
        <DialogContent className="bg-card border-2 border-gold/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">Asignar Consecuencia</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30">
              <TabsTrigger value="templates">Biblioteca</TabsTrigger>
              <TabsTrigger value="custom">Personalizada</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-2">
              {consequenceTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay consecuencias en la biblioteca
                </p>
              ) : (
                consequenceTemplates.map((cons) => (
                  <div key={cons.id} className="p-3 bg-background/50 rounded-sm border border-border/30 space-y-2">
                    <div>
                      <h4 className="font-heading text-sm text-foreground">{cons.title}</h4>
                      {cons.description && (
                        <p className="font-body text-xs text-muted-foreground mt-1">{cons.description}</p>
                      )}
                      {cons.faith_points > 0 && (
                        <Badge variant="outline" className="bg-wine/20 text-wine border-wine/40 text-xs mt-2">
                          {cons.faith_points} PF para quitar
                        </Badge>
                      )}
                    </div>
                    <RitualButton variant="outline" onClick={() => assignConsequenceFromTemplate(cons.id)} className="w-full">
                      Asignar
                    </RitualButton>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">Título *</label>
                <Input
                  value={customConsequenceForm.title}
                  onChange={(e) => setCustomConsequenceForm({ ...customConsequenceForm, title: e.target.value })}
                  placeholder="Nombre de la consecuencia"
                />
              </div>
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">Descripción</label>
                <Textarea
                  value={customConsequenceForm.description}
                  onChange={(e) => setCustomConsequenceForm({ ...customConsequenceForm, description: e.target.value })}
                  placeholder="Detalles opcionales"
                  rows={3}
                />
              </div>
              <div>
                <label className="font-heading text-xs text-muted-foreground uppercase block mb-1">Puntos de Fe para eliminar</label>
                <Input
                  type="number"
                  value={customConsequenceForm.faith_points}
                  onChange={(e) => setCustomConsequenceForm({ ...customConsequenceForm, faith_points: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <RitualButton variant="gold" onClick={assignCustomConsequence} className="w-full">
                Asignar Consecuencia Personalizada
              </RitualButton>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <button onClick={() => setShowConsequenceAssign(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              Cerrar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}