import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Edit, Image, Save, Scroll, Shield } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";

const mockCult = {
  name: "Casa Nocturna",
  description: "Un santuario donde la sumisión se convierte en arte y la devoción en ritual eterno.",
  image: null as string | null,
  mainDeity: "Mistress Velka",
  founded: "2024-10-31",
};

export default function CultoPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [cult, setCult] = useState(mockCult);

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
              {cult.image ? (
                <img src={cult.image} alt={cult.name} className="w-full h-full object-cover opacity-80" />
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
                  Dirigido por {cult.mainDeity}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-sm
                         text-muted-foreground hover:text-gold transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Información del culto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ParchmentCard title="Presentación" icon={<Scroll className="w-4 h-4" />}>
              {isEditing ? (
                <textarea
                  value={cult.description}
                  onChange={(e) => setCult({ ...cult, description: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-sm p-3 text-foreground font-body
                             focus:outline-none focus:border-gold/50 min-h-[120px] resize-none"
                />
              ) : (
                <p className="font-body text-foreground/90 leading-relaxed italic">
                  &ldquo;{cult.description}&rdquo;
                </p>
              )}
            </ParchmentCard>

            <ParchmentCard title="Datos del Culto" icon={<Shield className="w-4 h-4" />}>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="font-heading text-sm text-muted-foreground">Nombre</span>
                  {isEditing ? (
                    <input
                      value={cult.name}
                      onChange={(e) => setCult({ ...cult, name: e.target.value })}
                      className="bg-background/50 border border-border rounded-sm px-2 py-1 text-sm text-right"
                    />
                  ) : (
                    <span className="font-body text-foreground">{cult.name}</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="font-heading text-sm text-muted-foreground">Deidad Principal</span>
                  <span className="font-body text-gold">{cult.mainDeity}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="font-heading text-sm text-muted-foreground">Fundación</span>
                  <span className="font-body text-foreground">{cult.founded}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-heading text-sm text-muted-foreground">Miembros</span>
                  <span className="font-body text-foreground">12 fieles · 3 deidades</span>
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
              <RitualButton variant="gold" onClick={() => setIsEditing(false)}>
                <Save className="w-4 h-4 mr-2" />
                Guardar Sellos
              </RitualButton>
            </motion.div>
          )}

          {/* Sección de imagen */}
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
        </div>
      </BookPage>
    </AppLayout>
  );
}