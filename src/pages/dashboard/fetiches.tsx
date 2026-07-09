import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, MinusCircle, Meh, XCircle, Plus } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";

interface Fetish {
  id: string;
  name: string;
  description: string;
  category: string;
  reaction: "love" | "like" | "neutral" | "soft_limit" | "hard_limit" | null;
  isCurious: boolean;
}

const reactions = [
  { key: "love" as const, label: "Me encanta", icon: <Heart className="w-4 h-4" />, color: "text-wine" },
  { key: "like" as const, label: "Me gusta", icon: <Heart className="w-4 h-4" />, color: "text-gold" },
  { key: "neutral" as const, label: "Me da igual", icon: <MinusCircle className="w-4 h-4" />, color: "text-muted-foreground" },
  { key: "soft_limit" as const, label: "Límite blando", icon: <Meh className="w-4 h-4" />, color: "text-amber-400" },
  { key: "hard_limit" as const, label: "Límite duro", icon: <XCircle className="w-4 h-4" />, color: "text-red-500" },
];

const mockFetishes: Fetish[] = [
  { id: "1", name: "Restricción", description: "Uso de cuerdas, vendas y restricciones físicas", category: "Bondage", reaction: null, isCurious: false },
  { id: "2", name: "Impacto ligero", description: "Nalgadas, azotes suaves con la mano", category: "Impacto", reaction: null, isCurious: false },
  { id: "3", name: "Juegos de temperatura", description: "Cera, hielo, objetos fríos o calientes", category: "Sensorial", reaction: null, isCurious: false },
  { id: "4", name: "Negación sensorial", description: "Vendas en ojos, tapones, privación de sentidos", category: "Sensorial", reaction: null, isCurious: false },
  { id: "5", name: "Roleplay", description: "Escenarios de roles y personajes", category: "Mental", reaction: null, isCurious: false },
];

export default function FetichesPage() {
  const [fetishes, setFetishes] = useState<Fetish[]>(mockFetishes);
  const [selectedFetish, setSelectedFetish] = useState<string | null>(null);
  const [isDeity] = useState(true);

  const setReaction = (id: string, reaction: Fetish["reaction"]) => {
    setFetishes(fetishes.map(f => f.id === id ? { ...f, reaction } : f));
  };

  const toggleCurious = (id: string) => {
    setFetishes(fetishes.map(f => f.id === id ? { ...f, isCurious: !f.isCurious } : f));
  };

  return (
    <AppLayout title="Fetiches y Prácticas" icon={<Heart className="w-5 h-5" />}>
      <BookPage pageKey="fetiches">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Fetiches y Prácticas</h1>
            <p className="font-body text-muted-foreground">
              Marca tus preferencias, límites y curiosidades
            </p>
          </div>

          {isDeity && (
            <RitualButton variant="gold" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Práctica
            </RitualButton>
          )}

          <div className="space-y-3">
            {fetishes.map((fetish) => (
              <motion.div
                key={fetish.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedFetish(fetish.id === selectedFetish ? null : fetish.id)}
              >
                <div className={`p-4 rounded-sm border transition-all cursor-pointer ${
                  selectedFetish === fetish.id
                    ? "bg-wine/5 border-wine/40"
                    : "bg-card/40 border-border/40 hover:border-gold/30"
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-sm text-foreground">{fetish.name}</h3>
                        {fetish.isCurious && (
                          <Star className="w-3 h-3 text-gold fill-gold" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-body">{fetish.category}</span>
                    </div>
                    {fetish.reaction && (
                      <span className={reactions.find(r => r.key === fetish.reaction)?.color}>
                        {reactions.find(r => r.key === fetish.reaction)?.icon}
                      </span>
                    )}
                  </div>

                  <AnimatePresence>
                    {selectedFetish === fetish.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="font-body text-sm text-muted-foreground mt-3 mb-4">
                          {fetish.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {reactions.map((reaction) => (
                            <button
                              key={reaction.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                setReaction(fetish.id, reaction.key);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-heading transition-all ${
                                fetish.reaction === reaction.key
                                  ? "bg-wine/10 border-wine/50 text-foreground"
                                  : "bg-background/50 border-border/40 text-muted-foreground hover:border-gold/30"
                              }`}
                            >
                              {reaction.icon}
                              {reaction.label}
                            </button>
                          ))}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCurious(fetish.id);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-heading transition-all ${
                              fetish.isCurious
                                ? "bg-gold/10 border-gold/50 text-gold"
                                : "bg-background/50 border-border/40 text-muted-foreground hover:border-gold/30"
                            }`}
                          >
                            <Star className={`w-3 h-3 ${fetish.isCurious ? "fill-gold" : ""}`} />
                            Curioso
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </BookPage>
    </AppLayout>
  );
}