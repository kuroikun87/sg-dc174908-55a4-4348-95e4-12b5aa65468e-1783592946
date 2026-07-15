-- Agregar columna faith_points a profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS faith_points integer DEFAULT 0 NOT NULL;

-- Crear índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_faith_points ON profiles(faith_points);