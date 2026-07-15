-- Agregar columna updated_at a notes si no existe
ALTER TABLE notes ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();