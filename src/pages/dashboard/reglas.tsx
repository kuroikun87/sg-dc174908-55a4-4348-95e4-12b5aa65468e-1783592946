import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scroll, Plus, Trash2, Loader2 } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Rule {
  id: string;
  rule_type: "law" | "rule" | "commandment" | "prayer" | "info";
  title: string;
  content: string;
  cult_id: string;
  created_at: string;
}

const ruleTypes = [
  { key: "law", label: "Ley", color: "text-wine" },
  { key: "rule", label: "Regla", color: "text-gold" },
  { key: "commandment", label: "Mandamiento", color: "text-purple-400" },
  { key: "prayer", label: "Oración", color: "text-blue-400" },
  { key: "info", label: "Información", color: "text-muted-foreground" },
] as const;

export default function ReglasPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRuleType, setNewRuleType] = useState<Rule["rule_type"]>("law");
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleContent, setNewRuleContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadRules();
  }, [profile?.cult_id]);

  const loadRules = async () => {
    if (!profile?.cult_id) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("rules")
      .select("*")
      .eq("cult_id", profile.cult_id)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar las reglas: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setRules(data || []);
    }
    setIsLoading(false);
  };

  const addRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim() || !newRuleContent.trim() || !profile?.cult_id) return;

    const { error } = await supabase.from("rules").insert({
      rule_type: newRuleType,
      title: newRuleTitle,
      content: newRuleContent,
      cult_id: profile.cult_id,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Regla creada",
        description: `${newRuleTitle} ha sido inscrita.`,
      });
      setNewRuleTitle("");
      setNewRuleContent("");
      setShowForm(false);
      loadRules();
    }
  };

  const deleteRule = async (id: string) => {
    const { error } = await supabase.from("rules").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Regla eliminada",
        description: "La regla ha sido borrada.",
      });
      loadRules();
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Reglas" icon={<Scroll className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const canEdit = profile?.is_main_deity;

  return (
    <AppLayout title="Reglas" icon={<Scroll className="w-5 h-5" />}>
      <BookPage pageKey="reglas">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Códice del Culto</h1>
            <p className="font-body text-muted-foreground">
              Leyes, mandamientos y oraciones sagradas
            </p>
          </div>

          {/* Lista de reglas por tipo */}
          {ruleTypes.map((type) => {
            const typeRules = rules.filter(r => r.rule_type === type.key);
            if (typeRules.length === 0) return null;

            return (
              <ParchmentCard key={type.key} title={type.label}>
                <div className="space-y-3">
                  {typeRules.map((rule, i) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 bg-background/30 rounded-sm border border-border/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-heading text-sm ${type.color} mb-1`}>{rule.title}</h3>
                          <p className="font-body text-xs text-muted-foreground whitespace-pre-wrap">
                            {rule.content}
                          </p>
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ParchmentCard>
            );
          })}

          {rules.length === 0 && (
            <p className="font-body text-muted-foreground text-center py-10">
              No hay reglas definidas todavía.
            </p>
          )}

          {/* Formulario (solo deidad principal) */}
          {canEdit && (
            <ParchmentCard title="Nueva Regla" icon={<Plus className="w-4 h-4" />}>
              {!showForm ? (
                <RitualButton
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Regla
                </RitualButton>
              ) : (
                <form onSubmit={addRule} className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {ruleTypes.map((type) => (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => setNewRuleType(type.key)}
                        className={`px-3 py-1.5 rounded-sm border text-xs font-heading transition-all ${
                          newRuleType === type.key
                            ? `bg-wine/20 border-wine ${type.color}`
                            : "bg-background/50 border-border/40 text-muted-foreground"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Título
                    </label>
                    <input
                      value={newRuleTitle}
                      onChange={(e) => setNewRuleTitle(e.target.value)}
                      required
                      placeholder="Ej: Obediencia absoluta"
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Contenido
                    </label>
                    <textarea
                      value={newRuleContent}
                      onChange={(e) => setNewRuleContent(e.target.value)}
                      required
                      placeholder="Descripción completa..."
                      rows={4}
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <RitualButton type="submit" variant="gold" className="flex-1">
                      Guardar
                    </RitualButton>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </ParchmentCard>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}