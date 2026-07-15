import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookMarked, Plus, Trash2, Loader2 } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function NotasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, [user]);

  const loadNotes = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar las notas: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setNotes(data || []);
    }
    setIsLoading(false);
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !user) return;

    const { error } = await supabase.from("notes").insert({
      title: newNoteTitle,
      content: newNoteContent,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear la nota: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Nota creada",
        description: `${newNoteTitle} ha sido guardada.`,
      });
      setNewNoteTitle("");
      setNewNoteContent("");
      setShowForm(false);
      loadNotes();
    }
  };

  const updateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !newNoteTitle.trim()) return;

    const { error } = await supabase
      .from("notes")
      .update({
        title: newNoteTitle,
        content: newNoteContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingNote.id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Nota actualizada",
        description: `${newNoteTitle} ha sido modificada.`,
      });
      setNewNoteTitle("");
      setNewNoteContent("");
      setEditingNote(null);
      loadNotes();
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Nota eliminada",
        description: "La nota ha sido borrada.",
      });
      loadNotes();
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <AppLayout title="Notas" icon={<BookMarked className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Notas" icon={<BookMarked className="w-5 h-5" />}>
      <BookPage pageKey="notas">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Mis Notas</h1>
            <p className="font-body text-muted-foreground">
              Apuntes y reflexiones personales
            </p>
          </div>

          {/* Lista de notas */}
          {notes.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {notes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ParchmentCard>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 
                          className="font-heading text-sm text-foreground cursor-pointer hover:text-gold transition-colors"
                          onClick={() => startEdit(note)}
                        >
                          {note.title}
                        </h3>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {note.content && (
                        <p className="font-body text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                          {note.content}
                        </p>
                      )}
                      <p className="font-body text-xs text-muted-foreground/60">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </ParchmentCard>
                </motion.div>
              ))}
            </div>
          )}

          {notes.length === 0 && !showForm && !editingNote && (
            <p className="font-body text-muted-foreground text-center py-10">
              No tienes notas todavía.
            </p>
          )}

          {/* Formulario para nueva nota */}
          {!editingNote && (
            <ParchmentCard title="Nueva Nota" icon={<Plus className="w-4 h-4" />}>
              {!showForm ? (
                <RitualButton
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Nota
                </RitualButton>
              ) : (
                <form onSubmit={addNote} className="space-y-4">
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Título
                    </label>
                    <input
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      required
                      placeholder="Ej: Reflexión del ritual"
                      className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                 text-foreground font-body focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Contenido
                    </label>
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Escribe aquí..."
                      rows={6}
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

          {/* Formulario para editar nota */}
          {editingNote && (
            <ParchmentCard title="Editar Nota" icon={<BookMarked className="w-4 h-4" />}>
              <form onSubmit={updateNote} className="space-y-4">
                <div>
                  <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Título
                  </label>
                  <input
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    required
                    className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                               text-foreground font-body focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div>
                  <label className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Contenido
                  </label>
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={6}
                    className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                               text-foreground font-body focus:outline-none focus:border-gold/50 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <RitualButton type="submit" variant="gold" className="flex-1">
                    Actualizar
                  </RitualButton>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </ParchmentCard>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}