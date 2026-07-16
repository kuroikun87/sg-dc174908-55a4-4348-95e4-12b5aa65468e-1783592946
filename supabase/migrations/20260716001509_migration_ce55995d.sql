CREATE TABLE IF NOT EXISTS favor_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deity_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 50 CHECK (points >= 0 AND points <= 100),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(deity_id, follower_id)
);

CREATE INDEX IF NOT EXISTS idx_favor_points_deity ON favor_points(deity_id);
CREATE INDEX IF NOT EXISTS idx_favor_points_follower ON favor_points(follower_id);

-- RLS policies
ALTER TABLE favor_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deities can view favor for their cult members"
  ON favor_points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = favor_points.deity_id
      AND profiles.role = 'deity'
    )
  );

CREATE POLICY "Deities can update their own favor ratings"
  ON favor_points FOR UPDATE
  USING (deity_id = auth.uid());

CREATE POLICY "Deities can insert their own favor ratings"
  ON favor_points FOR INSERT
  WITH CHECK (deity_id = auth.uid());

CREATE POLICY "Followers can view favor ratings about them"
  ON favor_points FOR SELECT
  USING (follower_id = auth.uid());