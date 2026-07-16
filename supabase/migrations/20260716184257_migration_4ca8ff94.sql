CREATE TABLE IF NOT EXISTS cult_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cult_id uuid REFERENCES cults(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(cult_id, name)
);

CREATE TABLE IF NOT EXISTS follower_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title_id uuid REFERENCES cult_titles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, title_id)
);

ALTER TABLE cult_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cult titles are public" ON cult_titles FOR SELECT USING (true);
CREATE POLICY "Cult titles insert" ON cult_titles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Cult titles update" ON cult_titles FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Cult titles delete" ON cult_titles FOR DELETE USING (auth.uid() IS NOT NULL);

ALTER TABLE follower_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follower titles are public" ON follower_titles FOR SELECT USING (true);
CREATE POLICY "Follower titles insert" ON follower_titles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Follower titles update" ON follower_titles FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Follower titles delete" ON follower_titles FOR DELETE USING (auth.uid() IS NOT NULL);