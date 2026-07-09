import React, { useState } from "react";
import { motion } from "framer-motion";
import { Scroll, Plus, Trash2, Clock } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NotasPage() {
  const [notes, setNotes] = useState<Note[]>([
    { id: "1", title: "Ritual de luna nueva", content: "Preparar velas rojas y aceite de sándalo para el próximo ritual de iniciación.", createdAt: "2026-07-08" },
    { id: "2", title: "Observaciones de fieles", content: "El fiel Marcus ha mostrado dedicación excepcional. Considerar ascenso de rango.", createdAt: "2026-07-07" },
  ]);

  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const addNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setNotes([note, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowForm(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <AppLayout title="Notas del Grimorio" icon={<Scroll className="w-5 h-5" />}>
      <BookPage pageKey="notas">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Notas del Grimorio</h1>
            <p className="font-body text-muted-foreground">
              Apuntes privados, observaciones y pensamientos
            </p>
          </div>

          {!showForm ? (
            <RitualButton variant="gold" onClick={() => setShowForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Nota
            </RitualButton>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <input
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Título de la nota..."
                className="w-full bg-background/50 border border-border rounded-sm px-4 py-2
                           text-foreground font-heading text-sm focus:outline-none focus:border-gold/50"
              />
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Escribe tus pensamientos..."
                rows={4}
                className="w-full bg-background/50 border border-border rounded-sm px-4 py-2
                           text-foreground font-body text-sm focus:outline-none focus:border-gold/50 resize-none"
              />
              <div className="flex gap-2">
                <RitualButton variant="gold" onClick={addNote} className="flex-1">
                  Guardar
                </RitualButton>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                layout
              >
                <ParchmentCard title={note.title} icon={<Scroll className="w-4 h-4" />}>
                  <div className="space-y-2">
                    <p className="font-body text-sm text-foreground/90 leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/20">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                        <Clock className="w-3 h-3" />
                        {note.createdAt}
                      </span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </ParchmentCard>
              </motion.div>
            ))}
          </div>
        </div>
      </BookPage>
    </AppLayout>
  );
}