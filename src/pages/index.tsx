import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { Book, Flame, Loader2, ChevronRight, Crown, Heart, Shield, AlertTriangle, Check, Wifi, WifiOff } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type AuthStep = "landing" | "login" | "signup" | "onboarding";

export default function Home() {
  const [step, setStep] = useState<AuthStep>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isOver18, setIsOver18] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "error">("checking");
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { error } = await supabase.from("cults").select("*", { count: "exact", head: true });
        if (error) {
          console.error("[Health Check] Supabase error:", error.message, error.code);
          setSupabaseStatus("error");
        } else {
          console.log("[Health Check] Supabase connected successfully");
          setSupabaseStatus("connected");
        }
      } catch (e) {
        console.error("[Health Check] Exception:", e);
        setSupabaseStatus("error");
      }
    };
    checkSupabase();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast({ title: "Bienvenido", description: "Has entrado al grimorio." });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Falló el ritual de entrada",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOver18) {
      toast({
        title: "Verificación requerida",
        description: "Debes confirmar que eres mayor de 18 años para continuar.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await signUp(email, password, null, displayName);
      
      if (result.needsEmailConfirmation) {
        toast({
          title: "Verificación requerida",
          description: "Revisa tu correo para confirmar tu cuenta antes de continuar.",
          variant: "destructive",
        });
        setStep("landing");
      } else {
        toast({
          title: "Cuenta creada",
          description: "Tu cuenta ha sido sellada. Ahora elige tu camino.",
        });
        setStep("onboarding");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo completar el ritual",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background parchment-texture py-4 px-2 md:px-4">
      <BookPage pageKey="landing">
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 max-w-lg mx-auto">
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

            <h1 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
              El Grimorio de
              <br />
              <span className="text-gold gold-glow">la Casa Nocturna</span>
            </h1>

            <p className="font-body text-base md:text-lg text-muted-foreground max-w-md mx-auto italic">
              &ldquo;Quien entra abandona la luz del mundo exterior
              para encontrar su verdadero propósito en la sombra&rdquo;
            </p>
          </motion.div>

          {/* Health Check Status */}
          <div className="flex items-center gap-2 text-xs font-heading">
            {supabaseStatus === "checking" && (
              <span className="text-muted-foreground/50 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Verificando conexión...
              </span>
            )}
            {supabaseStatus === "connected" && (
              <span className="text-gold/60 flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                Grimorio conectado
              </span>
            )}
            {supabaseStatus === "error" && (
              <span className="text-wine flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Sin conexión al grimorio — verifica configuración
              </span>
            )}
          </div>

          {/* Símbolo decorativo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent my-4"
          />

          <AnimatePresence mode="wait">
            {step === "landing" && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full space-y-4"
              >
                <RitualButton
                  variant="gold"
                  className="w-full py-4 text-lg"
                  onClick={() => setStep("login")}
                >
                  Entrar al Culto
                  <ChevronRight className="w-5 h-5 ml-2" />
                </RitualButton>

                <button
                  onClick={() => setStep("signup")}
                  className="w-full py-3 text-muted-foreground hover:text-gold transition-colors font-body text-sm"
                >
                  ¿Nuevo en el culto? Crea tu cuenta
                </button>

                <div className="flex items-center justify-center gap-2 text-muted-foreground/40 text-xs font-heading pt-4">
                  <Shield className="w-3 h-3" />
                  <span>Solo para mayores de 18 años</span>
                  <Shield className="w-3 h-3" />
                </div>
              </motion.div>
            )}

            {step === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, rotateY: -15 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 15 }}
                transition={{ duration: 0.5 }}
                onSubmit={handleLogin}
                className="w-full space-y-4 text-left"
              >
                <h2 className="font-heading text-xl text-foreground text-center mb-6">
                  Entrada al Grimorio
                </h2>

                <div className="space-y-2">
                  <label className="font-heading text-xs text-muted-foreground tracking-wide uppercase">
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
                  <label className="font-heading text-xs text-muted-foreground tracking-wide uppercase">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                               text-foreground font-body placeholder:text-muted-foreground/50
                               focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                               transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <RitualButton
                  type="submit"
                  variant="gold"
                  className="w-full mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Entrar"
                  )}
                </RitualButton>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("signup")}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors font-body"
                  >
                    Crear cuenta
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("landing")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                  >
                    Volver
                  </button>
                </div>
              </motion.form>
            )}

            {step === "signup" && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, rotateY: -15 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 15 }}
                transition={{ duration: 0.5 }}
                onSubmit={handleSignup}
                className="w-full space-y-4 text-left"
              >
                <h2 className="font-heading text-xl text-foreground text-center mb-6">
                  Sellar tu Cuenta
                </h2>

                <div className="space-y-2">
                  <label className="font-heading text-xs text-muted-foreground tracking-wide uppercase">
                    Nombre o título ritual
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                               text-foreground font-body placeholder:text-muted-foreground/50
                               focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                               transition-all"
                    placeholder="Cómo te conocerán en el culto"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-heading text-xs text-muted-foreground tracking-wide uppercase">
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
                  <label className="font-heading text-xs text-muted-foreground tracking-wide uppercase">
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

                {/* Checkbox +18 */}
                <div className={`p-4 rounded-sm border transition-all ${isOver18 ? 'bg-gold/5 border-gold/30' : 'bg-wine/5 border-wine/30'}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isOver18 ? 'text-gold' : 'text-wine'}`} />
                    <div className="space-y-3">
                      <p className="font-body text-sm text-foreground">
                        Esta aplicación contiene contenido explícito para adultos. Debes ser mayor de 18 años para acceder.
                      </p>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`
                          w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all
                          ${isOver18 
                            ? 'bg-gold border-gold' 
                            : 'bg-transparent border-wine/50 group-hover:border-wine'}
                        `}>
                          {isOver18 && <Check className="w-3 h-3 text-background" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={isOver18}
                          onChange={(e) => setIsOver18(e.target.checked)}
                          className="hidden"
                        />
                        <span className={`font-heading text-sm ${isOver18 ? 'text-gold' : 'text-wine'}`}>
                          Confirmo que soy mayor de 18 años
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <RitualButton
                  type="submit"
                  variant="gold"
                  className="w-full mt-4"
                  disabled={isLoading || !isOver18}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Crear Cuenta"
                  )}
                </RitualButton>

                {!isOver18 && (
                  <p className="text-center text-xs text-wine font-body">
                    Debes confirmar tu mayoría de edad para continuar
                  </p>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("login")}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors font-body"
                  >
                    Ya tengo cuenta
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("landing")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                  >
                    Volver
                  </button>
                </div>
              </motion.form>
            )}

            {step === "onboarding" && (
              <OnboardingFlow displayName={displayName} />
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
            <Shield className="w-3 h-3" />
            <span>18+ Solo adultos</span>
          </motion.div>
        </div>
      </BookPage>
    </main>
  );
}

function OnboardingFlow({ displayName }: { displayName: string }) {
  const [onboardingStep, setOnboardingStep] = useState<"choice" | "create-cult" | "join-cult">("choice");
  const [cultName, setCultName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { completeOnboarding } = useAuth();

  const createCult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cultName.trim()) {
      toast({ title: "Error", description: "El nombre del culto es requerido", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await completeOnboarding({ cultName: cultName.trim(), displayName });
      toast({
        title: "Culto creado",
        description: `El culto "${cultName}" ha sido fundado. Eres la Deidad Principal.`,
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error al crear el culto",
        description: error instanceof Error ? error.message : "Falló el ritual de fundación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinCult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast({ title: "Error", description: "El código de invitación es requerido", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await completeOnboarding({ inviteCode: inviteCode.trim(), displayName });
      toast({
        title: "Bienvenido al culto",
        description: "Has sido admitido. Que los ritmos te guíen.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error al unirse",
        description: error instanceof Error ? error.message : "El código no es válido o ha expirado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {onboardingStep === "choice" && (
        <motion.div
          key="choice"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl text-foreground">Elige tu Destino</h2>
            <p className="font-body text-sm text-muted-foreground">
              ¿Fundarás tu propio culto o te unirás a uno existente?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOnboardingStep("create-cult")}
              className="p-6 text-left bg-card/60 border border-border/50 rounded-sm
                         hover:border-gold/50 hover:shadow-gold/10 hover:shadow-lg transition-all"
            >
              <Crown className="w-8 h-8 text-gold mb-3" />
              <h3 className="font-heading text-lg text-foreground mb-2">Fundar un Culto</h3>
              <p className="font-body text-sm text-muted-foreground">
                Serás la Deidad Principal. Tendrás control absoluto sobre tu Casa Nocturna.
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOnboardingStep("join-cult")}
              className="p-6 text-left bg-card/60 border border-border/50 rounded-sm
                         hover:border-wine/50 hover:shadow-wine/10 hover:shadow-lg transition-all"
            >
              <Heart className="w-8 h-8 text-wine mb-3" />
              <h3 className="font-heading text-lg text-foreground mb-2">Unirse a un Culto</h3>
              <p className="font-body text-sm text-muted-foreground">
                Ingresa con un código de invitación para servir bajo una Deidad.
              </p>
            </motion.button>
          </div>
        </motion.div>
      )}

      {onboardingStep === "create-cult" && (
        <motion.form
          key="create-cult"
          initial={{ opacity: 0, rotateY: -15 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 15 }}
          onSubmit={createCult}
          className="w-full space-y-4 text-left"
        >
          <div className="text-center space-y-2 mb-6">
            <Crown className="w-8 h-8 text-gold mx-auto" />
            <h2 className="font-heading text-xl text-foreground">Fundar tu Casa Nocturna</h2>
            <p className="font-body text-sm text-muted-foreground">
              Como Deidad Principal, todo dependerá de ti
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-heading text-xs text-muted-foreground tracking-wide uppercase">
              Nombre del Culto
            </label>
            <input
              type="text"
              value={cultName}
              onChange={(e) => setCultName(e.target.value)}
              required
              disabled={isLoading}
              className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                         text-foreground font-body placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                         transition-all"
              placeholder="Ej: La Orden del Velo Carmesí"
            />
          </div>

          <RitualButton type="submit" variant="gold" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Fundar Culto"}
          </RitualButton>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => setOnboardingStep("choice")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-body pt-2"
          >
            Volver
          </button>
        </motion.form>
      )}

      {onboardingStep === "join-cult" && (
        <motion.form
          key="join-cult"
          initial={{ opacity: 0, rotateY: -15 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 15 }}
          onSubmit={joinCult}
          className="w-full space-y-4 text-left"
        >
          <div className="text-center space-y-2 mb-6">
            <Heart className="w-8 h-8 text-wine mx-auto" />
            <h2 className="font-heading text-xl text-foreground">Ingresar al Culto</h2>
            <p className="font-body text-sm text-muted-foreground">
              Introduce el código de invitación que te fue otorgado
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-heading text-xs text-muted-foreground tracking-wide uppercase">
              Código de Invitación
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              disabled={isLoading}
              className="w-full bg-background/50 border border-border rounded-sm px-4 py-3
                         text-foreground font-body placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-wine/50 focus:ring-1 focus:ring-wine/20
                         transition-all text-center tracking-widest font-mono text-lg"
              placeholder="ABC-123-XYZ"
            />
            <p className="font-body text-xs text-muted-foreground/60 text-center">
              Los códigos distinguen entre mayúsculas y minúsculas
            </p>
          </div>

          <RitualButton type="submit" variant="wine" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Unirse al Culto"}
          </RitualButton>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => setOnboardingStep("choice")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-body pt-2"
          >
            Volver
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}