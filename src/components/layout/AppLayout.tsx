import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { BookPage } from "@/components/layout/BookPage";
import { RitualButton } from "@/components/ui/ritual-button";
import { Crown, Heart, ArrowLeft, LogOut } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  backHref?: string;
}

export function AppLayout({ children, title, icon, backHref = "/dashboard" }: AppLayoutProps) {
  const { profile, role, signOut } = useAuth();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background parchment-texture py-4 px-2 md:px-4">
      <BookPage pageKey={router.pathname}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <RitualButton
                variant="ghost"
                size="icon"
                onClick={() => router.push(backHref)}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </RitualButton>
              
              {icon && (
                <span className="text-gold">
                  {icon}
                </span>
              )}
              
              <div>
                <h1 className="font-display text-xl md:text-2xl text-foreground">
                  {title}
                </h1>
                <p className="font-heading text-xs text-muted-foreground tracking-wider">
                  {profile?.display_name || "Desconocido"} · {role === "deity" ? "Deidad" : "Fiel"}
                </p>
              </div>
            </div>
            
            <RitualButton variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </RitualButton>
          </div>

          {/* Content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </BookPage>
    </main>
  );
}