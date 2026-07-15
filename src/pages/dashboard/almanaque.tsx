import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, X, Sun, Moon, Star, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { BookPage } from "@/components/layout/BookPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { ParchmentCard } from "@/components/ui/parchment-card";
import { RitualButton } from "@/components/ui/ritual-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  event_type: "free" | "busy" | "event" | "ritual" | "note";
  event_date: string; // ISO date string
  event_time: string | null;
  created_by: string;
  user_id: string;
}

const eventTypes = [
  { key: "free", label: "Tiempo libre", icon: <Sun className="w-4 h-4" />, color: "bg-green-500/20 text-green-400" },
  { key: "busy", label: "Ocupado", icon: <Moon className="w-4 h-4" />, color: "bg-wine/20 text-wine" },
  { key: "event", label: "Evento", icon: <Star className="w-4 h-4" />, color: "bg-gold/20 text-gold" },
  { key: "ritual", label: "Ritual", icon: <AlertCircle className="w-4 h-4" />, color: "bg-purple-500/20 text-purple-400" },
  { key: "note", label: "Nota", icon: <Clock className="w-4 h-4" />, color: "bg-blue-500/20 text-blue-400" },
] as const;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function AlmanaquePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState<CalendarEvent["event_type"]>("event");
  const [newEventTime, setNewEventTime] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  useEffect(() => {
    loadEvents();
  }, [user, currentDate]);

  const loadEvents = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Cargar eventos del mes actual usando rangos de timestamp
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("event_date", startDate.toISOString())
      .lte("event_date", endDate.toISOString());

    if (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar los eventos: ${error.message}`,
        variant: "destructive",
      });
    } else {
      setEvents(data || []);
    }
    setIsLoading(false);
  };

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day: number) => {
    return events.filter(e => {
      const eventDate = new Date(e.event_date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === month && 
             eventDate.getFullYear() === year;
    });
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !newEventTitle || !user) return;

    setIsSaving(true);
    
    // Crear timestamp completo con la fecha y hora seleccionadas en la zona horaria LOCAL del usuario
    const eventDateTime = new Date(
      selectedDate.getFullYear(), 
      selectedDate.getMonth(), 
      selectedDate.getDate()
    );
    
    if (newEventTime) {
      const [hours, minutes] = newEventTime.split(":").map(Number);
      eventDateTime.setHours(hours, minutes, 0, 0);
    } else {
      eventDateTime.setHours(0, 0, 0, 0);
    }

    // Guardar como ISO string completo (UTC) - Postgres almacena con timezone
    const { error } = await supabase.from("calendar_events").insert({
      title: newEventTitle,
      event_type: newEventType,
      event_date: eventDateTime.toISOString(), // Timestamp completo en UTC
      event_time: newEventTime || null, // Mantener por compatibilidad
      user_id: user.id,
      created_by: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo crear el evento: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Evento creado",
        description: `${newEventTitle} ha sido inscrito en el almanaque.`,
      });
      setNewEventTitle("");
      setNewEventTime("");
      setShowEventForm(false);
      loadEvents();
    }
    setIsSaving(false);
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Evento eliminado",
        description: "El evento ha sido borrado del almanaque.",
      });
      loadEvents();
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Almanaque" icon={<Calendar className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Almanaque" icon={<Calendar className="w-5 h-5" />}>
      <BookPage pageKey="almanaque">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-foreground">Almanaque Infinito</h1>
            <p className="font-body text-muted-foreground">
              Marca eventos, rituales y momentos importantes
            </p>
          </div>

          {/* Calendario */}
          <ParchmentCard title={`${monthNames[month]} ${year}`} icon={<Calendar className="w-4 h-4" />}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPrevMonth}
                className="p-2 text-muted-foreground hover:text-gold transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-display text-lg text-foreground">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={goToNextMonth}
                className="p-2 text-muted-foreground hover:text-gold transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
                <div key={day} className="text-center font-heading text-xs text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate?.getDate() === day &&
                  selectedDate?.getMonth() === month &&
                  selectedDate?.getFullYear() === year;

                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`aspect-square rounded-sm border relative flex flex-col items-center justify-start pt-1 transition-all ${
                      isSelected
                        ? "bg-gold/20 border-gold/50"
                        : "bg-card/30 border-border/30 hover:border-gold/30"
                    }`}
                  >
                    <span className={`font-heading text-sm ${isSelected ? "text-gold" : "text-foreground"}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              e.event_type === "ritual" ? "bg-purple-400" :
                              e.event_type === "event" ? "bg-gold" :
                              e.event_type === "free" ? "bg-green-400" :
                              e.event_type === "busy" ? "bg-wine" : "bg-blue-400"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </ParchmentCard>

          {/* Eventos del día seleccionado */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ParchmentCard
                title={`Eventos del ${selectedDate.getDate()}`}
                icon={<Clock className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  {getEventsForDate(selectedDate.getDate()).length === 0 ? (
                    <p className="font-body text-sm text-muted-foreground text-center py-4">
                      No hay eventos para este día
                    </p>
                  ) : (
                    getEventsForDate(selectedDate.getDate()).map(event => {
                      const typeInfo = eventTypes.find(t => t.key === event.event_type);
                      const eventDate = new Date(event.event_date);
                      const timeStr = event.event_time 
                        ? eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : null;

                      return (
                        <div
                          key={event.id}
                          className="flex items-start justify-between p-3 bg-background/50 rounded-sm border border-border/30"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={typeInfo?.color}>{typeInfo?.icon}</span>
                              <span className="font-heading text-sm text-foreground">{event.title}</span>
                            </div>
                            {timeStr && (
                              <span className="font-body text-xs text-muted-foreground">{timeStr}</span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="p-1 text-muted-foreground/30 hover:text-wine transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}

                  {!showEventForm ? (
                    <RitualButton
                      variant="outline"
                      onClick={() => setShowEventForm(true)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Evento
                    </RitualButton>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      onSubmit={addEvent}
                      className="space-y-3 pt-2"
                    >
                      <input
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Título del evento..."
                        required
                        className="w-full bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body text-sm focus:outline-none focus:border-gold/50"
                      />
                      <div className="flex gap-2 flex-wrap">
                        {eventTypes.map(type => (
                          <button
                            key={type.key}
                            type="button"
                            onClick={() => setNewEventType(type.key)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-heading border transition-all ${
                              newEventType === type.key
                                ? `${type.color} border-current`
                                : "bg-background/50 border-border/40 text-muted-foreground"
                            }`}
                          >
                            {type.icon}
                            {type.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="time"
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                        className="bg-background/50 border border-border rounded-sm px-3 py-2
                                   text-foreground font-body text-sm focus:outline-none focus:border-gold/50"
                      />
                      <div className="flex gap-2">
                        <RitualButton 
                          type="submit" 
                          variant="gold" 
                          className="flex-1"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            "Guardar"
                          )}
                        </RitualButton>
                        <button
                          type="button"
                          onClick={() => setShowEventForm(false)}
                          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </motion.form>
                  )}
                </div>
              </ParchmentCard>
            </motion.div>
          )}
        </div>
      </BookPage>
    </AppLayout>
  );
}