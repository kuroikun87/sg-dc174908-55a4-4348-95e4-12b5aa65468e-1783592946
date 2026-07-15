-- Agregar columnas faltantes a profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nickname text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS pronouns text,
ADD COLUMN IF NOT EXISTS birth_date date;