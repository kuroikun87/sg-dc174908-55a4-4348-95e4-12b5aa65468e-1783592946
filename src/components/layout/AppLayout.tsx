import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { BookPage } from "@/components/layout/BookPage";
import { RitualButton } from "@/components/ui/ritual-button";
import { Crown, Heart, ArrowLeft, LogOut, Home, Users, Zap, Award } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

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
                  {profile?.title && (
                    <p className="text-xs text-silver truncate">{profile.title}</p>
                  )}
                  {!profile?.title && profile?.role === "deity" && (
                    <p className="text-xs text-muted-foreground">Deidad</p>
                  )}
                  {!profile?.title && profile?.role === "follower" && (
                    <p className="text-xs text-muted-foreground">Fiel</p>
                  )}
                </div>
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