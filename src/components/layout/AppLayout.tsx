import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { BookPage } from "@/components/layout/BookPage";
import { RitualButton } from "@/components/ui/ritual-button";
import {
  Crown,
  Home,
  Users,
  Zap,
  Award,
  BookOpen,
  Gift,
  AlertTriangle,
  CheckSquare,
  User,
  Calendar,
  StickyNote,
  Heart,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, title, icon, showSidebar = true }: AppLayoutProps) {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <main className="min-h-screen bg-background parchment-texture">
      <BookPage pageKey={router.pathname}>
        <div className="flex h-screen">
          {/* Sidebar */}
          {showSidebar && (
            <aside className="w-64 border-r border-border/30 bg-card/50 backdrop-blur-sm flex flex-col">
              {/* User info */}
              <div className="flex items-center gap-3 p-4 border-b border-border/30">
                <Avatar className="w-10 h-10 border border-silver/30">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-muted">
                    {profile?.display_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm text-foreground truncate">
                    {profile?.display_name || profile?.full_name || "Usuario"}
                  </p>
                  {profile?.title && <p className="text-xs text-silver truncate">{profile.title}</p>}
                  {!profile?.title && profile?.role === "deity" && (
                    <p className="text-xs text-muted-foreground">Deidad</p>
                  )}
                  {!profile?.title && profile?.role === "follower" && (
                    <p className="text-xs text-muted-foreground">Fiel</p>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                    router.pathname === "/dashboard"
                      ? "bg-silver/10 text-silver"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="font-heading text-sm">Inicio</span>
                </Link>

                {profile?.role === "deity" && (
                  <>
                    <Link
                      href="/dashboard/culto"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/culto"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Crown className="w-4 h-4" />
                      <span className="font-heading text-sm">Culto</span>
                    </Link>

                    <Link
                      href="/dashboard/jerarquia"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/jerarquia"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="font-heading text-sm">Jerarquía</span>
                    </Link>

                    <Link
                      href="/dashboard/sesion"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/sesion"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span className="font-heading text-sm">Sesión</span>
                    </Link>

                    <Link
                      href="/dashboard/rangos"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/rangos"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      <span className="font-heading text-sm">Rangos</span>
                    </Link>

                    <Link
                      href="/dashboard/reglas"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/reglas"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="font-heading text-sm">Reglas</span>
                    </Link>

                    <Link
                      href="/dashboard/recompensas"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/recompensas"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Gift className="w-4 h-4" />
                      <span className="font-heading text-sm">Recompensas</span>
                    </Link>

                    <Link
                      href="/dashboard/tareas"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/tareas"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span className="font-heading text-sm">Tareas</span>
                    </Link>

                    <Link
                      href="/dashboard/fetiches"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/fetiches"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="font-heading text-sm">Fetiches</span>
                    </Link>

                    <Link
                      href="/dashboard/codigos"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/codigos"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="font-heading text-sm">Códigos</span>
                    </Link>
                  </>
                )}

                {profile?.role === "follower" && (
                  <>
                    <Link
                      href="/dashboard/culto"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/culto"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Crown className="w-4 h-4" />
                      <span className="font-heading text-sm">Culto</span>
                    </Link>

                    <Link
                      href="/dashboard/reglas"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/reglas"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="font-heading text-sm">Reglas</span>
                    </Link>

                    <Link
                      href="/dashboard/sesion"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/sesion"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span className="font-heading text-sm">Sesión</span>
                    </Link>

                    <Link
                      href="/dashboard/tareas"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/tareas"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span className="font-heading text-sm">Tareas</span>
                    </Link>

                    <Link
                      href="/dashboard/mis-premios"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/mis-premios"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Gift className="w-4 h-4" />
                      <span className="font-heading text-sm">Premios</span>
                    </Link>

                    <Link
                      href="/dashboard/mis-consecuencias"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/mis-consecuencias"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-heading text-sm">Consecuencias</span>
                    </Link>

                    <Link
                      href="/dashboard/puntos-fe"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/puntos-fe"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      <span className="font-heading text-sm">Puntos de Fe</span>
                    </Link>

                    <Link
                      href="/dashboard/fetiches"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/fetiches"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="font-heading text-sm">Fetiches</span>
                    </Link>

                    <Link
                      href="/dashboard/almanaque"
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                        router.pathname === "/dashboard/almanaque"
                          ? "bg-silver/10 text-silver"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="font-heading text-sm">Almanaque</span>
                    </Link>
                  </>
                )}

                <Link
                  href="/dashboard/notas"
                  className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                    router.pathname === "/dashboard/notas"
                      ? "bg-silver/10 text-silver"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  <StickyNote className="w-4 h-4" />
                  <span className="font-heading text-sm">Notas</span>
                </Link>

                <Link
                  href="/dashboard/perfil"
                  className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                    router.pathname === "/dashboard/perfil"
                      ? "bg-silver/10 text-silver"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="font-heading text-sm">Perfil</span>
                </Link>
              </nav>

              {/* Logout button */}
              <div className="p-4 border-t border-border/30">
                <RitualButton variant="outline" className="w-full" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </RitualButton>
              </div>
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-8">{children}</div>
          </div>
        </div>
      </BookPage>
    </main>
  );
}