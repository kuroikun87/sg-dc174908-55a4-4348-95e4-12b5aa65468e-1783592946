-- Crear tabla de premios asignados
CREATE TABLE IF NOT EXISTS awarded_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id uuid NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  awarded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  awarded_at timestamp with time zone DEFAULT now(),
  notes text,
  is_redeemed boolean DEFAULT false,
  redeemed_at timestamp with time zone
);

-- Crear tabla de consecuencias asignadas
CREATE TABLE IF NOT EXISTS assigned_punishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  punishment_id uuid NOT NULL REFERENCES punishments(id) ON DELETE CASCADE,
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now(),
  notes text,
  is_removed boolean DEFAULT false,
  removed_at timestamp with time zone,
  removed_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_awarded_rewards_follower ON awarded_rewards(follower_id);
CREATE INDEX IF NOT EXISTS idx_assigned_punishments_follower ON assigned_punishments(follower_id);

-- RLS para awarded_rewards
ALTER TABLE awarded_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follower_read_own_rewards" ON awarded_rewards FOR SELECT
USING (auth.uid() = follower_id);

CREATE POLICY "deity_read_rewards" ON awarded_rewards FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'deity'
  )
);

CREATE POLICY "deity_award_rewards" ON awarded_rewards FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'deity'
  )
);

-- RLS para assigned_punishments
ALTER TABLE assigned_punishments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follower_read_own_punishments" ON assigned_punishments FOR SELECT
USING (auth.uid() = follower_id);

CREATE POLICY "deity_read_punishments" ON assigned_punishments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'deity'
  )
);

CREATE POLICY "deity_assign_punishments" ON assigned_punishments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'deity'
  )
);

CREATE POLICY "follower_remove_punishments" ON assigned_punishments FOR UPDATE
USING (auth.uid() = follower_id);