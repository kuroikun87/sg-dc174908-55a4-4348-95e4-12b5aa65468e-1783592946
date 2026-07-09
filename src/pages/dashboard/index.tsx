import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { BookPage } from "@/components/layout/BookPage";
import { RitualButton } from "@/components/ui/ritual-button";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { Crown, Heart, Scroll, Users, Star, Settings, LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, profile, role, isLoading, signOut } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background parchment-texture flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </main>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <main className="min-h-screen bg-background parchment-texture py-4 px-2 md:px-4">
      <BookPage pageKey="dashboard">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {role === "deity" ? (
                <Crown className="w-6 h-6 text-wine" />
              ) : (
                <Heart className="w-6 h-6 text-gold" />
              )}
              <div>
                <h1 className="font-display text-2xl text-foreground">
                  {profile?.display_name || "Sin nombre"}
                </h1>
                <p className="font-heading text-xs text-muted-foreground tracking-wider uppercase">
                  {role === "deity" ? "Deidad" : "Fiel"} · {profile?.title || "Sin título"}
                </p>
              </div>
            </div>
            <RitualButton variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </RitualButton>
          </div>

          {/* Grid de secciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {role === "deity" ? <DeityMenu /> : <FollowerMenu />}
          </div>
        </div>
      </BookPage>
    </main>
  );
}

function DeityMenu() {
  const menuItems = [
    { icon: <Scroll className="w-5 h-5" />, title: "El Culto", desc: "Nombre, imagen y presentación", href: "/dashboard/culto" },
    { icon: <Users className="w-5 h-5" />, title: "Jerarquía", desc: "Deidades y fieles del culto", href: "/dashboard/jerarquia" },
    { icon: <Star className="w-5 h-5" />, title: "Rangos", desc: "Niveles y títulos de los fieles", href: "/dashboard/rangos" },
    { icon: <Scroll className="w-5 h-5" />, title: "Leyes y Reglas", desc: "Mandamientos y oraciones", href: "/dashboard/reglas" },
    { icon: <Star className="w-5 h-5" />, title: "Tareas y Premios", desc: "Recompensas, castigos y tareas", href: "/dashboard/tareas" },
    { icon: <Heart className="w-5 h-5" />, title: "Fetiches", desc: "Prácticas y preferencias", href: "/dashboard/fetiches" },
    { icon: <Scroll className="w-5 h-5" />, title: "Notas", desc: "Apuntes personales", href: "/dashboard/notas" },
    { icon: <Settings className="w-5 h-5" />, title: "Sesión", desc: "Beats, tarjetas y control", href: "/dashboard/sesion" },
    { icon: <Users className="w-5 h-5" />, title: "Perfil", desc: "Mis datos y configuración", href: "/dashboard/perfil" },
  ];

  return (
    <>
      {menuItems.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <a href={item.href}>
            <ParchmentCard
              title={item.title}
              icon={item.icon}
              className="h-full cursor-pointer hover:border-gold/30"
            >
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </ParchmentCard>
          </a>
        </motion.div>
      ))}
    </>
  );
}

function FollowerMenu() {
  const menuItems = [
    { icon: <Scroll className="w-5 h-5" />, title: "El Culto", desc: "Ver información del culto", href: "/dashboard/culto" },
    { icon: <Scroll className="w-5 h-5" />, title: "Reglas", desc: "Leyes y mandamientos", href: "/dashboard/reglas" },
    { icon: <Users className="w-5 h-5" />, title: "Mi Perfil", desc: "Datos personales y rango", href: "/dashboard/perfil" },
    { icon: <Star className="w-5 h-5" />, title: "Almanaque", desc: "Calendario infinito", href: "/dashboard/almanaque" },
    { icon: <Heart className="w-5 h-5" />, title: "Fetiches", desc: "Marcar prácticas", href: "/dashboard/fetiches" },
    { icon: <Settings className="w-5 h-5" />, title: "Tareas", desc: "Mis asignaciones", href: "/dashboard/tareas" },
    { icon: <Star className="w-5 h-5" />, title: "Premios", desc: "Mis recompensas", href: "/dashboard/tareas" },
    { icon: <Scroll className="w-5 h-5" />, title: "Notas", desc: "Apuntes personales", href: "/dashboard/notas" },
  ];

  return (
    <>
      {menuItems.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <a href={item.href}>
            <ParchmentCard
              title={item.title}
              icon={item.icon}
              className="h-full cursor-pointer hover:border-gold/30"
            >
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </ParchmentCard>
          </a>
        </motion.div>
      ))}
    </>
  );
}