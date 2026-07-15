import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, Trash2, Loader2, Star } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Fetish {
  id: string;
  name: string;
  description: string | null;
  cult_id: string;
  created_at: string;
}

interface FetishRating {
  id: string;
  fetish_id: string;
  user_id: string;
  rating: "love" | "like" | "neutral" | "soft_limit" | "hard_limit";
  is_starred: boolean;
  created_at: string;
  fetishes: Fetish;
}

const ratingOptions = [
  { key: "love", label: "Me encanta", color: "bg-wine/20 text-wine border-wine" },
  { key: "like", label: "Me gusta", color: "bg-gold/20 text-gold border-gold" },
  { key: "neutral", label: "Me da igual", color: "bg-muted/20 text-muted-foreground border-muted" },
  { key: "soft_limit", label: "Límite blando", color: "bg-orange-900/20 text-orange-400 border-orange-900" },
  { key: "hard_limit", label: "Límite duro", color: "bg-red-900/30 text-red-400 border-red-900" },
] as const;

export default function FetichesPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [fetishes, setFetishes] = useState<Fetish[]>([]);
  const [myRatings, setMyRatings] = useState<FetishRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFetishName, setNewFetishName] = useState("");
  const [newFetishDescription, setNewFetishDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadFetishes();
    loadMyRatings();
  }, [profile?.cult_id, user]);

  const loadFetishes = async () => {
    if (!profile?.cult_id) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("fetishes")
      .select("*")
      .eq("cult_id", profile.cult_id)
      .order("name", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar los fetiches: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setFetishes(data || []);
    }
    setIsLoading(false);
  };

  const loadMyRatings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("fetish_ratings")
      .select("*, fetishes(*)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading ratings:", error.message);
    } else {
      setMyRatings(data || []);
    }
  };

  const addFetish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFetishName.trim() || !profile?.cult_id) return;

    const { error } = await supabase.from("fetishes").insert({
      name: newFetishName,
      description: newFetishDescription || null,
      cult_id: profile.cult_id,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Fetiche creado",
        description: `${newFetishName} ha sido agregado.`,
      });
      setNewFetishName("");
      setNewFetishDescription("");
      setShowForm(false);
      loadFetishes();
    }
  };

  const deleteFetish = async (id: string) => {
    const { error } = await supabase.from("fetishes").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Fetiche eliminado",
        description: "El fetiche ha sido borrado.",
      });
      loadFetishes();
      loadMyRatings();
    }
  };

  const updateRating = async (fetishId: string, rating: FetishRating["rating"]) => {
    if (!user) return;

    const existingRating = myRatings.find(r => r.fetish_id === fetishId);

    if (existingRating) {
      const { error } = await supabase
        .from("fetish_ratings")
        .update({ rating })
        .eq("id", existingRating.id);

      if (error) {
        toast({
          title: "Error",
          description: `No se pudo actualizar: ${error.message}`,
          variant: "destructive",
        });
      } else {
        loadMyRatings();
      }
    } else {
      const { error } = await supabase.from("fetish_ratings").insert({
        fetish_id: fetishId,
        user_id: user.id,
        rating,
        is_starred: false,
      });

      if (error) {
        toast({
          title: "Error",
          description: `No se pudo guardar: ${error.message}`,
          variant: "destructive",
        });
      } else {
        loadMyRatings();
      }
    }
  };

  const toggleStar = async (fetishId: string) => {
    if (!user) return;

    const existingRating = myRatings.find(r => r.fetish_id === fetishId);

    if (existingRating) {
      const { error } = await supabase
        .from("fetish_ratings")
        .update({ is_starred: !existingRating.is_starred })
        .eq("id", existingRating.id);

      if (error) {
        toast({
          title: "Error",
          description: `No se pudo actualizar: ${error.message}`,
          variant: "destructive",
        });
      } else {
        loadMyRatings();
      }
    } else {
      // Crear rating neutral con estrella
      const { error } = await supabase.from("fetish_ratings").insert({
        fetish_id: fetishId,
        user_id: user.id,
        rating: "neutral",
        is_starred: true,
      });

      if (error) {
        toast({
          title: "Error",
          description: `No se pudo guardar: ${error.message}`,
          variant: "destructive",
        });
      } else {
        loadMyRatings();
      }
    }
  };

  const getRating = (fetishId: string) => {
    return myRatings.find(r => r.fetish_id === fetishId);
  };

  if (isLoading) {
    return (
      <AppLayout title="Fetiches" icon={<Heart className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const canEdit = profile?.role === "deity";

  return (
    <AppLayout title="Fetiches" icon={<Heart className="w-5 h-5" />}>
      <BookPage pageKey="fetiches">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Prácticas y Límites</h1>
            <p className="font-body text-muted-foreground">
              Define tus preferencias y límites
            </p>
          </div>

          {/* Lista de fetiches */}
          {fetishes.length > 0 && (
            <div className="space-y-3">
              {fetishes.map((fetish, i) => {
                const userRating = getRating(fetish.id);
                const currentRating = userRating?.rating;
                const isStarred = userRating?.is_starred || false;

                return (
                  <motion.div
                    key={fetish.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ParchmentCard>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-heading text-sm text-foreground">{fetish.name}</h3>
                              <button
                                onClick={() => toggleStar(fetish.id)}
                                className={`transition-colors ${
                                  isStarred ? "text-gold" : "text-muted-foreground/30"
                                }`}
                              >
                                <Star className={`w-4 h-4 ${isStarred ? "fill-gold" : ""}`} />
                              </button>
                            </div>
                            {fetish.description && (
                              <p className="font-body text-xs text-muted-foreground mt-1">
                                {fetish.description}
                              </p>
                            )}
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => deleteFetish(fetish.id)}
                              className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Rating buttons */}
                        <div className="flex flex-wrap gap-2">
                          {ratingOptions.map((option) => (
                            <button
                              key={option.key}
                              onClick={() => updateRating(fetish.id, option.key)}
                              className={`px-3 py-1.5 rounded-sm border text-xs font-heading transition-all ${
                                currentRating === option.key
                                  ? option.color
                                  : "bg-background/50 border-border/40 text-muted-foreground hover:border-gold/30"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </ParchmentCard>
                  </motion.div>
                );
              })}
            </div>
          )}

          {fetishes.length === 0 && (
            <p className="font-body text-muted-foreground text-center py-10">
              No hay prácticas definidas todavía.
            </p>
          )}

          {/* Formulario (solo deidades) */}
          {canEdit && (
            <ParchmentCard title="Nueva Práctica" icon={<Plus className="w-4 h-4" />}>
              {!showForm ? (
                <RitualButton
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Práctica
                </RitualButton>
              ) : (
                <form onSubmit={addFetish} className="space-y-4">
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Nombre
                    </label>
                    <input
                      value={newFetishName}
                      onChange={(e) => setNewFetishName(e.target.value)}
                      required
                      placeholder="Ej: Bondage"
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={newFetishDescription}
                      onChange={(e) => setNewFetishDescription(e.target.value)}
                      placeholder="Detalles adicionales..."
                      rows={2}
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <RitualButton type="submit" variant="gold" className="flex-1">
                      Guardar
                    </RitualButton>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </ParchmentCard>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}