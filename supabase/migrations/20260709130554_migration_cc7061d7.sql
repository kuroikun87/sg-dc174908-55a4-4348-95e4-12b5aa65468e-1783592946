-- Crear tabla cults
CREATE TABLE IF NOT EXISTS cults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  main_deity_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla invitation_codes
CREATE TABLE IF NOT EXISTS invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  code_type TEXT NOT NULL CHECK (code_type IN ('deity', 'follower')),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  cult_id UUID REFERENCES cults(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  used_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla hierarchy
CREATE TABLE IF NOT EXISTS hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deity_id UUID REFERENCES auth.users(id) NOT NULL,
  follower_id UUID REFERENCES auth.users(id) NOT NULL,
  cult_id UUID REFERENCES cults(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla ranks
CREATE TABLE IF NOT EXISTS ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  cult_id UUID REFERENCES cults(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla rules
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cult_id UUID REFERENCES cults(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('rule', 'law', 'commandment', 'prayer', 'ritual')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar rango "Fiel" por defecto
INSERT INTO ranks (name, level, cult_id)
SELECT 'Fiel', 0, c.id
FROM cults c
WHERE NOT EXISTS (
  SELECT 1 FROM ranks WHERE cult_id = c.id AND level = 0
);