import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Star, Trash2, GripVertical } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";

interface Rank {
  id: string;
  name: string;
  level: number;
  isDefault: boolean;
}

const initialRanks: Rank[] = [
  { id: "1", name: "Fiel", level: 0, isDefault: true },
  { id: "2", name: "Iniciado", level: 1, isDefault: false },
  { id: "3", name: "Guardián", level: 2, isDefault: false },
  { id: "4", name: "Sacerdote", level: 3, isDefault: false },
  { id: "5", name: "Alto Sacerdote", level: 4, isDefault: false },
];

export default function RangosPage() {
  const [ranks, setRanks] = useState<Rank[]>(initialRanks);
  const [newRankName, setNewRankName] = useState("");
  const [newRankLevel, setNewRankLevel] = useState(1);

  const addRank = () => {
    if (!newRankName.trim()) return;
    const newRank: Rank = {
      id: Date.now().toString(),
      name: newRankName,
      level: newRankLevel,
      isDefault: false,
    };
    setRanks([...ranks, newRank].sort((a, b) => a.level - b.level));
    setNewRankName("");
    setNewRankLevel(1);
  };

  const removeRank = (id: string) => {
    setRanks(ranks.filter((r) => r.id !== id));
  };

  const updateRankName = (id: string, name: string) => {
    setRanks(ranks.map((r) => (r.id === id ? { ...r, name } : r)));
  };

  return (
    <AppLayout title="Rangos" icon={<Star className="w-5 h-5" />}>
      <BookPage pageKey="rangos">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Los Estratos del Poder</h1>
            <p className="font-body text-muted-foreground">
              Define los rangos de tu culto. Igual nivel, igual autoridad.
            </p>
          </div>

          {/* Lista de rangos */}
          <div className="space-y-3">
            {ranks.map((rank, index) => (
              <motion.div
                key={rank.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ParchmentCard>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground/40">
                      <GripVertical className="w-4 h-4" />
                      <span className="font-display text-lg text-gold w-8 text-center">
                        {rank.level}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      {rank.isDefault ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={rank.name}
                            onChange={(e) => updateRankName(rank.id, e.target.value)}
                            className="bg-transparent border-none font-heading text-foreground text-lg
                                       focus:outline-none focus:ring-0 p-0"
                          />
                          <span className="px-2 py-0.5 bg-wine/20 text-wine text-xs font-heading rounded-sm">
                            Base
                          </span>
                        </div>
                      ) : (
                        <input
                          value={rank.name}
                          onChange={(e) => updateRankName(rank.id, e.target.value)}
                          className="bg-transparent border-none font-heading text-foreground text-lg
                                     focus:outline-none focus:ring-0 p-0 w-full"
                        />
                      )}
                    </div>

                    {!rank.isDefault && (
                      <button
                        onClick={() => removeRank(rank.id)}
                        className="p-2 text-muted-foreground/40 hover:text-wine transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </ParchmentCard>
              </motion.div>
            ))}
          </div>

          {/* Agregar nuevo rango */}
          <ParchmentCard title="Forjar Nuevo Rango" icon={<Plus className="w-4 h-4" />}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Nombre del Rango
                </label>
                <input
                  value={newRankName}
                  onChange={(e) => setNewRankName(e.target.value)}
                  placeholder="Ej: Guardián del Umbral"
                  className="w-full bg-background/50 border border-border rounded-sm px-4 py-2
                             text-foreground font-body focus:outline-none focus:border-gold/50"
                />
              </div>
              <div className="w-full md:w-32">
                <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Nivel
                </label>
                <input
                  type="number"
                  value={newRankLevel}
                  onChange={(e) => setNewRankLevel(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full bg-background/50 border border-border rounded-sm px-4 py-2
                             text-foreground font-body focus:outline-none focus:border-gold/50"
                />
              </div>
              <div className="flex items-end">
                <RitualButton variant="gold" onClick={addRank} className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Forjar
                </RitualButton>
              </div>
            </div>
          </ParchmentCard>
        </div>
      </BookPage>
    </AppLayout>
  );
}