import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Star, Trash2, GripVertical, Loader2 } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Rank {
  id: string;
  name: string;
  level: number;
  cult_id: string;
  created_at: string;
}

export default function RangosPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [newRankName, setNewRankName] = useState("");
  const [newRankLevel, setNewRankLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadRanks();
  }, [profile?.cult_id]);

  const loadRanks = async () => {
    if (!profile?.cult_id) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("ranks")
      .select("*")
      .eq("cult_id", profile.cult_id)
      .order("level", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar los rangos: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setRanks(data || []);
      
      // Si no hay rangos, crear el rango base "Fiel" automáticamente
      // Verificar que no haya NINGÚN rango de nivel 0 para evitar duplicados
      if (!data || data.length === 0 || !data.some(r => r.level === 0)) {
        await createDefaultRank();
      }
    }
    setIsLoading(false);
  };

  const createDefaultRank = async () => {
    if (!profile?.cult_id) return;

    const { error } = await supabase.from("ranks").insert({
      name: "Fiel",
      level: 0,
      cult_id: profile.cult_id,
    });

    if (!error) {
      loadRanks();
    }
  };

  const addRank = async () => {
    if (!newRankName.trim() || !profile?.cult_id) return;

    setIsSaving(true);
    const { error } = await supabase.from("ranks").insert({
      name: newRankName,
      level: newRankLevel,
      cult_id: profile.cult_id,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear el rango: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Rango creado",
        description: `${newRankName} ha sido forjado.`,
      });
      setNewRankName("");
      setNewRankLevel(1);
      loadRanks();
    }
    setIsSaving(false);
  };

  const removeRank = async (id: string, name: string) => {
    if (ranks.length === 1) {
      toast({
        title: "No se puede borrar",
        description: "Debe haber al menos un rango en el culto.",
        variant: "destructive",
      });
      return;
    }

    // Verificar si hay usuarios asignados a este rango
    const { data: usersWithRank } = await supabase
      .from("profiles")
      .select("id")
      .eq("rank_id", id);

    if (usersWithRank && usersWithRank.length > 0) {
      // Buscar el rango base (nivel 0) para reasignar usuarios
      const baseRank = ranks.find(r => r.level === 0 && r.id !== id);
      
      if (baseRank) {
        // Reasignar usuarios al rango base
        const { error: reassignError } = await supabase
          .from("profiles")
          .update({ rank_id: baseRank.id })
          .eq("rank_id", id);

        if (reassignError) {
          toast({
            title: "Error",
            description: `No se pudieron reasignar los usuarios: ${reassignError.message}`,
            variant: "destructive",
          });
          return;
        }
      } else {
        // Quitar el rank_id de los usuarios (dejarlo en null)
        await supabase
          .from("profiles")
          .update({ rank_id: null })
          .eq("rank_id", id);
      }
    }

    // Ahora sí borrar el rango
    const { error } = await supabase.from("ranks").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Rango eliminado",
        description: `${name} ha sido disuelto.`,
      });
      loadRanks();
    }
  };

  const updateRankName = async (id: string, name: string) => {
    if (!name.trim()) return;

    const { error } = await supabase
      .from("ranks")
      .update({ name })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar: ${error.message}`,
        variant: "destructive",
      });
      loadRanks(); // Recargar para revertir el cambio visual
    }
  };

  const updateRankLevel = async (id: string, level: number) => {
    const { error } = await supabase
      .from("ranks")
      .update({ level })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar: ${error.message}`,
        variant: "destructive",
      });
      loadRanks();
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Rangos" icon={<Star className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const isBaseRank = (level: number) => level === 0;

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
                      <input
                        type="number"
                        value={rank.level}
                        onChange={(e) => updateRankLevel(rank.id, parseInt(e.target.value) || 0)}
                        className="w-12 text-center bg-transparent border-none font-display text-lg text-gold
                                   focus:outline-none focus:ring-0 p-0"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          value={rank.name}
                          onChange={(e) => {
                            setRanks(ranks.map(r => r.id === rank.id ? { ...r, name: e.target.value } : r));
                          }}
                          onBlur={(e) => updateRankName(rank.id, e.target.value)}
                          className="bg-transparent border-none font-heading text-foreground text-lg
                                     focus:outline-none focus:ring-0 p-0 flex-1"
                        />
                        {isBaseRank(rank.level) && (
                          <span className="px-2 py-0.5 bg-wine/20 text-wine text-xs font-heading rounded-sm">
                            Base
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeRank(rank.id, rank.name)}
                      className="p-2 text-muted-foreground/40 hover:text-wine transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                <RitualButton 
                  variant="gold" 
                  onClick={addRank} 
                  className="w-full md:w-auto"
                  disabled={isSaving || !newRankName.trim()}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
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