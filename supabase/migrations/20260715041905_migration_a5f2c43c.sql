-- Crear solo las tablas faltantes: session_audios y active_sessions

-- Tabla de audios grabados
CREATE TABLE IF NOT EXISTS session_audios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cult_id uuid REFERENCES cults(id) ON DELETE CASCADE NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  audio_url text NOT NULL,
  duration_seconds integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de sesiones activas
CREATE TABLE IF NOT EXISTS active_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cult_id uuid REFERENCES cults(id) ON DELETE CASCADE NOT NULL,
  deity_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  follower_ids uuid[] NOT NULL,
  is_active boolean DEFAULT true,
  current_rpm integer DEFAULT 60,
  is_playing boolean DEFAULT false,
  is_muted_for_deity boolean DEFAULT false,
  current_card_id uuid,
  card_duration_seconds integer,
  card_show_timer boolean DEFAULT true,
  card_started_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_session_audios_cult ON session_audios(cult_id);
CREATE INDEX IF NOT EXISTS idx_session_audios_creator ON session_audios(creator_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_deity ON active_sessions(deity_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_active ON active_sessions(is_active);

-- RLS para session_audios
ALTER TABLE session_audios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deity_view_own_cult_audios" ON session_audios FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.cult_id = session_audios.cult_id
    AND profiles.role = 'deity'
  )
);

CREATE POLICY "deity_create_audios" ON session_audios FOR INSERT
WITH CHECK (
  auth.uid() = creator_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'deity'
  )
);

CREATE POLICY "deity_delete_own_audios" ON session_audios FOR DELETE
USING (auth.uid() = creator_id);

-- RLS para active_sessions
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deity_manage_own_sessions" ON active_sessions FOR ALL
USING (auth.uid() = deity_id);

CREATE POLICY "follower_view_sessions_they_are_in" ON active_sessions FOR SELECT
USING (
  auth.uid() = ANY(follower_ids)
  OR auth.uid() = deity_id
);