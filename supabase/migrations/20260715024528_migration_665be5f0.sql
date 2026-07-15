-- Agregar rank_id a profiles para relacionar usuarios con rangos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rank_id uuid REFERENCES ranks(id) ON DELETE SET NULL;

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_rank_id ON profiles(rank_id);

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('id', 'cult_id', 'role', 'rank_id')
ORDER BY ordinal_position;