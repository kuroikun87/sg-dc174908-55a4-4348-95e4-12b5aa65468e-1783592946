import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { Crown, Heart, ArrowRight, ArrowLeft, Sparkles, KeyRound, Loader2 } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { RitualButton } from "@/components/ui/ritual-button";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const [step, setStep] = useState<"choice" | "create" | "join">("choice");
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background parchment-texture py-4 px-2 md:px-4">
      <BookPage pageKey="onboarding">
        <div className="max-w-lg mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <Sparkles className="w-8 h-8 text-gold mx-auto" />
            <h1 className="font-display text-3xl text-foreground">
              Primer Ritual
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Bienvenido al Códice Oscuro. ¿Fundarás tu propio culto o te unirás a uno existente?
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <ChoiceCard
                  icon={<Crown className="w-8 h-8" />}
                  title="Fundar un Culto"
                  description="Tú serás la Deidad Principal. Crearás las leyes, los rangos, y guiarás a quienes te sigan."
                  accent="gold"
                  onClick={() => setStep("create")}
                />
                <ChoiceCard
                  icon={<Heart className="w-8 h-8" />}
                  title="Unirse a un Culto"
                  description="Has recibido un código de invitación. Entrarás bajo la protección de una deidad ya establecida."
                  accent="wine"
                  onClick={() => setStep("join")}
                />
              </motion.div>
            )}

            {step === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <CreateCultForm onBack={() => setStep("choice")} />
              </motion.div>
            )}

            {step === "join" && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <JoinCultForm onBack={() => setStep("choice")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </BookPage>
    </main>
  );
}

function ChoiceCard({
  icon,
  title,
  description,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: "gold" | "wine";
  onClick: () => void;
}) {
  const accentColor = accent === "gold" ? "text-gold hover:border-gold/50" : "text-wine hover:border-wine/50";
  const shadowColor = accent === "gold" ? "hover:shadow-gold/10" : "hover:shadow-wine/10";

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full p-6 text-left bg-card/60 backdrop-blur-sm border border-border/50 rounded-sm
        ${accentColor} ${shadowColor} transition-all duration-300 hover:shadow-lg group`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className={accent === "gold" ? "text-gold" : "text-wine"}>{icon}</div>
          <h3 className="font-heading text-xl text-foreground group-hover:text-gold transition-colors">
            {title}
          </h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-sm">
            {description}
          </p>
        </div>
        <ArrowRight className={`w-5 h-5 mt-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 ${accent === "gold" ? "text-gold" : "text-wine"}`} />
      </div>
    </motion.button>
  );
}

function CreateCultForm({ onBack }: { onBack: () => void }) {
  const [cultName, setCultName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { completeOnboarding } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await completeOnboarding({ cultName, displayName });
      toast({ title: "Culto fundado", description: `${cultName} ha sido sellado en el grimorio.` });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "El ritual falló",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <ParchmentCard title="Fundar Nuevo Culto" icon={<Crown className="w-5 h-5 text-gold" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-heading text-sm text-muted-foreground">Nombre del Culto</label>
            <input
              type="text"
              value={cultName}
              onChange={(e) => setCultName(e.target.value)}
              required
              className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                         text-foreground font-body placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-gold/50"
              placeholder="Ej: Orden del Loto Carmesí"
            />
          </div>

          <div className="space-y-2">
            <label className="font-heading text-sm text-muted-foreground">Tu nombre como Deidad Principal</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                         text-foreground font-body placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-gold/50"
              placeholder="Ej: Mistress Vespera"
            />
          </div>

          <div className="p-3 bg-gold/5 border border-gold/20 rounded-sm">
            <p className="font-body text-xs text-gold">
              Como Deidad Principal, tendrás control total sobre el culto. Podrás crear códigos para admitir deidades secundarias y fieles.
            </p>
          </div>
        </div>
      </ParchmentCard>

      <RitualButton
        onClick={() => router.push("/dashboard")}
        variant="gold"
        className="w-full"
      >
        <ArrowRight className="w-5 h-5 mr-2" />
        Ir al Culto
      </RitualButton>
    </form>
  );
}

function JoinCultForm({ onBack }: { onBack: () => void }) {
  const [inviteCode, setInviteCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { completeOnboarding } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await completeOnboarding({ inviteCode: inviteCode.toUpperCase(), displayName });
      toast({ title: "Bienvenido al culto", description: "Has sido admitido bajo la protección de tu deidad." });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "El código no es válido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <ParchmentCard title="Unirse con Código" icon={<KeyRound className="w-5 h-5 text-wine" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-heading text-sm text-muted-foreground">Código de Invitación</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                         text-foreground font-mono text-lg tracking-wider placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-wine/50 text-center uppercase"
              placeholder="NOCT-XXX-XXXX"
            />
          </div>

          <div className="space-y-2">
            <label className="font-heading text-sm text-muted-foreground">Tu nombre en el culto</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                         text-foreground font-body placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-wine/50"
              placeholder="Ej: Sombra Sumisa"
            />
          </div>

          <div className="p-3 bg-wine/5 border border-wine/20 rounded-sm">
            <p className="font-body text-xs text-wine">
              Al usar este código, aceptas las reglas y mandamientos del culto. Serás asignado directamente bajo la deidad que te invitó.
            </p>
          </div>
        </div>
      </ParchmentCard>

      <RitualButton type="submit" variant="wine" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Unirse al Culto"}
      </RitualButton>
    </form>
  );
}