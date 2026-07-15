import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberSheet } from "@/components/MemberSheet";
import { Users, Crown, Heart, Loader2, ChevronDown } from "lucide-react";

interface HierarchyPerson {
  id: string;
  display_name: string | null;
  title: string | null;
  role: string | null;
  is_main_deity: boolean;
  avatar_url: string | null;
  rank_name?: string | null;
}

export default function JerarquiaPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [mainDeity, setMainDeity] = useState<HierarchyPerson | null>(null);
  const [deities, setDeities] = useState<HierarchyPerson[]>([]);
  const [followers, setFollowers] = useState<HierarchyPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetchHierarchy();
  }, [profile?.cult_id]);

  const fetchHierarchy = async () => {
    if (!profile?.cult_id) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch main deity
      const { data: cultData, error: cultError } = await supabase
        .from("cults")
        .select("main_deity_id")
        .eq("id", profile.cult_id)
        .single();

      if (cultError) throw cultError;

      if (cultData?.main_deity_id) {
        const { data: mainDeityData, error: mainDeityError } = await supabase
          .from("profiles")
          .select("id, display_name, title, role, is_main_deity, avatar_url")
          .eq("id", cultData.main_deity_id)
          .maybeSingle();
        
        if (!mainDeityError && mainDeityData) {
          setMainDeity(mainDeityData as HierarchyPerson);
        }
      }

      // Fetch all profiles from the cult
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, title, role, is_main_deity, avatar_url, rank_id")
        .eq("cult_id", profile.cult_id);

      if (profilesError) throw profilesError;

      if (allProfiles) {
        // Get all rank_ids to fetch rank names
        const rankIds = allProfiles
          .map(p => (p as any).rank_id)
          .filter(Boolean);

        let ranksMap: Record<string, string> = {};
        if (rankIds.length > 0) {
          const { data: ranksData } = await supabase
            .from("ranks")
            .select("id, name")
            .in("id", rankIds);

          if (ranksData) {
            ranksMap = Object.fromEntries(ranksData.map(r => [r.id, r.name]));
          }
        }

        // Separate deities and followers
        const deitiesList: HierarchyPerson[] = [];
        const followersList: HierarchyPerson[] = [];

        allProfiles.forEach((p: any) => {
          const person: HierarchyPerson = {
            id: p.id,
            display_name: p.display_name,
            title: p.title,
            role: p.role,
            is_main_deity: p.is_main_deity,
            avatar_url: p.avatar_url,
            rank_name: p.rank_id ? ranksMap[p.rank_id] : null,
          };

          if (p.role === "deity" && p.id !== cultData?.main_deity_id) {
            deitiesList.push(person);
          } else if (p.role === "follower") {
            followersList.push(person);
          }
        });

        setDeities(deitiesList);
        setFollowers(followersList);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: `No se pudo cargar la jerarquía: ${msg}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openMemberSheet = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsSheetOpen(true);
  };

  const closeMemberSheet = () => {
    setIsSheetOpen(false);
    setSelectedMemberId(null);
  };

  function HierarchyNode({ person, isMain = false, isDeity = false }: { person: HierarchyPerson; isMain?: boolean; isDeity?: boolean }) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          relative flex flex-col items-center p-4 rounded-sm border
          ${isMain 
            ? "bg-wine/10 border-wine/40 shadow-lg shadow-wine/10" 
            : isDeity
              ? "bg-gold/5 border-gold/30"
              : "bg-card/40 border-border/40"
          }
          min-w-[140px]
        `}
      >
        <div className={`
          w-14 h-14 rounded-full border-2 flex items-center justify-center mb-2
          ${isMain ? "border-wine bg-wine/20" : isDeity ? "border-gold bg-gold/20" : "border-border/60 bg-muted/30"}
        `}>
          {isMain ? (
            <Crown className="w-6 h-6 text-wine" />
          ) : isDeity ? (
            <Crown className="w-5 h-5 text-gold" />
          ) : (
            <Heart className="w-5 h-5 text-muted-foreground/60" />
          )}
        </div>
        <h3 className={`font-heading text-sm ${isMain ? "text-wine" : "text-foreground"}`}>
          {person.display_name || "Sin nombre"}
        </h3>
        <p className="font-body text-xs text-muted-foreground mt-1">{person.title || "Sin título"}</p>
        {person.rank_name && (
          <span className="mt-2 px-2 py-0.5 bg-muted/40 rounded-sm font-body text-xs text-muted-foreground">
            {person.rank_name}
          </span>
        )}
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <AppLayout title="Jerarquía" icon={<Users className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <AppLayout title="Jerarquía" icon={<Users className="w-5 h-5" />}>
        <BookPage pageKey="jerarquia">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl text-foreground">La Pirámide Sagrada</h1>
              <p className="font-body text-muted-foreground">Estructura de poder del culto</p>
            </div>

            {/* Pirámide visual */}
            <div className="flex flex-col items-center space-y-6">
              {/* Nivel 0: Deidad Principal */}
              {mainDeity && (
                <div className="relative">
                  <HierarchyNode person={mainDeity} isMain />
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2"
                  >
                    <ChevronDown className="w-4 h-4 text-gold/40" />
                  </motion.div>
                </div>
              )}

              {/* Nivel 1: Deidades menores */}
              {deities.length > 0 && (
                <>
                  <div className="flex gap-6 items-start flex-wrap justify-center">
                    {deities.map((deity) => (
                      <div key={deity.id} className="relative">
                        <HierarchyNode person={deity} isDeity />
                        <div className="absolute -top-6 left-1/2 w-px h-6 bg-border/40 -translate-x-1/2" />
                      </div>
                    ))}
                  </div>
                  <div className="w-px h-4 bg-border/30" />
                </>
              )}

              {/* Nivel 2-3: Fieles */}
              {followers.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {followers.map((follower, i) => (
                    <motion.div
                      key={follower.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <HierarchyNode person={follower} />
                    </motion.div>
                  ))}
                </div>
              )}

              {followers.length === 0 && deities.length === 0 && !mainDeity && (
                <p className="font-body text-muted-foreground text-center py-10">
                  No hay miembros en el culto todavía.
                </p>
              )}
            </div>

            {/* Lista de miembros */}
            <ParchmentCard title="Miembros del Culto" icon={<Users className="w-4 h-4" />}>
              <div className="space-y-4">
                {/* Deidades */}
                <div className="space-y-2">
                  <h3 className="font-heading text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Crown className="w-3 h-3 text-wine" />
                    Deidades
                  </h3>
                  <div className="space-y-2">
                    {deities.length === 0 ? (
                      <p className="font-body text-sm text-muted-foreground/70 pl-4">
                        No hay deidades registradas
                      </p>
                    ) : (
                      deities.map((member, i) => (
                        <motion.button
                          key={member.id}
                          onClick={() => openMemberSheet(member.id)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="w-full flex items-center gap-3 p-3 bg-background/50 rounded-sm border border-wine/30 
                                   hover:border-wine/60 hover:bg-wine/5 transition-all cursor-pointer text-left"
                        >
                          <Avatar className="w-12 h-12 border-2 border-wine/30">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className="bg-muted text-foreground font-display">
                              {member.display_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-heading text-sm text-foreground truncate">
                                {member.display_name || "Sin nombre"}
                              </p>
                              {member.is_main_deity && (
                                <Crown className="w-4 h-4 text-wine flex-shrink-0" />
                              )}
                            </div>
                            <p className="font-body text-xs text-gold truncate">
                              {member.title || "Sin título"}
                            </p>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>

                {/* Fieles */}
                <div className="space-y-2">
                  <h3 className="font-heading text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Heart className="w-3 h-3 text-gold" />
                    Fieles
                  </h3>
                  <div className="space-y-2">
                    {followers.length === 0 ? (
                      <p className="font-body text-sm text-muted-foreground/70 pl-4">
                        No hay fieles registrados
                      </p>
                    ) : (
                      followers.map((member, i) => (
                        <motion.button
                          key={member.id}
                          onClick={() => openMemberSheet(member.id)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (deities.length + i) * 0.05 }}
                          className="w-full flex items-center gap-3 p-3 bg-background/50 rounded-sm border border-border/30 
                                   hover:border-gold/60 hover:bg-gold/5 transition-all cursor-pointer text-left"
                        >
                          <Avatar className="w-12 h-12 border-2 border-gold/30">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className="bg-muted text-foreground font-display">
                              {member.display_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm text-foreground truncate">
                              {member.display_name || "Sin nombre"}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="font-body text-xs text-muted-foreground truncate">
                                {member.title || "Sin título"}
                              </p>
                              {member.rank_name && (
                                <span className="text-xs text-gold">
                                  · {member.rank_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </ParchmentCard>
          </div>
        </BookPage>
      </AppLayout>

      {/* Ficha personal */}
      <MemberSheet
        memberId={selectedMemberId}
        isOpen={isSheetOpen}
        onClose={closeMemberSheet}
      />
    </>
  );
}