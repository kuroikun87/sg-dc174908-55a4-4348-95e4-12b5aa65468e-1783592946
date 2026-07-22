-- Crear tabla calendar_events si no existe
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  is_important boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "view_own_calendar_events" ON calendar_events;
DROP POLICY IF EXISTS "deity_view_follower_events" ON calendar_events;
DROP POLICY IF EXISTS "create_own_events" ON calendar_events;
DROP POLICY IF EXISTS "deity_create_events" ON calendar_events;
DROP POLICY IF EXISTS "update_own_created_events" ON calendar_events;
DROP POLICY IF EXISTS "delete_own_created_events" ON calendar_events;

-- Policy: Users can view all events in their calendar
CREATE POLICY "view_own_calendar_events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Deities can view events of followers in their cult
CREATE POLICY "deity_view_follower_events"
  ON calendar_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'deity'
        AND p.cult_id = (
          SELECT cult_id FROM profiles WHERE id = calendar_events.user_id
        )
    )
  );

-- Policy: Users can create events in their own calendar
CREATE POLICY "create_own_events"
  ON calendar_events FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND auth.uid() = created_by
  );

-- Policy: Deities can create events in follower calendars
CREATE POLICY "deity_create_events"
  ON calendar_events FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'deity'
        AND p.cult_id = (
          SELECT cult_id FROM profiles WHERE id = calendar_events.user_id
        )
    )
  );

-- Policy: Users can only update/delete their own created events
CREATE POLICY "update_own_created_events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "delete_own_created_events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_creator ON calendar_events(created_by);

-- Function to automatically set is_important for deity-created events
CREATE OR REPLACE FUNCTION set_deity_event_importance()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if creator is a deity
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = NEW.created_by AND role = 'deity'
  ) THEN
    NEW.is_important := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS ensure_deity_events_important ON calendar_events;

CREATE TRIGGER ensure_deity_events_important
  BEFORE INSERT OR UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION set_deity_event_importance();