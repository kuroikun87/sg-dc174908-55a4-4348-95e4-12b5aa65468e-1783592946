-- Eliminar políticas existentes de awarded_rewards
DROP POLICY IF EXISTS "deity_award_rewards" ON awarded_rewards;
DROP POLICY IF EXISTS "deity_read_rewards" ON awarded_rewards;
DROP POLICY IF EXISTS "follower_read_own_rewards" ON awarded_rewards;

-- Crear nuevas políticas más permisivas

-- SELECT: Ver tus propios premios o todos si eres deidad del mismo culto
CREATE POLICY "Awarded rewards select" ON awarded_rewards
FOR SELECT USING (
  auth.uid() = follower_id 
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'deity'
    AND profiles.cult_id = (SELECT cult_id FROM profiles WHERE id = awarded_rewards.follower_id)
  )
);

-- INSERT: Los fieles pueden auto-asignarse premios al comprar, las deidades pueden otorgar
CREATE POLICY "Awarded rewards insert" ON awarded_rewards
FOR INSERT WITH CHECK (
  -- El fiel puede insertar premios para sí mismo (compra)
  auth.uid() = follower_id
  OR
  -- O si eres deidad del mismo culto (otorgar)
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'deity'
    AND profiles.cult_id = (SELECT cult_id FROM profiles WHERE id = awarded_rewards.follower_id)
  )
);

-- UPDATE: Actualizar tus propios premios (marcar como usado) o si eres deidad
CREATE POLICY "Awarded rewards update" ON awarded_rewards
FOR UPDATE USING (
  auth.uid() = follower_id
  OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'deity'
    AND profiles.cult_id = (SELECT cult_id FROM profiles WHERE id = awarded_rewards.follower_id)
  )
);

-- DELETE: Solo deidades del mismo culto
CREATE POLICY "Awarded rewards delete" ON awarded_rewards
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'deity'
    AND profiles.cult_id = (SELECT cult_id FROM profiles WHERE id = awarded_rewards.follower_id)
  )
);