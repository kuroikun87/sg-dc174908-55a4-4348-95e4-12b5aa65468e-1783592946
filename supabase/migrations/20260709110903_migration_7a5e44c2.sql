-- Agregar campos necesarios a profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('main_deity', 'deity', 'follower')),
ADD COLUMN IF NOT EXISTS cult_id UUID REFERENCES cults(id),
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS invitation_code_used TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS rank_id UUID REFERENCES ranks(id),
ADD COLUMN IF NOT EXISTS faith_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Agregar códigos de invitación a cults
ALTER TABLE cults 
ADD COLUMN IF NOT EXISTS deity_invite_code TEXT,
ADD COLUMN IF NOT EXISTS follower_invite_code TEXT;

-- Crear tabla de códigos de invitación
CREATE TABLE IF NOT EXISTS invitation_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  cult_id UUID REFERENCES cults(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deity', 'follower')),
  used_count INTEGER DEFAULT 0,
  max_uses INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Políticas RLS para invitation_codes
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_codes" ON invitation_codes FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "insert_codes" ON invitation_codes FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "update_own_codes" ON invitation_codes FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "delete_own_codes" ON invitation_codes FOR DELETE USING (auth.uid() = creator_id);

-- Actualizar política de profiles para jerarquía
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_profiles_in_cult" ON profiles FOR SELECT USING (
  auth.uid() = id OR 
  cult_id IN (SELECT cult_id FROM profiles WHERE id = auth.uid() AND cult_id IS NOT NULL)
);