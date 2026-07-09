import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Gavel, Heart, Plus, Scroll, Shield, Trash2 } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";

type RuleType = "law" | "rule" | "commandment" | "prayer" | "other";

interface Rule {
  id: string;
  type: RuleType;
  title: string;
  content: string;
}

const ruleIcons = {
  law: Gavel,
  rule: Shield,
  commandment: Scroll,
  prayer: Heart,
  other: BookOpen,
};

const ruleLabels = {
  law: "Ley",
  rule: "Regla",
  commandment: "Mandamiento",
  prayer: "Oración",
  other: "Otro",
};

const ruleColors = {
  law: "text-wine border-wine/30 bg-wine/5",
  rule: "text-gold border-gold/30 bg-gold/5",
  commandment: "text-foreground border-border/50 bg-muted/20",
  prayer: "text-gold/70 border-gold/20 bg-gold/5",
  other: "text-muted-foreground border-border/30 bg-muted/10",
};

const initialRules: Rule[] = [
  { id: "1", type: "law", title: "La Devoción Absoluta", content: "El fiel debe rendir pleitesía absoluta a su deidad asignada en todo momento." },
  { id: "2", type: "commandment", title: "El Silencio Sagrado", content: "Lo que ocurre dentro del culto permanece sellado para siempre." },
  { id: "3", type: "rule", title: "Puntuación Ritual", content: "Los fieles deben presentarse puntualmente a los ritos designados." },
  { id: "4", type: "prayer", title: "Oración de Sumisión", content: "Que mi voluntad sea tu guía, que mi cuerpo sea tu templo." },
];

export default function ReglasPage() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState<Partial<Rule>>({ type: "rule", title: "", content: "" });

  const addRule = () => {
    if (!newRule.title?.trim() || !newRule.content?.trim()) return;
    const rule: Rule = {
      id: Date.now().toString(),
      type: newRule.type as RuleType,
      title: newRule.title,
      content: newRule.content,
    };
    setRules([...rules, rule]);
    setNewRule({ type: "rule", title: "", content: "" });
    setIsAdding(false);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  return (
    <AppLayout title="Reglas" icon={<Scroll className="w-5 h-5" />}>
      <BookPage pageKey="reglas">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Los Sellos del Culto</h1>
            <p className="font-body text-muted-foreground">Leyes, mandamientos y preceptos sagrados</p>
          </div>

          {/* Filtros por tipo */}
          <div className="flex flex-wrap justify-center gap-2">
            {(["all", "law", "rule", "commandment", "prayer"] as const).map((type) => (
              <button
                key={type}
                className="px-3 py-1.5 rounded-sm border border-border/40 font-heading text-xs
                           text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors"
              >
                {type === "all" ? "Todos" : ruleLabels[type]}
              </button>
            ))}
          </div>

          {/* Lista de reglas */}
          <div className="space-y-4">
            {rules.map((rule, i) => {
              const Icon = ruleIcons[rule.type];
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ParchmentCard>
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-sm border ${ruleColors[rule.type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-heading text-lg text-foreground">{rule.title}</h3>
                          <button
                            onClick={() => removeRule(rule.id)}
                            className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-sm text-xs font-heading mb-2 ${ruleColors[rule.type]}`}>
                          {ruleLabels[rule.type]}
                        </span>
                        <p className="font-body text-sm text-foreground/80 leading-relaxed">
                          {rule.content}
                        </p>
                      </div>
                    </div>
                  </ParchmentCard>
                </motion.div>
              );
            })}
          </div>

          {/* Agregar nueva regla */}
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <ParchmentCard title="Nuevo Sello" icon={<Plus className="w-4 h-4" />}>
                <div className="space-y-4">
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Tipo
                    </label>
                    <select
                      value={newRule.type}
                      onChange={(e) => setNewRule({ ...newRule, type: e.target.value as RuleType })}
                      className="w-full bg-background/50 border border-border rounded-sm px-4 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    >
                      <option value="law">Ley</option>
                      <option value="rule">Regla</option>
                      <option value="commandment">Mandamiento</option>
                      <option value="prayer">Oración</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Título
                    </label>
                    <input
                      value={newRule.title}
                      onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-sm px-4 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                      placeholder="Nombre del sello"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Contenido
                    </label>
                    <textarea
                      value={newRule.content}
                      onChange={(e) => setNewRule({ ...newRule, content: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-sm px-4 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50 min-h-[100px] resize-none"
                      placeholder="Escribe el contenido del sello..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <RitualButton variant="outline" onClick={() => setIsAdding(false)} className="flex-1">
                      Cancelar
                    </RitualButton>
                    <RitualButton variant="gold" onClick={addRule} className="flex-1">
                      <Plus className="w-4 h-4 mr-2" />
                      Sellar
                    </RitualButton>
                  </div>
                </div>
              </ParchmentCard>
            </motion.div>
          ) : (
            <div className="flex justify-center pt-4">
              <RitualButton variant="gold" onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Sello
              </RitualButton>
            </div>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}