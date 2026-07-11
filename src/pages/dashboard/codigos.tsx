import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Copy, Crown, Heart, Loader2, AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth, type InvitationCode } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function CodigosPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadCodes = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("invitation_codes")
        .select("*")
        .eq("creator_id", user.id)
        .eq("is_active", true)
        .order("code_type", { ascending: false }); // deity first
      
      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los códigos",
          variant: "destructive",
        });
      } else {
        setCodes(data || []);
      }
      setIsLoading(false);
    };
    
    loadCodes();
  }, [user, toast]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copiado", description: "Código copiado al portapapeles." });
  };

  const generateFollowerCode = async () => {
    if (!user || !profile?.cult_id) return;
    
    setIsLoading(true);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const { error } = await supabase.from("invitation_codes").insert({
      code,
      code_type: "follower",
      creator_id: user.id,
      cult_id: profile.cult_id,
      is_active: true,
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Código creado",
        description: `Tu código de fiel: ${code}`,
      });
      // Recargar códigos
      const { data } = await supabase
        .from("invitation_codes")
        .select("*")
        .eq("creator_id", user.id)
        .eq("is_active", true)
        .order("code_type", { ascending: false });
      setCodes(data || []);
    }
    setIsLoading(false);
  };

  const isMainDeity = profile?.is_main_deity;
  const deityCode = codes.find(c => c.code_type === "deity");
  const followerCode = codes.find(c => c.code_type === "follower");

  return (
    <AppLayout title="Códigos de Invitación">
      <BookPage pageKey="codigos">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Key className="w-8 h-8 text-gold mx-auto" />
            <h1 className="font-display text-3xl text-foreground">
              Sellos de Invitación
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Códigos permanentes para admitir nuevos miembros bajo tu cargo
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Código de Deidad — solo para Deidad Principal */}
              {isMainDeity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ParchmentCard
                    title="Código de Deidad"
                    icon={<Crown className="w-5 h-5 text-gold" />}
                  >
                    {deityCode ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-gold/5 border border-gold/20 rounded-sm text-center">
                          <p className="font-mono text-2xl text-gold tracking-[0.2em]">
                            {deityCode.code}
                          </p>
                          <p className="font-body text-xs text-muted-foreground mt-2">
                            Código permanente · Nunca expira
                          </p>
                        </div>
                        <p className="font-body text-sm text-muted-foreground">
                          Al usar este código, la nueva deidad será admitida directamente bajo tu protección en el culto.
                        </p>
                        <RitualButton
                          variant="gold"
                          className="w-full"
                          onClick={() => copyCode(deityCode.code)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Código
                        </RitualButton>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="font-body text-sm text-muted-foreground">
                          No tienes un código de deidad activo.
                        </p>
                      </div>
                    )}
                  </ParchmentCard>
                </motion.div>
              )}

              {/* Código de Fiel — para todas las deidades */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ParchmentCard
                  title="Código de Fiel"
                  icon={<Heart className="w-5 h-5 text-wine" />}
                >
                  {followerCode ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-wine/5 border border-wine/20 rounded-sm text-center">
                        <p className="font-mono text-2xl text-wine tracking-[0.2em]">
                          {followerCode.code}
                        </p>
                        <p className="font-body text-xs text-muted-foreground mt-2">
                          Código permanente · Nunca expira
                        </p>
                      </div>
                      <p className="font-body text-sm text-muted-foreground">
                        Al usar este código, el nuevo fiel será asignado a tu jerarquía automáticamente.
                      </p>
                      <RitualButton
                        variant="wine"
                        className="w-full"
                        onClick={() => copyCode(followerCode.code)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Código
                      </RitualButton>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-4">
                      <p className="font-body text-sm text-muted-foreground">
                        No tienes un código de fiel activo.
                      </p>
                      <RitualButton
                        variant="wine"
                        onClick={generateFollowerCode}
                      >
                        Generar Código de Fiel
                      </RitualButton>
                    </div>
                  )}
                </ParchmentCard>
              </motion.div>

              {/* Instrucciones */}
              <div className="p-4 bg-muted/20 border border-border/30 rounded-sm space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-body text-xs text-muted-foreground">
                      <strong className="text-foreground">Códigos estáticos:</strong> Cada deidad tiene exactamente 2 códigos permanentes. No se agotan con el uso.
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      <strong className="text-foreground">Deidad Principal:</strong> Puede dar códigos de deidad y de fiel.
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      <strong className="text-foreground">Deidades secundarias:</strong> Solo pueden dar códigos de fiel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}