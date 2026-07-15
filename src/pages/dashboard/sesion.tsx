import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  VolumeX,
  Volume2,
  Circle,
  Plus,
  Trash2,
  Radio,
  Loader2,
  Users,
  X,
  Save,
  Mic,
  StopCircle,
  FileAudio,
  Zap,
} from "lucide-react";

interface BeatPattern {
  id: string;
  name: string;
  pattern_data: any; // jsonb
  created_at: string;
}

interface SessionCard {
  id: string;
  card_type: string;
  title: string;
  description: string | null;
  is_template: boolean;
}

interface SessionAudio {
  id: string;
  name: string;
  audio_url: string;
  duration_seconds: number;
  created_at: string;
}

interface ActiveSession {
  id: string;
  follower_ids: string[];
  current_rpm: number;
  is_playing: boolean;
  is_muted_for_deity: boolean;
  current_card_id: string | null;
  card_duration_seconds: number | null;
  card_show_timer: boolean;
  card_started_at: string | null;
  manual_beat_trigger: string | null;
}

interface Follower {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function SesionPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs para valores que se usan en Realtime pero no deben recrear el canal
  const cardsRef = useRef<SessionCard[]>([]);
  const activeSessionRef = useRef<ActiveSession | null>(null);
  
  // Estado de la sesión
  const [rpm, setRpm] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [beatScale, setBeatScale] = useState(1);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [selectedFollowers, setSelectedFollowers] = useState<string[]>([]);
  const [availableFollowers, setAvailableFollowers] = useState<Follower[]>([]);
  
  // Patrones, tarjetas y audios
  const [patterns, setPatterns] = useState<BeatPattern[]>([]);
  const [cards, setCards] = useState<SessionCard[]>([]);
  const [audios, setAudios] = useState<SessionAudio[]>([]);
  
  // Grabación de patrones
  const [isRecording, setIsRecording] = useState(false);
  const [recordedIntervals, setRecordedIntervals] = useState<number[]>([]);
  const [lastBeatTime, setLastBeatTime] = useState<number | null>(null);
  const [newPatternName, setNewPatternName] = useState("");
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [ecgBeats, setEcgBeats] = useState<number[]>([]); // Timestamps relativos de cada beat
  
  // Nueva tarjeta
  const [showCardForm, setShowCardForm] = useState(false);
  const [newCardType, setNewCardType] = useState("action");
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  
  // Tarjeta activa
  const [activeCard, setActiveCard] = useState<SessionCard | null>(null);
  const [cardDuration, setCardDuration] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(true);
  const [cardTimeLeft, setCardTimeLeft] = useState<number | null>(null);
  
  // Modal de configuración de tarjeta
  const [showCardConfig, setShowCardConfig] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SessionCard | null>(null);
  const [configDuration, setConfigDuration] = useState(60);
  const [configShowTimer, setConfigShowTimer] = useState(true);
  const [configIsPermanent, setConfigIsPermanent] = useState(false);

  const isDeity = profile?.role === "deity";

  useEffect(() => {
    loadData();
    
    // Inicializar AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  // Beat automático
  useEffect(() => {
    if (!isPlaying) return;

    const interval = 60000 / rpm; // milisegundos por beat
    const beatInterval = setInterval(() => {
      // Los fieles siempre escuchan; las deidades respetan el mute
      if (isDeity && isMuted) return;
      playBeat();
      animateBeatCircle();
    }, interval);

    return () => clearInterval(beatInterval);
  }, [isPlaying, rpm, isMuted, isDeity]);

  // Temporizador de tarjeta
  useEffect(() => {
    if (!cardDuration || !activeCard) return;

    const timer = setInterval(() => {
      setCardTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          setActiveCard(null);
          setCardDuration(null);
          setCardTimeLeft(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cardDuration, activeCard]);

  // Sincronización con Supabase Realtime
  useEffect(() => {
    if (!activeSession) return;

    console.log(`[Realtime] Subscribing to session: ${activeSession.id}`);

    const channel = supabase
      .channel(`session:${activeSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_sessions",
          filter: `id=eq.${activeSession.id}`,
        },
        (payload) => {
          console.log("[Realtime] Received update:", payload);
          
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as ActiveSession;
            
            // Actualizar RPM
            if (updated.current_rpm !== rpm) {
              console.log(`[Realtime] RPM changed: ${rpm} → ${updated.current_rpm}`);
              setRpm(updated.current_rpm);
            }
            
            // Actualizar play/pause
            if (updated.is_playing !== isPlaying) {
              console.log(`[Realtime] Playing changed: ${isPlaying} → ${updated.is_playing}`);
              setIsPlaying(updated.is_playing);
            }
            
            // Actualizar mute (solo deidades)
            if (isDeity && updated.is_muted_for_deity !== isMuted) {
              console.log(`[Realtime] Mute changed: ${isMuted} → ${updated.is_muted_for_deity}`);
              setIsMuted(updated.is_muted_for_deity);
            }
            
            // Reproducir beat manual (solo fieles) - usar ref para comparación
            if (!isDeity && updated.manual_beat_trigger) {
              const oldTrigger = activeSessionRef.current?.manual_beat_trigger;
              if (oldTrigger !== updated.manual_beat_trigger) {
                console.log(`[Realtime] Manual beat triggered: ${oldTrigger} → ${updated.manual_beat_trigger}`);
                playBeat();
                animateBeatCircle();
              }
            }
            
            // Actualizar tarjeta activa - usar ref para buscar tarjetas
            if (updated.current_card_id && updated.current_card_id !== activeCard?.id) {
              console.log(`[Realtime] Card changed: ${activeCard?.id} → ${updated.current_card_id}`);
              const card = cardsRef.current.find(c => c.id === updated.current_card_id);
              if (card) {
                setActiveCard(card);
                setCardDuration(updated.card_duration_seconds);
                setShowTimer(updated.card_show_timer);
                
                // Calcular tiempo restante
                if (updated.card_duration_seconds && updated.card_started_at) {
                  const elapsed = Math.floor((Date.now() - new Date(updated.card_started_at).getTime()) / 1000);
                  const remaining = updated.card_duration_seconds - elapsed;
                  setCardTimeLeft(remaining > 0 ? remaining : 0);
                } else {
                  setCardTimeLeft(updated.card_duration_seconds);
                }
              }
            } else if (!updated.current_card_id && activeCard) {
              console.log("[Realtime] Card removed");
              setActiveCard(null);
              setCardDuration(null);
              setCardTimeLeft(null);
            }
            
            // Actualizar referencia local de activeSession
            setActiveSession(updated);
          }
        }
      )
      .subscribe((status) => {
        console.log("[Realtime] Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] Successfully subscribed to session updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("[Realtime] Channel error - real-time updates may not work");
          toast({
            title: "Error de sincronización",
            description: "La sincronización en tiempo real puede no funcionar correctamente",
            variant: "destructive",
          });
        }
      });

    return () => {
      console.log("[Realtime] Unsubscribing from session");
      supabase.removeChannel(channel);
    };
  }, [activeSession?.id, isDeity]);

  const loadData = async () => {
    if (!user || !profile?.cult_id) {
      setIsLoading(false);
      return;
    }

    try {
      // Cargar patrones (solo para deidades)
      if (isDeity) {
        const { data: patternsData } = await supabase
          .from("beat_patterns")
          .select("*")
          .eq("cult_id", profile.cult_id)
          .order("created_at", { ascending: false });
        setPatterns(patternsData || []);
      }

      // Cargar tarjetas (todos las necesitan para mostrar cuando llegan por Realtime)
      const { data: cardsData } = await supabase
        .from("session_cards")
        .select("*")
        .eq("cult_id", profile.cult_id)
        .order("created_at", { ascending: false });
      setCards(cardsData || []);

      // Cargar audios (solo para deidades)
      if (isDeity) {
        const { data: audiosData } = await supabase
          .from("session_audios")
          .select("*")
          .eq("cult_id", profile.cult_id)
          .order("created_at", { ascending: false });
        setAudios(audiosData || []);
      }

      // Cargar fieles disponibles (solo para deidades)
      if (isDeity) {
        const { data: followersData } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .eq("cult_id", profile.cult_id)
          .eq("role", "follower");
        setAvailableFollowers(followersData || []);
      }

      // Verificar sesión activa
      let sessionData = null;
      
      if (isDeity) {
        const { data } = await supabase
          .from("active_sessions")
          .select("*")
          .eq("deity_id", user.id)
          .eq("is_active", true)
          .maybeSingle();
        sessionData = data;
      } else {
        // Para fieles: buscar sesiones donde user.id esté en follower_ids
        const { data } = await supabase
          .from("active_sessions")
          .select("*")
          .contains("follower_ids", [user.id])
          .eq("is_active", true)
          .maybeSingle();
        sessionData = data;
      }

      if (sessionData) {
        setActiveSession(sessionData);
        setSelectedFollowers(sessionData.follower_ids || []);
        setRpm(sessionData.current_rpm);
        setIsPlaying(sessionData.is_playing);
        if (isDeity) {
          setIsMuted(sessionData.is_muted_for_deity);
        }
        
        // Si hay tarjeta activa, cargarla
        if (sessionData.current_card_id && cardsData) {
          const card = cardsData.find(c => c.id === sessionData.current_card_id);
          if (card) {
            setActiveCard(card);
            setCardDuration(sessionData.card_duration_seconds);
            setShowTimer(sessionData.card_show_timer);
            
            // Calcular tiempo restante
            if (sessionData.card_duration_seconds && sessionData.card_started_at) {
              const elapsed = Math.floor((Date.now() - new Date(sessionData.card_started_at).getTime()) / 1000);
              const remaining = sessionData.card_duration_seconds - elapsed;
              setCardTimeLeft(remaining > 0 ? remaining : 0);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading session data:", error);
    }

    setIsLoading(false);
  };

  const playBeat = () => {
    // Solo las deidades pueden silenciarse; los fieles siempre escuchan
    if (isDeity && isMuted) return;
    
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 440; // La 440Hz
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const animateBeatCircle = () => {
    setBeatScale(1.5);
    setTimeout(() => setBeatScale(1), 150);
  };

  const togglePlay = async () => {
    const newState = !isPlaying;
    setIsPlaying(newState);

    if (activeSession && isDeity) {
      await supabase
        .from("active_sessions")
        .update({ is_playing: newState, updated_at: new Date().toISOString() })
        .eq("id", activeSession.id);
    }
  };

  const toggleMute = async () => {
    const newState = !isMuted;
    setIsMuted(newState);

    if (activeSession && isDeity) {
      await supabase
        .from("active_sessions")
        .update({ is_muted_for_deity: newState, updated_at: new Date().toISOString() })
        .eq("id", activeSession.id);
    }
  };

  const handleRpmChange = async (value: number[]) => {
    const newRpm = value[0];
    setRpm(newRpm);

    if (activeSession && isDeity) {
      await supabase
        .from("active_sessions")
        .update({ current_rpm: newRpm, updated_at: new Date().toISOString() })
        .eq("id", activeSession.id);
    }
  };

  const manualBeat = async () => {
    playBeat();
    animateBeatCircle();

    // Sincronizar beat manual con fieles (solo deidades)
    if (activeSession && isDeity) {
      await supabase
        .from("active_sessions")
        .update({
          manual_beat_trigger: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeSession.id);
    }

    if (isRecording) {
      const now = Date.now();
      if (lastBeatTime !== null && recordingStartTime !== null) {
        const interval = now - lastBeatTime;
        setRecordedIntervals([...recordedIntervals, interval]);
        const relativeTime = now - recordingStartTime;
        setEcgBeats([...ecgBeats, relativeTime]);
      } else if (recordingStartTime !== null) {
        // Primer beat
        setEcgBeats([0]);
      }
      setLastBeatTime(now);
    }
  };

  const startRecording = () => {
    const now = Date.now();
    setIsRecording(true);
    setRecordedIntervals([]);
    setLastBeatTime(null);
    setRecordingStartTime(now);
    setEcgBeats([]);
    toast({
      title: "Grabando patrón",
      description: "Pulsa el botón de beat siguiendo el ritmo deseado",
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    setLastBeatTime(null);
    setRecordingStartTime(null);
  };

  const savePattern = async () => {
    if (!newPatternName.trim() || recordedIntervals.length < 2 || !profile?.cult_id || !user) return;

    const { error } = await supabase.from("beat_patterns").insert({
      cult_id: profile.cult_id,
      creator_id: user.id,
      name: newPatternName,
      pattern_data: { intervals: recordedIntervals },
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo guardar el patrón: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Patrón guardado",
        description: `${newPatternName} se ha guardado correctamente`,
      });
      setNewPatternName("");
      setRecordedIntervals([]);
      setIsRecording(false);
      loadData();
    }
  };

  const deletePattern = async (id: string) => {
    const { error } = await supabase.from("beat_patterns").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Patrón eliminado" });
      loadData();
    }
  };

  const createCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !user || !profile?.cult_id) return;

    const { error } = await supabase.from("session_cards").insert({
      cult_id: profile.cult_id,
      creator_id: user.id,
      title: newCardTitle,
      description: newCardDescription || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear la tarjeta: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Tarjeta creada" });
      setNewCardTitle("");
      setNewCardDescription("");
      setShowCardForm(false);
      loadData();
    }
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from("session_cards").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Tarjeta eliminada" });
      loadData();
    }
  };

  const openCardConfig = (card: SessionCard) => {
    setSelectedCard(card);
    setConfigDuration(60);
    setConfigShowTimer(true);
    setConfigIsPermanent(false);
    setShowCardConfig(true);
  };

  const sendCardWithConfig = async () => {
    if (!activeSession || !isDeity || !selectedCard) return;

    const duration = configIsPermanent ? null : configDuration;

    await supabase
      .from("active_sessions")
      .update({
        current_card_id: selectedCard.id,
        card_duration_seconds: duration,
        card_show_timer: configShowTimer,
        card_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeSession.id);

    setActiveCard(selectedCard);
    setCardDuration(duration);
    setShowTimer(configShowTimer);
    setCardTimeLeft(duration);
    setShowCardConfig(false);
    setSelectedCard(null);
  };

  const sendCard = async (card: SessionCard, duration: number | null, showTimer: boolean) => {
    if (!activeSession || !isDeity) return;

    await supabase
      .from("active_sessions")
      .update({
        current_card_id: card.id,
        card_duration_seconds: duration,
        card_show_timer: showTimer,
        card_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeSession.id);

    setActiveCard(card);
    setCardDuration(duration);
    setShowTimer(showTimer);
    setCardTimeLeft(duration);
  };

  const removeCard = async () => {
    if (!activeSession || !isDeity) return;

    await supabase
      .from("active_sessions")
      .update({
        current_card_id: null,
        card_duration_seconds: null,
        card_show_timer: true,
        card_started_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeSession.id);

    setActiveCard(null);
    setCardDuration(null);
    setCardTimeLeft(null);
  };

  const startSession = async () => {
    if (!user || !profile?.cult_id || selectedFollowers.length === 0) {
      toast({
        title: "Selecciona fieles",
        description: "Debes seleccionar al menos un fiel para iniciar la sesión",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("active_sessions")
      .insert({
        cult_id: profile.cult_id,
        deity_id: user.id,
        follower_ids: selectedFollowers,
        current_rpm: rpm,
        is_playing: false,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo iniciar la sesión: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setActiveSession(data);
      toast({ title: "Sesión iniciada" });
    }
  };

  const endSession = async () => {
    if (!activeSession || !isDeity) return;

    await supabase.from("active_sessions").update({ is_active: false }).eq("id", activeSession.id);

    setActiveSession(null);
    setSelectedFollowers([]);
    setIsPlaying(false);
    setActiveCard(null);
    toast({ title: "Sesión finalizada" });
  };

  const toggleFollowerSelection = (followerId: string) => {
    setSelectedFollowers((prev) =>
      prev.includes(followerId)
        ? prev.filter((id) => id !== followerId)
        : [...prev, followerId]
    );
  };

  // Componente de visualización ECG
  function ECGVisualization() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
      if (!isRecording || !canvasRef.current || !recordingStartTime) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const timeWindow = 10000; // 10 segundos visibles

      const draw = () => {
        const now = Date.now();
        const elapsed = now - recordingStartTime;

        // Limpiar
        ctx.fillStyle = "#1a0f0a";
        ctx.fillRect(0, 0, width, height);

        // Línea base
        ctx.strokeStyle = "#43362b40";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Línea ECG avanzando
        const currentX = ((elapsed % timeWindow) / timeWindow) * width;
        ctx.strokeStyle = "#D4AF3780";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, height);
        ctx.stroke();

        // Dibujar beats
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 3;
        ecgBeats.forEach((beatTime) => {
          const timeSinceBeat = elapsed - beatTime;
          if (timeSinceBeat >= 0 && timeSinceBeat < timeWindow) {
            const x = ((timeSinceBeat / timeWindow) * width + currentX) % width;
            
            // Forma del beat: spike hacia arriba
            ctx.beginPath();
            ctx.moveTo(x - 10, centerY);
            ctx.lineTo(x - 5, centerY - 40);
            ctx.lineTo(x, centerY);
            ctx.lineTo(x + 5, centerY + 20);
            ctx.lineTo(x + 10, centerY);
            ctx.stroke();
          }
        });

        // Tiempo transcurrido
        ctx.fillStyle = "#D4AF37";
        ctx.font = "12px monospace";
        ctx.fillText(`${(elapsed / 1000).toFixed(1)}s`, 10, 20);

        animationFrameRef.current = requestAnimationFrame(draw);
      };

      animationFrameRef.current = requestAnimationFrame(draw);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isRecording, ecgBeats, recordingStartTime]);

    if (!isRecording) return null;

    return (
      <div className="relative w-full h-32 bg-background/80 rounded-sm border border-gold/30 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={128}
          className="w-full h-full"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <AppLayout title="Sesión" icon={<Radio className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Sesión BDSM" icon={<Radio className="w-5 h-5" />}>
      <BookPage pageKey="sesion">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Control Ritual</h1>
            <p className="font-body text-muted-foreground">
              {isDeity ? "Dirección de la sesión" : "Seguimiento de la sesión"}
            </p>
          </div>

          {/* Selección de fieles (solo deidades sin sesión activa) */}
          {isDeity && !activeSession && (
            <ParchmentCard title="Seleccionar Fieles" icon={<Users className="w-4 h-4" />}>
              <div className="space-y-3">
                {availableFollowers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay fieles disponibles
                  </p>
                ) : (
                  availableFollowers.map((follower) => (
                    <motion.button
                      key={follower.id}
                      onClick={() => toggleFollowerSelection(follower.id)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-sm border transition-all
                        ${
                          selectedFollowers.includes(follower.id)
                            ? "bg-gold/20 border-gold/60"
                            : "bg-background/50 border-border/30 hover:border-gold/40"
                        }
                      `}
                    >
                      <Avatar className="w-10 h-10 border-2 border-gold/30">
                        <AvatarImage src={follower.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted text-foreground font-display">
                          {follower.display_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-heading text-sm text-foreground">
                        {follower.display_name || "Sin nombre"}
                      </span>
                    </motion.button>
                  ))
                )}
                {selectedFollowers.length > 0 && (
                  <RitualButton variant="gold" onClick={startSession} className="w-full mt-4">
                    <Zap className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </RitualButton>
                )}
              </div>
            </ParchmentCard>
          )}

          {/* Controles de Beat */}
          {activeSession && (
            <div className="space-y-4">
              {/* Layout adaptativo: tarjeta arriba + beat abajo */}
              <div className="relative min-h-[400px]">
                {/* Tarjeta activa - desliza desde arriba */}
                <AnimatePresence>
                  {activeCard && (
                    <motion.div
                      initial={{ opacity: 0, y: -100 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -100 }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      className="mb-4"
                    >
                      <ParchmentCard title="Tarjeta Activa" icon={<Zap className="w-4 h-4" />}>
                        <div className="space-y-3">
                          <div className="p-4 bg-gold/10 rounded-sm border border-gold/30">
                            <h3 className="font-display text-lg text-foreground mb-2">
                              {activeCard.title}
                            </h3>
                            {activeCard.description && (
                              <p className="font-body text-sm text-muted-foreground">
                                {activeCard.description}
                              </p>
                            )}
                          </div>
                          {cardTimeLeft !== null && showTimer && (
                            <div className="text-center">
                              <span className="font-mono text-2xl text-gold">
                                {Math.floor(cardTimeLeft / 60)}:{(cardTimeLeft % 60).toString().padStart(2, "0")}
                              </span>
                            </div>
                          )}
                          {isDeity && (
                            <RitualButton variant="outline" onClick={removeCard} className="w-full">
                              <X className="w-4 h-4 mr-2" />
                              Retirar Tarjeta
                            </RitualButton>
                          )}
                        </div>
                      </ParchmentCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Beat - desliza hacia abajo cuando aparece tarjeta */}
                <motion.div
                  animate={{
                    y: activeCard ? 0 : -80,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                  <ParchmentCard title="Control de Ritmo" icon={<Circle className="w-4 h-4" />}>
                    <div className="space-y-6">
                      {/* Visualización del beat */}
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          animate={{ scale: beatScale }}
                          transition={{ type: "spring", stiffness: 300, damping: 10 }}
                          className="w-32 h-32 rounded-full bg-gradient-to-br from-wine/40 to-gold/40 
                                   border-4 border-gold/60 shadow-lg shadow-gold/20"
                        />
                      </div>

                      {/* Controles */}
                      {isDeity && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="font-heading text-xs text-muted-foreground uppercase">
                              RPM: {rpm}
                            </label>
                            <Slider
                              value={[rpm]}
                              onValueChange={handleRpmChange}
                              min={30}
                              max={180}
                              step={5}
                              className="w-full"
                            />
                          </div>

                          <div className="flex gap-2">
                            <RitualButton
                              variant={isPlaying ? "outline" : "gold"}
                              onClick={togglePlay}
                              className="flex-1"
                            >
                              {isPlaying ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pausar
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Reproducir
                                </>
                              )}
                            </RitualButton>

                            <RitualButton variant="outline" onClick={toggleMute}>
                              {isMuted ? (
                                <VolumeX className="w-4 h-4" />
                              ) : (
                                <Volume2 className="w-4 h-4" />
                              )}
                            </RitualButton>

                            <RitualButton variant="outline" onClick={manualBeat}>
                              <Circle className="w-4 h-4" />
                            </RitualButton>
                          </div>

                          {/* Botón para finalizar sesión */}
                          <RitualButton variant="outline" onClick={endSession} className="w-full">
                            <StopCircle className="w-4 h-4 mr-2" />
                            Finalizar Sesión
                          </RitualButton>
                        </div>
                      )}

                      {/* Solo beat visual para fieles */}
                      {!isDeity && (
                        <div className="text-center">
                          <p className="font-body text-sm text-muted-foreground">
                            {isPlaying ? `Ritmo: ${rpm} RPM` : "En pausa"}
                          </p>
                        </div>
                      )}
                    </div>
                  </ParchmentCard>
                </motion.div>
              </div>
            </div>
          )}

          {/* Tabs para deidades */}
          {isDeity && activeSession && (
            <Tabs defaultValue="cards" className="space-y-4">
              <TabsList className="grid grid-cols-3 gap-1 bg-muted/30 p-1">
                <TabsTrigger value="cards">Tarjetas</TabsTrigger>
                <TabsTrigger value="patterns">Patrones</TabsTrigger>
                <TabsTrigger value="audios">Audios</TabsTrigger>
              </TabsList>

              {/* Tab: Tarjetas */}
              <TabsContent value="cards" className="space-y-4">
                <ParchmentCard title="Tarjetas" icon={<Plus className="w-4 h-4" />}>
                  <div className="space-y-3">
                    {!showCardForm ? (
                      <RitualButton
                        variant="outline"
                        onClick={() => setShowCardForm(true)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Tarjeta
                      </RitualButton>
                    ) : (
                      <form onSubmit={createCard} className="space-y-3">
                        <input
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                          placeholder="Título"
                          required
                          className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body focus:outline-none focus:border-gold/50"
                        />
                        <textarea
                          value={newCardDescription}
                          onChange={(e) => setNewCardDescription(e.target.value)}
                          placeholder="Descripción (opcional)"
                          rows={2}
                          className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                        />
                        <div className="flex gap-2">
                          <RitualButton type="submit" variant="gold" className="flex-1">
                            Guardar
                          </RitualButton>
                          <button
                            type="button"
                            onClick={() => setShowCardForm(false)}
                            className="px-4 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-start gap-2 p-3 bg-background/50 rounded-sm border border-border/30"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading text-sm text-foreground truncate mb-1">
                              {card.title}
                            </h4>
                            {card.description && (
                              <p className="text-xs text-muted-foreground">{card.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openCardConfig(card)}
                              className="p-1 text-gold hover:text-gold/80 transition-colors"
                              title="Enviar tarjeta"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteCard(card.id)}
                              className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ParchmentCard>
              </TabsContent>

              {/* Tab: Patrones */}
              <TabsContent value="patterns" className="space-y-4">
                <ParchmentCard title="Patrones de Beat" icon={<Radio className="w-4 h-4" />}>
                  <div className="space-y-3">
                    {!isRecording ? (
                      <RitualButton
                        variant="outline"
                        onClick={startRecording}
                        className="w-full"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Grabar Patrón
                      </RitualButton>
                    ) : (
                      <div className="space-y-3 p-4 bg-wine/10 rounded-sm border border-wine/30">
                        <p className="font-body text-sm text-muted-foreground text-center">
                          Grabando... Pulsa el beat siguiendo tu ritmo
                        </p>
                        
                        {/* Visualización ECG */}
                        <ECGVisualization />
                        
                        <RitualButton onClick={manualBeat} className="w-full">
                          <Circle className="w-4 h-4 mr-2" />
                          Beat
                        </RitualButton>
                        <p className="text-xs text-center text-muted-foreground">
                          {recordedIntervals.length} beats grabados
                        </p>
                        <div className="flex gap-2">
                          <RitualButton
                            variant="gold"
                            onClick={stopRecording}
                            className="flex-1"
                          >
                            <StopCircle className="w-4 h-4 mr-2" />
                            Detener
                          </RitualButton>
                        </div>
                      </div>
                    )}

                    {recordedIntervals.length >= 2 && !isRecording && (
                      <div className="space-y-2 p-3 bg-gold/10 rounded-sm border border-gold/30">
                        <input
                          value={newPatternName}
                          onChange={(e) => setNewPatternName(e.target.value)}
                          placeholder="Nombre del patrón"
                          className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body focus:outline-none focus:border-gold/50"
                        />
                        <RitualButton
                          variant="gold"
                          onClick={savePattern}
                          className="w-full"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Guardar Patrón
                        </RitualButton>
                      </div>
                    )}

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {patterns.map((pattern) => {
                        const intervals = pattern.pattern_data?.intervals || [];
                        return (
                          <div
                            key={pattern.id}
                            className="flex items-center justify-between p-3 bg-background/50 rounded-sm border border-border/30"
                          >
                            <div>
                              <h4 className="font-heading text-sm text-foreground">{pattern.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {intervals.length} beats
                              </p>
                            </div>
                            <button
                              onClick={() => deletePattern(pattern.id)}
                              className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </ParchmentCard>
              </TabsContent>

              {/* Tab: Audios */}
              <TabsContent value="audios" className="space-y-4">
                <ParchmentCard title="Mensajes de Audio" icon={<FileAudio className="w-4 h-4" />}>
                  <div className="space-y-3">
                    <p className="font-body text-sm text-muted-foreground text-center py-8">
                      Función de grabación de audio próximamente
                    </p>
                  </div>
                </ParchmentCard>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </BookPage>

      {/* Modal de configuración de tarjeta */}
      <Dialog open={showCardConfig} onOpenChange={setShowCardConfig}>
        <DialogContent className="bg-card border-2 border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">
              Configurar Tarjeta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-heading text-sm text-foreground mb-2">
                {selectedCard?.title}
              </h4>
              {selectedCard?.description && (
                <p className="font-body text-xs text-muted-foreground">
                  {selectedCard.description}
                </p>
              )}
            </div>

            {/* Duración */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configIsPermanent}
                  onChange={(e) => setConfigIsPermanent(e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
                <span className="font-body text-sm text-foreground">
                  Permanente (hasta retirarla)
                </span>
              </label>

              {!configIsPermanent && (
                <div className="space-y-1">
                  <label className="font-body text-xs text-muted-foreground block">
                    Duración (segundos)
                  </label>
                  <input
                    type="number"
                    value={configDuration}
                    onChange={(e) => setConfigDuration(parseInt(e.target.value) || 60)}
                    min="10"
                    step="10"
                    className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                             text-foreground font-body focus:outline-none focus:border-gold/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(configDuration / 60)}:{(configDuration % 60).toString().padStart(2, "0")} min
                  </p>
                </div>
              )}
            </div>

            {/* Visibilidad del temporizador */}
            {!configIsPermanent && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configShowTimer}
                  onChange={(e) => setConfigShowTimer(e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
                <span className="font-body text-sm text-foreground">
                  Mostrar temporizador al fiel
                </span>
              </label>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowCardConfig(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <RitualButton variant="gold" onClick={sendCardWithConfig}>
              <Play className="w-4 h-4 mr-2" />
              Enviar
            </RitualButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}