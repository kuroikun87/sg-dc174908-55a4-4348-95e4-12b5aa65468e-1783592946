import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Gift, AlertTriangle, Plus, Clock, Star, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  requiresEvidence: boolean;
  assignedTo: string | null;
  completed: boolean;
  completedAt: string | null;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
}

interface Consequence {
  id: string;
  name: string;
  description: string;
  severity: "low" | "medium" | "high";
  forgiven: boolean;
  forgivenAt: string | null;
  note: string;
}

export default function TareasPage() {
  const [activeTab, setActiveTab] = useState<"tasks" | "rewards" | "consequences">("tasks");
  const [isDeity] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Meditación diaria", description: "15 minutos de meditación en silencio", points: 10, requiresEvidence: false, assignedTo: null, completed: false, completedAt: null },
    { id: "2", title: "Ritual de sumisión", description: "Realiza el ritual asignado y envía foto", points: 25, requiresEvidence: true, assignedTo: null, completed: true, completedAt: "2026-07-08", },
  ]);

  const [rewards] = useState<Reward[]>([
    { id: "1", name: "Noche de privilegios", description: "Una noche donde el fiel elige la actividad", cost: 50, icon: "gift" },
    { id: "2", name: "Bendición personal", description: "Un mensaje de tu deidad solo para ti", cost: 20, icon: "star" },
  ]);

  const [consequences] = useState<Consequence[]>([
    { id: "1", name: "Reflexión escrita", description: "Escribe 500 palabras sobre tu falta", severity: "low", forgiven: false, forgivenAt: null, note: "" },
  ]);

  return (
    <AppLayout title="Tareas, Premios y Consecuencias" icon={<Star className="w-5 h-5" />}>
      <BookPage pageKey="tareas">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Tareas, Premios y Consecuencias</h1>
            <p className="font-body text-muted-foreground">
              Gana puntos de fe, canjea premios o cumple consecuencias
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 border-b border-border/40 pb-4">
            {[
              { key: "tasks" as const, label: "Tareas", icon: <Check className="w-4 h-4" /> },
              { key: "rewards" as const, label: "Premios", icon: <Gift className="w-4 h-4" /> },
              { key: "consequences" as const, label: "Consecuencias", icon: <AlertTriangle className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm font-heading text-sm transition-all ${
                  activeTab === tab.key
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* TASKS */}
          {activeTab === "tasks" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {isDeity && (
                <RitualButton variant="gold" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Tarea
                </RitualButton>
              )}

              {tasks.map((task) => (
                <ParchmentCard key={task.id} title={task.title}>
                  <div className="space-y-3">
                    <p className="font-body text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs font-heading">
                      <span className="text-gold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {task.points} pts de fe
                      </span>
                      {task.requiresEvidence && (
                        <span className="text-wine flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Requiere evidencia
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      {!task.completed ? (
                        <RitualButton variant="outline" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Completar
                        </RitualButton>
                      ) : (
                        <span className="text-xs font-heading text-gold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Completado el {task.completedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </ParchmentCard>
              ))}
            </motion.div>
          )}

          {/* REWARDS */}
          {activeTab === "rewards" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {isDeity && (
                <RitualButton variant="gold" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Premio
                </RitualButton>
              )}

              <div className="text-center mb-4">
                <span className="font-display text-2xl text-gold">150</span>
                <span className="font-heading text-sm text-muted-foreground ml-2">pts de fe disponibles</span>
              </div>

              {rewards.map((reward) => (
                <ParchmentCard key={reward.id} title={reward.name}>
                  <div className="space-y-3">
                    <p className="font-body text-sm text-muted-foreground">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gold font-heading text-sm flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {reward.cost} pts
                      </span>
                      <RitualButton variant="wine" className="text-xs">
                        Canjear
                      </RitualButton>
                    </div>
                  </div>
                </ParchmentCard>
              ))}
            </motion.div>
          )}

          {/* CONSEQUENCES */}
          {activeTab === "consequences" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {isDeity && (
                <RitualButton variant="wine" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Asignar Consecuencia
                </RitualButton>
              )}

              {consequences.map((consequence) => (
                <ParchmentCard
                  key={consequence.id}
                  title={consequence.name}
                  className={consequence.forgiven ? "opacity-50" : ""}
                >
                  <div className="space-y-3">
                    <p className="font-body text-sm text-muted-foreground">{consequence.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-heading px-2 py-0.5 rounded-sm ${
                        consequence.severity === "high" ? "bg-wine/20 text-wine" :
                        consequence.severity === "medium" ? "bg-amber-500/20 text-amber-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {consequence.severity === "high" ? "Grave" :
                         consequence.severity === "medium" ? "Moderada" : "Leve"}
                      </span>
                      {consequence.forgiven && (
                        <span className="text-xs font-heading text-gold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Perdonada el {consequence.forgivenAt}
                        </span>
                      )}
                    </div>
                    {consequence.note && (
                      <p className="font-body text-xs text-muted-foreground italic border-l-2 border-gold/30 pl-2">
                        Nota de la deidad: {consequence.note}
                      </p>
                    )}
                  </div>
                </ParchmentCard>
              ))}
            </motion.div>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}