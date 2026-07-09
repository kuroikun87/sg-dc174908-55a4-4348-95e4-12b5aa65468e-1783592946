import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, Volume2, VolumeX, Zap, Heart, Settings, 
  Plus, Trash2, Clock, Send, Mic, ChevronRight 
} from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";

// ============== BEAT ENGINE ==============
interface BeatPattern {
  id: string;
  name: string;
  beats: number[];
  intervals: number[];
}

const defaultPatterns: BeatPattern[] = [
  { id: "steady", name: "Ritmo Constante", beats: [1], intervals: [500] },
  { id: "double", name: "Doble Latido", beats: [1, 1], intervals: [300, 600] },
  { id: "waltz", name: "Vals Oscuro", beats: [1, 1, 1], intervals: [400, 400, 800] },
];

function useBeatEngine() {
  const [rpm, setRpm] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [tapMode, setTapMode] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<BeatPattern>(defaultPatterns[0]);
  const [circlePhase, setCirclePhase] = useState(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const patternIndexRef = useRef(0);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
  };

  const playBeat = useCallback(() => {
    if (!audioCtxRef.current || isMuted) return;
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }, [isMuted]);

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    initAudio();
    const intervalMs = (60 / rpm) * 1000;

    intervalRef.current = setInterval(() => {
      playBeat();
      setCirclePhase(p => (p + 1) % 2);
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, rpm, playBeat]);

  const tapBeat = () => {
    initAudio();
    playBeat();
    setCirclePhase(p => (p + 1) % 2);
  };

  return {
    rpm, setRpm,
    isPlaying, setIsPlaying,
    isMuted, setIsMuted,
    tapMode, setTapMode,
    currentPattern, setCurrentPattern,
    circlePhase,
    tapBeat,
  };
}

// ============== COMPONENTS ==============
export default function SesionPage() {
  const {
    rpm, setRpm,
    isPlaying, setIsPlaying,
    isMuted, setIsMuted,
    tapMode, setTapMode,
    circlePhase,
    tapBeat,
  } = useBeatEngine();

  const [activeTab, setActiveTab] = useState<"beats" | "cards" | "patterns">("beats");
  const [cards, setCards] = useState([
    { id: "1", title: "Arrodíllate", description: "Postrate ante tu deidad", type: "position", duration: null as number | null },
    { id: "2", title: "Silencio", description: "No hables hasta nueva orden", type: "action", duration: 300 },
    { id: "3", title: "Presentate", description: "Muéstrate completamente", type: "action", duration: null },
  ]);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [showTimeOnFollower, setShowTimeOnFollower] = useState(false);
  const [patterns, setPatterns] = useState(defaultPatterns);
  const [newPatternName, setNewPatternName] = useState("");

  const sendCard = (cardId: string) => {
    setActiveCard(cardId);
  };

  const removeCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
    if (activeCard === id) setActiveCard(null);
  };

  return (
    <AppLayout title="Sesión Ritual" icon={<Zap className="w-5 h-5" />}>
      <BookPage pageKey="sesion">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">El Ritual de Dominación</h1>
            <p className="font-body text-muted-foreground">Controla cada latido de la sesión</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 border-b border-border/40 pb-4">
            {[
              { key: "beats" as const, label: "Beats", icon: <Heart className="w-4 h-4" /> },
              { key: "cards" as const, label: "Tarjetas", icon: <ChevronRight className="w-4 h-4" /> },
              { key: "patterns" as const, label: "Patrones", icon: <Settings className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm font-heading text-sm transition-all
                  ${activeTab === tab.key 
                    ? "bg-gold/20 text-gold border border-gold/40" 
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* BEATS PANEL */}
          {activeTab === "beats" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Visualizador circular */}
              <div className="flex justify-center">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 rounded-full border-2 border-border/40" />
                  <motion.div
                    animate={{
                      scale: circlePhase === 0 ? [1, 1.15, 1] : 1,
                      opacity: circlePhase === 0 ? [0.6, 1, 0.6] : 0.6,
                    }}
                    transition={{ duration: 60 / rpm }}
                    className="absolute inset-4 rounded-full bg-gradient-to-b from-wine/30 to-wine/5 border border-wine/30"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="font-display text-4xl text-foreground">{rpm}</span>
                      <p className="font-heading text-xs text-muted-foreground">RPM</p>
                    </div>
                  </div>
                  {/* Indicador de posición */}
                  <motion.div
                    animate={{ rotate: circlePhase === 0 ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-gold rounded-full"
                  />
                </div>
              </div>

              {/* Controles */}
              <ParchmentCard title="Control del Ritmo" icon={<Settings className="w-4 h-4" />}>
                <div className="space-y-4">
                  {/* Slider RPM */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-heading text-xs text-muted-foreground">Velocidad</span>
                      <span className="font-display text-gold">{rpm} RPM</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      value={rpm}
                      onChange={(e) => setRpm(parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-gold"
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground/50 font-body">
                      <span>Lento</span>
                      <span>Rápido</span>
                    </div>
                  </div>

                  {/* Botones de control */}
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`p-4 rounded-full border-2 transition-all ${
                        isPlaying 
                          ? "bg-wine/20 border-wine text-wine" 
                          : "bg-gold/20 border-gold text-gold"
                      }`}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-4 rounded-full border-2 transition-all ${
                        isMuted 
                          ? "border-muted-foreground/30 text-muted-foreground" 
                          : "border-foreground/30 text-foreground"
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>

                    <button
                      onClick={() => setTapMode(!tapMode)}
                      className={`p-4 rounded-full border-2 transition-all ${
                        tapMode 
                          ? "bg-gold/20 border-gold text-gold" 
                          : "border-border/40 text-muted-foreground"
                      }`}
                    >
                      <Zap className="w-6 h-6" />
                    </button>
                  </div>

                  {tapMode && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onMouseDown={tapBeat}
                      onTouchStart={tapBeat}
                      className="w-full py-8 bg-wine/10 border-2 border-wine/30 rounded-sm
                                 active:bg-wine/30 active:scale-95 transition-all"
                    >
                      <span className="font-display text-xl text-wine">TOCA PARA EL BEAT</span>
                    </motion.button>
                  )}
                </div>
              </ParchmentCard>
            </motion.div>
          )}

          {/* CARDS PANEL */}
          {activeTab === "cards" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Tarjeta activa */}
              <AnimatePresence>
                {activeCard && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <ParchmentCard 
                      title="Orden Activa" 
                      icon={<Heart className="w-4 h-4 text-wine" />}
                      className="border-wine/40 bg-wine/5"
                    >
                      {(() => {
                        const card = cards.find(c => c.id === activeCard);
                        return card ? (
                          <div className="text-center space-y-3">
                            <h3 className="font-display text-2xl text-foreground">{card.title}</h3>
                            <p className="font-body text-muted-foreground">{card.description}</p>
                            {card.duration && (
                              <div className="flex items-center justify-center gap-2 text-gold">
                                <Clock className="w-4 h-4" />
                                <span className="font-heading text-sm">
                                  {showTimeOnFollower ? `${card.duration}s` : "Tiempo oculto"}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-center gap-2 pt-2">
                              <label className="flex items-center gap-2 text-sm font-body text-muted-foreground cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={showTimeOnFollower}
                                  onChange={(e) => setShowTimeOnFollower(e.target.checked)}
                                  className="accent-gold"
                                />
                                Mostrar tiempo al fiel
                              </label>
                            </div>
                            <RitualButton variant="wine" onClick={() => setActiveCard(null)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Retirar Orden
                            </RitualButton>
                          </div>
                        ) : null;
                      })()}
                    </ParchmentCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lista de tarjetas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => sendCard(card.id)}
                      className={`w-full text-left p-4 rounded-sm border transition-all ${
                        activeCard === card.id
                          ? "bg-wine/10 border-wine/50"
                          : "bg-card/40 border-border/40 hover:border-gold/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-heading text-sm text-foreground">{card.title}</h4>
                          <p className="font-body text-xs text-muted-foreground mt-1">{card.description}</p>
                        </div>
                        <Send className={`w-4 h-4 ${activeCard === card.id ? "text-wine" : "text-muted-foreground/40"}`} />
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Audio messages */}
              <ParchmentCard title="Mensajes de Voz" icon={<Mic className="w-4 h-4" />}>
                <div className="text-center space-y-3 py-4">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-border/50 
                                  flex items-center justify-center mx-auto">
                    <Mic className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <p className="font-body text-sm text-muted-foreground">
                    Graba mensajes de audio de hasta 30 segundos<br />
                    para enviar durante la sesión
                  </p>
                  <RitualButton variant="outline" className="text-sm">
                    <Mic className="w-4 h-4 mr-2" />
                    Grabar Mensaje
                  </RitualButton>
                </div>
              </ParchmentCard>
            </motion.div>
          )}

          {/* PATTERNS PANEL */}
          {activeTab === "patterns" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                {patterns.map((pattern) => (
                  <ParchmentCard key={pattern.id} title={pattern.name}>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {pattern.beats.map((_, i) => (
                          <div key={i} className="w-3 h-3 rounded-full bg-gold/60" />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {/* set pattern */}}
                          className="px-3 py-1 text-xs font-heading text-gold border border-gold/40 rounded-sm
                                     hover:bg-gold/10 transition-colors"
                        >
                          Usar
                        </button>
                        <button
                          onClick={() => setPatterns(patterns.filter(p => p.id !== pattern.id))}
                          className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </ParchmentCard>
                ))}
              </div>

              <ParchmentCard title="Crear Patrón" icon={<Plus className="w-4 h-4" />}>
                <div className="space-y-4">
                  <input
                    value={newPatternName}
                    onChange={(e) => setNewPatternName(e.target.value)}
                    placeholder="Nombre del patrón..."
                    className="w-full bg-background/50 border border-border rounded-sm px-4 py-2
                               text-foreground font-body focus:outline-none focus:border-gold/50"
                  />
                  <p className="font-body text-sm text-muted-foreground">
                    Los patrones te permiten crear secuencias de beats personalizadas:<br />
                    Ej: 3 beats rápidos, pausa, 2 beats lentos, repetir...
                  </p>
                  <RitualButton variant="gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Guardar Patrón
                  </RitualButton>
                </div>
              </ParchmentCard>
            </motion.div>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}