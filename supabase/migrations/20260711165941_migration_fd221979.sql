-- ARREGLAR RLS de invitation_codes: permitir lectura pública de códigos activos
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own" ON invitation_codes;
DROP POLICY IF EXISTS "insert_own" ON invitation_codes;
DROP POLICY IF EXISTS "update_own" ON invitation_codes;
DROP POLICY IF EXISTS "delete_own" ON invitation_codes;

-- Cualquiera puede leer códigos activos (necesario para unirse)
CREATE POLICY "select_active_codes" ON invitation_codes
  FOR SELECT USING (is_active = true);

-- Solo el creador puede crear/actualizar/borrar sus propios códigos
CREATE POLICY "insert_own" ON invitation_codes
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "update_own" ON invitation_codes
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "delete_own" ON invitation_codes
  FOR DELETE USING (auth.uid() = creator_id);