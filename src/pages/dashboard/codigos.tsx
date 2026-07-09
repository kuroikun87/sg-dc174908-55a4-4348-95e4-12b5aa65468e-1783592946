import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Key, Copy, Crown, Heart, Plus, X, Check,
  RefreshCw, AlertTriangle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookPage } from "@/components/layout/BookPage";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CodigosPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"deity" | "follower">("follower");
  const [showCreate, setShowCreate] = useState(false);

  // Datos de prueba
  const [codes, setCodes] = useState([
    {
      id: "1",
      code: "NOCT-777-FIEL",
      code_type: "follower" as const,
      is_active: true,
      used_by: null,
      created_at: "2026-07-09T10:00:00Z",
    },
    {
      id: "2",
      code: "NOCT-888-DEI",
      code_type: "deity" as const,
      is_active: false,
      used_by: "user-123",
      created_at: "2026-07-08T15:30:00Z",
    },
  ]);

  const isMainDeity = profile?.is_main_deity;
  const canCreateDeityCode = isMainDeity;

  const generateCode = (type: "deity" | "follower") => {
    const prefix = "NOCT";
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const suffix = type === "deity" ? "DEI" : "FIEL";
    return `${prefix}-${random}-${suffix}`;
  };

  const handleCreateCode = (type: "deity" | "follower") => {
    if (type === "deity" && !canCreateDeityCode) {
      toast({
        title: "Permiso denegado",
        description: "Solo la Deidad Principal puede crear códigos de deidad.",
        variant: "destructive",
      });
      return;
    }

    const newCode = {
      id: Date.now().toString(),
      code: generateCode(type),
      code_type: type,
      is_active: true,
      used_by: null,
      created_at: new Date().toISOString(),
    };

    setCodes([newCode, ...codes]);
    setShowCreate(false);
    toast({
      title: "Código creado",
      description: `El código ${newCode.code} ha sido sellado.`,
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copiado", description: "Código copiado al portapapeles." });
  };

  const revokeCode = (id: string) => {
    setCodes(codes.map(c => c.id === id ? { ...c, is_active: false } : c));
    toast({ title: "Revocado", description: "El código ha sido revocado." });
  };

  const filteredCodes = codes.filter(c => c.code_type === activeTab);

  return (
    <AppLayout title="Códigos de Invitación">
      <BookPage pageKey="codigos">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Key className="w-8 h-8 text-gold mx-auto" />
            <h1 className="font-display text-3xl text-foreground">
              Códigos de Invitación
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Sellos para admitir nuevos miembros bajo tu protección
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex bg-muted/30 rounded-sm p-1">
              <button
                onClick={() => setActiveTab("follower")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-heading tracking-wide rounded-sm transition-all
                  ${activeTab === "follower" 
                    ? "bg-wine/20 text-wine border border-wine/30" 
                    : "text-muted-foreground hover:text-foreground"}`}
              >
                <Heart className="w-4 h-4" />
                Fieles
              </button>
              <button
                onClick={() => setActiveTab("deity")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-heading tracking-wide rounded-sm transition-all
                  ${activeTab === "deity" 
                    ? "bg-gold/20 text-gold border border-gold/30" 
                    : "text-muted-foreground hover:text-foreground"}`}
              >
                <Crown className="w-4 h-4" />
                Deidades
              </button>
            </div>
          </div>

          {/* Crear código */}
          <div className="text-center">
            <RitualButton
              variant={activeTab === "deity" ? "gold" : "wine"}
              onClick={() => setShowCreate(!showCreate)}
              disabled={activeTab === "deity" && !canCreateDeityCode}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Código de {activeTab === "deity" ? "Deidad" : "Fiel"}
            </RitualButton>

            {activeTab === "deity" && !canCreateDeityCode && (
              <p className="font-body text-xs text-muted-foreground mt-2">
                Solo la Deidad Principal puede crear estos códigos
              </p>
            )}
          </div>

          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <ParchmentCard
                  title={`Nuevo Código de ${activeTab === "deity" ? "Deidad" : "Fiel"}`}
                  icon={<Key className="w-5 h-5 text-gold" />}
                >
                  <div className="space-y-4">
                    <p className="font-body text-sm text-muted-foreground">
                      Al usar este código, el nuevo miembro será admitido directamente bajo tu cargo en el culto.
                    </p>

                    {activeTab === "follower" && (
                      <div className="p-3 bg-wine/5 border border-wine/20 rounded-sm">
                        <p className="font-body text-xs text-wine">
                          El fiel será asignado a tu jerarquía automáticamente.
                        </p>
                      </div>
                    )}

                    {activeTab === "deity" && (
                      <div className="p-3 bg-gold/5 border border-gold/20 rounded-sm">
                        <p className="font-body text-xs text-gold">
                          La nueva deidad tendrá permisos para gestionar fieles. La Deidad Principal puede revocar estos permisos.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <RitualButton
                        variant="ghost"
                        className="flex-1"
                        onClick={() => setShowCreate(false)}
                      >
                        Cancelar
                      </RitualButton>
                      <RitualButton
                        variant={activeTab === "deity" ? "gold" : "wine"}
                        className="flex-1"
                        onClick={() => handleCreateCode(activeTab)}
                      >
                        Generar Código
                      </RitualButton>
                    </div>
                  </div>
                </ParchmentCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de códigos */}
          <div className="space-y-3">
            <h3 className="font-heading text-lg text-foreground flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              Códigos Activos
            </h3>

            {filteredCodes.length === 0 ? (
              <ParchmentCard>
                <p className="text-center text-muted-foreground font-body text-sm py-8">
                  No hay códigos {activeTab === "deity" ? "de deidad" : "de fiel"} generados
                </p>
              </ParchmentCard>
            ) : (
              filteredCodes.map((code, i) => (
                <motion.div
                  key={code.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={`
                    p-4 border rounded-sm transition-all
                    ${code.is_active 
                      ? "bg-card/60 border-border/50" 
                      : "bg-muted/20 border-muted/30 opacity-60"}
                  `}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {code.code_type === "deity" ? (
                          <Crown className="w-5 h-5 text-gold" />
                        ) : (
                          <Heart className="w-5 h-5 text-wine" />
                        )}
                        <div>
                          <p className="font-mono text-lg text-foreground tracking-wider">
                            {code.code}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            Creado el {new Date(code.created_at).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {code.is_active ? (
                          <span className="flex items-center gap-1 text-xs text-green-400 font-heading">
                            <Check className="w-3 h-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground font-heading">
                            <X className="w-3 h-3" />
                            {code.used_by ? "Usado" : "Revocado"}
                          </span>
                        )}
                      </div>
                    </div>

                    {code.is_active && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyCode(code.code)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted/30 border border-border/30 rounded-sm hover:border-gold/30 transition-all"
                        >
                          <Copy className="w-4 h-4 text-gold" />
                          <span className="font-heading text-xs text-foreground">Copiar</span>
                        </button>
                        <button
                          onClick={() => revokeCode(code.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-wine/5 border border-wine/20 rounded-sm hover:bg-wine/10 transition-all"
                        >
                          <AlertTriangle className="w-4 h-4 text-wine" />
                          <span className="font-heading text-xs text-wine">Revocar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </BookPage>
    </AppLayout>
  );
}