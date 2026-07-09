import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { Book, Crown, Heart, ChevronRight, Flame, Scroll, Loader2 } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<"deity" | "follower" | null>(null);

  return (
    <main className="min-h-screen bg-background parchment-texture py-4 px-2 md:px-4">
      <BookPage pageKey="landing">
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
          {/* Título principal */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3 text-gold/60 mb-2">
              <Flame className="w-5 h-5 animate-candle-flicker" />
              <span className="font-heading text-sm tracking-[0.3em] uppercase">
                Bienvenido al ritual
              </span>
              <Flame className="w-5 h-5 animate-candle-flicker" />
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-tight">
              El Grimorio de
              <br />
              <span className="text-gold gold-glow">la Casa Nocturna</span>
            </h1>

            <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto italic">
              &ldquo;Quien entra abandona la luz del mundo exterior
              <br className="hidden md:block" />
              para encontrar su verdadero propósito en la sombra&rdquo;
            </p>
          </motion.div>

          {/* Símbolo decorativo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent my-4"
          />

          {/* Selección de rol */}
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 w-full max-w-lg"
              >
                <p className="font-heading text-sm tracking-widest text-muted-foreground uppercase">
                  Elige tu camino
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RoleCard
                    icon={<Crown className="w-8 h-8" />}
                    title="Deidad"
                    description="Diriges el culto. Creas, ordenas y guías a quienes te siguen."
                    onClick={() => setSelectedRole("deity")}
                    accent="wine"
                  />
                  <RoleCard
                    icon={<Heart className="w-8 h-8" />}
                    title="Fiel"
                    description="Sigues el camino trazado. Te entregas a la voluntad de tu deidad."
                    onClick={() => setSelectedRole("follower")}
                    accent="gold"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, rotateY: -15 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 15 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-6"
              >
                <div className="flex items-center justify-center gap-3">
                  {selectedRole === "deity" ? (
                    <Crown className="w-6 h-6 text-wine" />
                  ) : (
                    <Heart className="w-6 h-6 text-gold" />
                  )}
                  <h2 className="font-heading text-2xl text-foreground">
                    {selectedRole === "deity" ? "Entrada de la Deidad" : "Entrada del Fiel"}
                  </h2>
                </div>

                <AuthForm role={selectedRole} onBack={() => setSelectedRole(null)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pie de página decorativo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-8 flex items-center gap-2 text-muted-foreground/50 text-xs font-heading tracking-wider"
          >
            <Book className="w-3 h-3" />
            <span>© 2026 Casa Nocturna</span>
            <span className="mx-2">·</span>
            <Scroll className="w-3 h-3" />
            <span>Todos los rituales están sellados</span>
          </motion.div>
        </div>
      </BookPage>
    </main>
  );
}

function RoleCard({
  icon,
  title,
  description,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  accent: "wine" | "gold";
}) {
  const accentClasses = accent === "wine" 
    ? "hover:border-wine/50 text-wine hover:shadow-wine/20"
    : "hover:border-gold/50 text-gold hover:shadow-gold/20";

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        group relative w-full p-6 text-left
        bg-card/60 backdrop-blur-sm
        border border-border/50 rounded-sm
        ${accentClasses} transition-all duration-300
        hover:shadow-lg
      `}
    >
      <div className={`${accent === "wine" ? "text-wine" : "text-gold"} mb-3 transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <h3 className="font-heading text-xl text-foreground mb-2 group-hover:text-gold transition-colors">
        {title}
      </h3>
      <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>
      <div className={`flex items-center gap-1 ${accent === "wine" ? "text-wine" : "text-gold"} text-sm font-heading`}>
        <span>Continuar</span>
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>

      {/* Decoración esquina */}
      <div className={`absolute top-2 right-2 w-4 h-4 border-t border-r ${accent === "wine" ? "border-wine/20" : "border-gold/20"} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className={`absolute bottom-2 left-2 w-4 h-4 border-b border-l ${accent === "wine" ? "border-wine/20" : "border-gold/20"} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </motion.button>
  );
}

function AuthForm({ role, onBack }: { role: "deity" | "follower"; onBack: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, role, displayName);
        toast({
          title: "Cuenta creada",
          description: "Revisa tu correo para confirmar tu entrada al culto.",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Bienvenido",
          description: "Has entrado al grimorio.",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Algo salió mal en el ritual",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignUp && (
        <div className="space-y-2">
          <label className="font-heading text-sm text-muted-foreground tracking-wide">
            Nombre o título ritual
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required={isSignUp}
            className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                       text-foreground font-body placeholder:text-muted-foreground/50
                       focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                       transition-all"
            placeholder="Cómo te conocerán en el culto"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="font-heading text-sm text-muted-foreground tracking-wide">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                     text-foreground font-body placeholder:text-muted-foreground/50
                     focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                     transition-all"
          placeholder="tu@email.com"
        />
      </div>

      <div className="space-y-2">
        <label className="font-heading text-sm text-muted-foreground tracking-wide">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                     text-foreground font-body placeholder:text-muted-foreground/50
                     focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                     transition-all"
          placeholder="••••••••"
        />
      </div>

      <RitualButton
        type="submit"
        variant={role === "deity" ? "wine" : "gold"}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          isSignUp ? "Crear cuenta" : "Entrar al culto"
        )}
      </RitualButton>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-muted-foreground hover:text-gold transition-colors font-body"
        >
          {isSignUp ? "¿Ya tienes cuenta? Entra" : "¿Nuevo en el culto? Regístrate"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
        >
          Volver
        </button>
      </div>
    </form>
  );
}