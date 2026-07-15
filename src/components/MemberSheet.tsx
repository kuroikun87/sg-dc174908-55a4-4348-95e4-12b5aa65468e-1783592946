import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Sparkles,
  Heart,
  Calendar,
  Gift,
  AlertTriangle,
  Settings,
  FileText,
  Crown,
  Loader2,
  Star,
  Circle,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface MemberSheetProps {
  memberId: string | null;
  isOpen: boolean;
  onClose: () => void;
  viewerRole: "deity" | "follower" | null;
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
  ranks: { name: string; level: number } | null;
}

export function MemberSheet({ memberId, isOpen, onClose, viewerRole }: MemberSheetProps) {
  const { toast } = useToast();
  const [member, setMember] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [consequences, setConsequences] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [fetishes, setFetishes] = useState<any[]>([]);
  const [faithLog, setFaithLog] = useState<any[]>([]);

  useEffect(() => {
    if (memberId && isOpen) {
      loadMemberData();
    }
  }, [memberId, isOpen]);

  const loadMemberData = async () => {
    if (!memberId) return;
    setIsLoading(true);

    try {
      // Cargar perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*, ranks(name, level)")
        .eq("id", memberId)
        .single();

      if (profileError) throw profileError;
      setMember(profileData);

      // Cargar tareas asignadas
      const { data: tasksData } = await supabase
        .from("assigned_tasks")
        .select("*, tasks(*)")
        .eq("follower_id", memberId)
        .order("created_at", { ascending: false })
        .limit(10);
      setTasks(tasksData || []);

      // Cargar premios
      const { data: rewardsData } = await supabase
        .from("awarded_rewards")
        .select("*, rewards(*)")
        .eq("follower_id", memberId)
        .order("awarded_at", { ascending: false })
        .limit(10);
      setRewards(rewardsData || []);

      // Cargar consecuencias
      const { data: consequencesData } = await supabase
        .from("assigned_punishments")
        .select("*, punishments(*)")
        .eq("follower_id", memberId)
        .eq("is_removed", false)
        .order("assigned_at", { ascending: false });
      setConsequences(consequencesData || []);

      // Cargar eventos del calendario
      const { data: eventsData } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", memberId)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(5);
      setEvents(eventsData || []);

      // Cargar fetiches con ratings
      const { data: fetishesData } = await supabase
        .from("user_fetishes")
        .select("*, fetishes(*)")
        .eq("user_id", memberId);
      setFetishes(fetishesData || []);

      // Cargar historial de PF
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

              {/* Balance de Puntos de Fe */}
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
              <TabsList className="grid grid-cols-4 gap-1 bg-muted/30 p-1">
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
              </TabsList>

              {/* Tab: Perfil */}
              <TabsContent value="perfil" className="space-y-4 mt-4">
                <ParchmentCard title="Información Personal" icon={<User className="w-4 h-4" />}>
                  <div className="space-y-3">
                    {member.bio && (
                      <div>
                        <p className="font-heading text-xs text-muted-foreground uppercase mb-1">
                          Bio
                        </p>
                        <p className="font-body text-sm text-foreground">{member.bio}</p>
                      </div>
                    )}
                    {member.pronouns && (
                      <div>
                        <p className="font-heading text-xs text-muted-foreground uppercase mb-1">
                          Pronombres
                        </p>
                        <p className="font-body text-sm text-foreground">{member.pronouns}</p>
                      </div>
                    )}
                    {member.birth_date && (
                      <div>
                        <p className="font-heading text-xs text-muted-foreground uppercase mb-1">
                          Fecha de nacimiento
                        </p>
                        <p className="font-body text-sm text-foreground">
                          {new Date(member.birth_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </ParchmentCard>

                {/* Historial de Puntos de Fe */}
                <ParchmentCard title="Historial de Fe" icon={<Sparkles className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {faithLog.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sin movimientos
                      </p>
                    ) : (
                      faithLog.map((log, i) => (
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
                            <p
                              className={`font-mono ${
                                log.amount > 0 ? "text-gold" : "text-wine"
                              }`}
                            >
                              {log.amount > 0 ? "+" : ""}
                              {log.amount}
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
                {/* Tareas */}
                <ParchmentCard title="Tareas" icon={<Settings className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sin tareas asignadas
                      </p>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-2 p-2 bg-background/50 rounded-sm border border-border/20"
                        >
                          {task.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm text-foreground truncate">
                              {task.tasks.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {task.status === "completed" ? "Completada" : "Pendiente"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ParchmentCard>

                {/* Premios */}
                <ParchmentCard title="Premios" icon={<Gift className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {rewards.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sin premios
                      </p>
                    ) : (
                      rewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="flex items-start gap-2 p-2 bg-background/50 rounded-sm border border-gold/20"
                        >
                          <Gift className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm text-foreground truncate">
                              {reward.rewards.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reward.awarded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ParchmentCard>

                {/* Consecuencias */}
                <ParchmentCard title="Consecuencias" icon={<AlertTriangle className="w-4 h-4" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {consequences.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sin consecuencias activas
                      </p>
                    ) : (
                      consequences.map((cons) => (
                        <div
                          key={cons.id}
                          className="flex items-start gap-2 p-2 bg-background/50 rounded-sm border border-wine/20"
                        >
                          <AlertTriangle className="w-4 h-4 text-wine flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm text-foreground truncate">
                              {cons.punishments.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(cons.assigned_at).toLocaleDateString()}
                            </p>
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
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sin eventos próximos
                      </p>
                    ) : (
                      events.map((event) => {
                        const eventDate = new Date(event.event_date);
                        return (
                          <div
                            key={event.id}
                            className="p-3 bg-background/50 rounded-sm border border-border/20"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-heading text-sm text-foreground">
                                  {event.title}
                                </p>
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
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No ha marcado prácticas
                      </p>
                    ) : (
                      fetishes.map((uf) => (
                        <div
                          key={uf.id}
                          className="flex items-center justify-between p-2 bg-background/50 rounded-sm border border-border/20"
                        >
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