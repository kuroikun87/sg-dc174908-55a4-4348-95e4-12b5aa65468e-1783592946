-- Agregar columnas faltantes a rewards
ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS favor_points_required integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_exclusive boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS exclusive_to uuid REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Agregar columnas faltantes a punishments (consecuencias)
ALTER TABLE punishments
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_rewards_cult ON rewards(cult_id);
CREATE INDEX IF NOT EXISTS idx_punishments_cult ON punishments(cult_id);