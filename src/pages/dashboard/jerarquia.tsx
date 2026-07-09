import React from "react";
import { motion } from "framer-motion";
import { Crown, Heart, ChevronDown } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";

const hierarchyData = {
  mainDeity: {
    name: "Mistress Velka",
    title: "Soberana Eterna",
    avatar: null,
    isMain: true,
  },
  deities: [
    { name: "Lord Kael", title: "Guardián del Umbral", avatar: null, level: 1 },
    { name: "Lady Morwen", title: "Tejedora de Silencios", avatar: null, level: 1 },
  ],
  followers: [
    { name: "Arieth", title: "Fiel de Velka", avatar: null, assignedTo: "Mistress Velka", rank: "Sacerdotisa", level: 3 },
    { name: "Thorn", title: "Guardián Sombrío", avatar: null, assignedTo: "Lord Kael", rank: "Guardián", level: 2 },
    { name: "Luna", title: "Susurro Nocturno", avatar: null, assignedTo: "Lady Morwen", rank: "Iniciada", level: 1 },
    { name: "Ash", title: "Ceniza Devota", avatar: null, assignedTo: "Mistress Velka", rank: "Iniciada", level: 1 },
    { name: "Raven", title: "Ojo del Cuervo", avatar: null, assignedTo: "Thorn", rank: "Novicia", level: 0 },
  ],
};

function HierarchyNode({ person, isMain = false, isDeity = false }: { person: any; isMain?: boolean; isDeity?: boolean }) {
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
        {person.name}
      </h3>
      <p className="font-body text-xs text-muted-foreground mt-1">{person.title}</p>
      {person.rank && (
        <span className="mt-2 px-2 py-0.5 bg-muted/40 rounded-sm font-body text-xs text-muted-foreground">
          {person.rank}
        </span>
      )}
    </motion.div>
  );
}

export default function JerarquiaPage() {
  return (
    <AppLayout title="Jerarquía" icon={<Crown className="w-5 h-5" />}>
      <BookPage pageKey="jerarquia">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">La Pirámide Sagrada</h1>
            <p className="font-body text-muted-foreground">Estructura de poder del culto</p>
          </div>

          {/* Pirámide visual */}
          <div className="flex flex-col items-center space-y-6">
            {/* Nivel 0: Deidad Principal */}
            <div className="relative">
              <HierarchyNode person={hierarchyData.mainDeity} isMain />
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2"
              >
                <ChevronDown className="w-4 h-4 text-gold/40" />
              </motion.div>
            </div>

            {/* Nivel 1: Deidades menores */}
            <div className="flex gap-6 items-start">
              {hierarchyData.deities.map((deity, i) => (
                <div key={deity.name} className="relative">
                  <HierarchyNode person={deity} isDeity />
                  <div className="absolute -top-6 left-1/2 w-px h-6 bg-border/40 -translate-x-1/2" />
                </div>
              ))}
            </div>

            {/* Conector */}
            <div className="w-px h-4 bg-border/30" />

            {/* Nivel 2-3: Fieles */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {hierarchyData.followers.map((follower, i) => (
                <motion.div
                  key={follower.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <HierarchyNode person={follower} />
                  <p className="text-center font-body text-xs text-muted-foreground/60 mt-1">
                    bajo {follower.assignedTo}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex justify-center gap-6 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-wine/40 border border-wine" />
              <span className="font-body text-xs text-muted-foreground">Deidad Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gold/40 border border-gold" />
              <span className="font-body text-xs text-muted-foreground">Deidad</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted/60 border border-border" />
              <span className="font-body text-xs text-muted-foreground">Fiel</span>
            </div>
          </div>
        </div>
      </BookPage>
    </AppLayout>
  );
}