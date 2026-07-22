-- Eliminar políticas conflictivas
DROP POLICY IF EXISTS "create_own_events" ON calendar_events;
DROP POLICY IF EXISTS "calendar_events_insert" ON calendar_events;
DROP POLICY IF EXISTS "calendar_events_update" ON calendar_events;
DROP POLICY IF EXISTS "calendar_events_delete" ON calendar_events;
DROP POLICY IF EXISTS "calendar_events_select" ON calendar_events;

-- Política SELECT: Usuarios autenticados pueden ver eventos de su culto
CREATE POLICY "calendar_events_select" ON calendar_events
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.cult_id = (
          SELECT cult_id FROM profiles WHERE id = calendar_events.user_id
        )
    )
  );

-- Política INSERT: Fieles pueden crear eventos en su propio calendario, deidades en cualquier calendario de su culto
CREATE POLICY "calendar_events_insert" ON calendar_events
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      -- El fiel crea un evento en su propio calendario
      (auth.uid() = user_id)
      OR
      -- Una deidad crea un evento en el calendario de un fiel de su culto
      EXISTS (
        SELECT 1 FROM profiles AS creator
        WHERE creator.id = auth.uid()
          AND creator.role = 'deity'
          AND creator.cult_id = (
            SELECT cult_id FROM profiles WHERE id = calendar_events.user_id
          )
      )
    )
  );

-- Política UPDATE: Solo el creador puede actualizar sus eventos
CREATE POLICY "calendar_events_update" ON calendar_events
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Política DELETE: Solo el creador puede eliminar sus eventos
CREATE POLICY "calendar_events_delete" ON calendar_events
  FOR DELETE
  USING (auth.uid() = created_by);