-- Crear tabla de log de Puntos de Fe con historial automático
CREATE TABLE IF NOT EXISTS faith_points_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deity_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  reason text NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('grant', 'revoke', 'task_reward', 'purchase', 'consequence')),
  related_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_faith_points_log_user_id ON faith_points_log(user_id);
CREATE INDEX IF NOT EXISTS idx_faith_points_log_deity_id ON faith_points_log(deity_id);
CREATE INDEX IF NOT EXISTS idx_faith_points_log_created_at ON faith_points_log(created_at DESC);

-- RLS policies
ALTER TABLE faith_points_log ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio historial
CREATE POLICY "view_own_log" ON faith_points_log
  FOR SELECT USING (auth.uid() = user_id);

-- Las deidades pueden ver el historial de sus subordinados
CREATE POLICY "view_subordinates_log" ON faith_points_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'deity'
      AND p.cult_id = (SELECT cult_id FROM profiles WHERE id = faith_points_log.user_id)
    )
  );

-- Solo deidades pueden insertar transacciones
CREATE POLICY "deity_insert" ON faith_points_log
  FOR INSERT WITH CHECK (
    auth.uid() = deity_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'deity'
    )
  );