-- Agregar campo para sincronización de beats manuales
ALTER TABLE active_sessions
ADD COLUMN IF NOT EXISTS manual_beat_trigger timestamp with time zone;