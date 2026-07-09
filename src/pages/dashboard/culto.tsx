import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Edit, Image, Save, Scroll, Shield, Loader2 } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface CultData {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  main_deity_id: string;
  created_at: string;
}

export default function CultoPage() {
  const { profile } = useAuth();
  const [cult, setCult] = useState<CultData | null>(null);
  const [mainDeityName, setMainDeityName] = useState<string>("");
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  useEffect(() => {
    const fetchCult = async () => {
      if (!profile?.cult_id) return;
      
      const { data: cultData, error: cultError } = await supabase
        .from("cults")
        .select("*")
        .eq("id", profile.cult_id)
        .single();
      
      if (cultError) {
        console.error("Error fetching cult:", cultError);
        setIsLoading(false);
        return;
      }
      
      setCult(cultData);
      setEditForm({ name: cultData.name, description: cultData.description || "" });
      
      // Fetch main deity name
      if (cultData.main_deity_id) {
        const { data: deityData } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", cultData.main_deity_id)
          .single();
        if (deityData) setMainDeityName(deityData.display_name || "Deidad Principal");
      }
      
      // Count members
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("cult_id", profile.cult_id);
      
      setMemberCount(count || 0);
      setIsLoading(false);
    };
    
    fetchCult();
  }, [profile?.cult_id]);

  const handleSave = async () => {
    if (!cult) return;
    
    const { error } = await supabase
      .from("cults")
      .update({
        name: editForm.name,
        description: editForm.description,
      })
      .eq("id", cult.id);
    
    if (error) {
      console.error("Error updating cult:", error);
      return;
    }
    
    setCult({ ...cult, name: editForm.name, description: editForm.description });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <AppLayout title="El Culto" icon={<Crown className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!cult) {
    return (
      <AppLayout title="El Culto" icon={<Crown className="w-5 h-5" />}>
        <div className="text-center py-20">
          <p className="font-body text-muted-foreground">No se encontró información del culto.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="El Culto" icon={<Crown className="w-5 h-5" />}>
      <BookPage pageKey="culto">
        <div className="space-y-8">
          {/* Header con imagen del culto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="aspect-[21/9] md:aspect-[3/1] bg-muted/30 border border-border/50 rounded-sm overflow-hidden relative">
              {cult.image_url ? (
                <img src={cult.image_url} alt={cult.name} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Shield className="w-16 h-16 text-gold/20 mx-auto" />
                    <p className="font-heading text-muted-foreground/50 text-sm tracking-widest uppercase">
                      Sello del Culto
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="font-display text-3xl md:text-4xl text-foreground mb-1">
                  {cult.name}
                </h1>
                <p className="font-body text-sm text-muted-foreground flex items-center gap-2">
                  <Crown className="w-3 h-3 text-gold" />
                  Dirigido por {mainDeityName}
                </p>
              </div>
            </div>

            {profile?.is_main_deity && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-sm
                           text-muted-foreground hover:text-gold transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </motion.div>

          {/* Información del culto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ParchmentCard title="Presentación" icon={<Scroll className="w-4 h-4" />}>
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-sm p-3 text-foreground font-body
                             focus:outline-none focus:border-gold/50 min-h-[120px] resize-none"
                />
              ) : (
                <p className="font-body text-foreground/90 leading-relaxed italic">
                  &ldquo;{cult.description || "Sin descripción"}&rdquo;
                </p>
              )}
            </ParchmentCard>

            <ParchmentCard title="Datos del Culto" icon={<Shield className="w-4 h-4" />}>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="font-heading text-sm text-muted-foreground">Nombre</span>
                  {isEditing ? (
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-background/50 border border-border rounded-sm px-2 py-1 text-sm text-right"
                    />
                  ) : (
                    <span className="font-body text-foreground">{cult.name}</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="font-heading text-sm text-muted-foreground">Deidad Principal</span>
                  <span className="font-body text-gold">{mainDeityName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="font-heading text-sm text-muted-foreground">Fundación</span>
                  <span className="font-body text-foreground">
                    {new Date(cult.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-heading text-sm text-muted-foreground">Miembros</span>
                  <span className="font-body text-foreground">{memberCount}</span>
                </div>
              </div>
            </ParchmentCard>
          </div>

          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end gap-3"
            >
              <RitualButton variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </RitualButton>
              <RitualButton variant="gold" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar Sellos
              </RitualButton>
            </motion.div>
          )}

          {/* Sección de imagen */}
          {profile?.is_main_deity && (
            <ParchmentCard title="Sello del Culto" icon={<Image className="w-4 h-4" />}>
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-border/50 
                                flex items-center justify-center bg-muted/20">
                  <Image className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <p className="font-body text-sm text-muted-foreground text-center">
                  Sube una imagen que represente a tu culto.<br />
                  Será visible para todos los fieles.
                </p>
                <RitualButton variant="outline" className="text-sm">
                  Elegir Imagen
                </RitualButton>
              </div>
            </ParchmentCard>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}