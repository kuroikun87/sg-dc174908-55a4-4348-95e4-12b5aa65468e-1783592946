-- Actualizar estructura de calendar_events para los nuevos campos
ALTER TABLE calendar_events 
  DROP COLUMN IF EXISTS event_type,
  DROP COLUMN IF EXISTS event_time,
  ALTER COLUMN event_date TYPE date USING event_date::date,
  ADD COLUMN IF NOT EXISTS start_time time without time zone,
  ADD COLUMN IF NOT EXISTS end_time time without time zone,
  ADD COLUMN IF NOT EXISTS is_important boolean DEFAULT false;

-- Recrear función y trigger para marcar eventos de deidades como importantes
CREATE OR REPLACE FUNCTION set_deity_event_importance()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el creador es una deidad, marcar como importante automáticamente
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = NEW.created_by 
    AND role = 'deity'
  ) THEN
    NEW.is_important := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS deity_event_importance_trigger ON calendar_events;
CREATE TRIGGER deity_event_importance_trigger
  BEFORE INSERT OR UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION set_deity_event_importance();