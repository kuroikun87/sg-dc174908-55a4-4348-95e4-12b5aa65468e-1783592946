import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import {
  AlertTriangle,
  Plus,
  X,
  Loader2,
  Tag,
  Skull,
  ShieldAlert,
} from "lucide-react";

interface Consequence {
  id: string;
  name: string;
  description: string | null;
  faith_points_cost: number;
  tags: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
}

interface AssignedConsequence {
  id: string;
  consequence_id: string;
  follower_id: string;
  assigned_by: string;
  assigned_at: string;
  notes: string | null;
  is_removed: boolean;
  removed_at: string | null;
  consequences: Consequence;
}

export default function ConsecuenciasPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [consequences, setConsequences] = useState<Consequence[]>([]);
  const [myConsequences, setMyConsequences] = useState<AssignedConsequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCost, setNewCost] = useState(0);
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    if (profile?.role === "deity") {
      await loadConsequences();
    } else {
      await loadMyConsequences();
    }

    setIsLoading(false);
  };

  const loadConsequences = async () => {
    if (!profile?.cult_id) return;

    const { data, error } = await supabase
      .from("consequences")
      .select("*")
      .eq("cult_id", profile.cult_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar las consecuencias: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setConsequences(data || []);
    }
  };

  const loadMyConsequences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("assigned_consequences")
      .select("*, consequences(*)")
      .eq("follower_id", user.id)
      .eq("is_removed", false)
      .order("assigned_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar tus consecuencias: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setMyConsequences(data || []);
    }
  };

  const createConsequence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !user || !profile?.cult_id) return;

    setIsSaving(true);

    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { error } = await supabase.from("consequences").insert({
      cult_id: profile.cult_id,
      created_by: user.id,
      name: newName,
      description: newDescription || null,
      faith_points_cost: newCost,
      tags: tags,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear la consecuencia: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Consecuencia creada",
        description: `${newName} ha sido inscrita.`,
      });
      setNewName("");
      setNewDescription("");
      setNewCost(0);
      setNewTags("");
      setShowCreateForm(false);
      loadConsequences();
    }

    setIsSaving(false);
  };

  const removeConsequence = async (ac: AssignedConsequence) => {
    if (!user || !profile) return;

    if ((profile.faith_points || 0) < ac.consequences.faith_points_cost) {
      toast({
        title: "Puntos insuficientes",
        description: `Necesitas ${ac.consequences.faith_points_cost} PF para eliminar esta consecuencia.`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Llamar función RPC que:
      // 1. Resta los PF del usuario
      // 2. Registra el log
      // 3. Marca la consecuencia como eliminada
      const { data, error } = await supabase.rpc("remove_consequence", {
        p_assigned_consequence_id: ac.id,
        p_follower_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Consecuencia eliminada",
        description: `Has eliminado: ${ac.consequences.name}`,
      });

      loadMyConsequences();
      // Recargar perfil para actualizar PF
      window.location.reload();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${msg}`,
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  const deleteConsequence = async (id: string) => {
    const { error } = await supabase.from("consequences").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Consecuencia eliminada",
        description: "La consecuencia ha sido borrada.",
      });
      loadConsequences();
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Consecuencias" icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Vista para Deidades
  if (profile?.role === "deity") {
    return (
      <AppLayout title="Consecuencias" icon={<AlertTriangle className="w-5 h-5" />}>
        <BookPage pageKey="consecuencias">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl text-foreground">Consecuencias del Culto</h1>
              <p className="font-body text-muted-foreground">
                Castigos que los fieles pueden eliminar pagando Puntos de Fe
              </p>
            </div>

            {/* Consecuencias existentes */}
            <ParchmentCard title="Consecuencias Disponibles" icon={<Skull className="w-4 h-4" />}>
              <div className="space-y-3">
                {consequences.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground text-center py-4">
                    No hay consecuencias creadas
                  </p>
                ) : (
                  consequences.map((consequence, i) => (
                    <motion.div
                      key={consequence.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-background/50 rounded-sm border border-wine/30"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-wine" />
                          <h3 className="font-heading text-base text-foreground">
                            {consequence.name}
                          </h3>
                        </div>
                        {consequence.description && (
                          <p className="font-body text-sm text-muted-foreground">
                            {consequence.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="px-2 py-1 bg-wine/20 text-wine font-heading rounded-sm">
                            {consequence.faith_points_cost} PF para eliminar
                          </span>
                          {consequence.tags.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {consequence.tags.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteConsequence(consequence.id)}
                        className="p-2 text-muted-foreground/30 hover:text-wine transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </ParchmentCard>

            {/* Crear consecuencia */}
            <ParchmentCard title="Crear Consecuencia" icon={<Plus className="w-4 h-4" />}>
              {!showCreateForm ? (
                <RitualButton
                  variant="outline"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Consecuencia
                </RitualButton>
              ) : (
                <form onSubmit={createConsequence} className="space-y-4">
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Nombre de la consecuencia
                    </label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      placeholder="Ej: Restricción de comunicación"
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Detalles de la consecuencia..."
                      rows={2}
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Costo en PF para eliminar
                    </label>
                    <input
                      type="number"
                      value={newCost}
                      onChange={(e) => setNewCost(parseInt(e.target.value) || 0)}
                      min={0}
                      required
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Etiquetas (separadas por comas)
                    </label>
                    <input
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="Ej: Disciplina, Comportamiento"
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <RitualButton type="submit" variant="gold" className="flex-1" disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
                    </RitualButton>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </ParchmentCard>
          </div>
        </BookPage>
      </AppLayout>
    );
  }

  // Vista para Fieles
  return (
    <AppLayout title="Consecuencias" icon={<AlertTriangle className="w-5 h-5" />}>
      <BookPage pageKey="consecuencias">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Mis Consecuencias</h1>
            <p className="font-body text-muted-foreground">
              Castigos activos que puedes eliminar
            </p>
          </div>

          {/* Balance de PF */}
          <div className="text-center p-6 bg-gradient-to-b from-gold/10 to-transparent rounded-sm border border-gold/30">
            <p className="font-heading text-xs text-gold uppercase tracking-wider mb-2">
              Puntos de Fe Disponibles
            </p>
            <p className="font-display text-4xl text-gold">{profile?.faith_points || 0}</p>
          </div>

          {/* Consecuencias activas */}
          <ParchmentCard title="Consecuencias Activas" icon={<ShieldAlert className="w-4 h-4" />}>
            <div className="space-y-3">
              {myConsequences.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center py-4">
                  No tienes consecuencias activas
                </p>
              ) : (
                myConsequences.map((ac, i) => {
                  const canAfford = (profile?.faith_points || 0) >= ac.consequences.faith_points_cost;

                  return (
                    <motion.div
                      key={ac.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-background/50 rounded-sm border border-wine/30"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-wine" />
                          <h3 className="font-heading text-base text-foreground">
                            {ac.consequences.name}
                          </h3>
                        </div>
                        {ac.consequences.description && (
                          <p className="font-body text-sm text-muted-foreground">
                            {ac.consequences.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-wine/20 text-wine font-heading rounded-sm text-xs">
                            {ac.consequences.faith_points_cost} PF
                          </span>
                          {!canAfford && (
                            <span className="text-xs text-muted-foreground">
                              Puntos insuficientes
                            </span>
                          )}
                        </div>
                        <p className="font-body text-xs text-muted-foreground/70">
                          Asignada el {new Date(ac.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <RitualButton
                        variant={canAfford ? "wine" : "outline"}
                        onClick={() => removeConsequence(ac)}
                        disabled={!canAfford || isSaving}
                        className="flex-shrink-0"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Eliminar"
                        )}
                      </RitualButton>
                    </motion.div>
                  );
                })
              )}
            </div>
          </ParchmentCard>
        </div>
      </BookPage>
    </AppLayout>
  );
}