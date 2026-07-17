-- Verificar y recrear el foreign key para deity_id en faith_points_log
ALTER TABLE faith_points_log DROP CONSTRAINT IF EXISTS faith_points_log_deity_id_fkey;

ALTER TABLE faith_points_log
ADD CONSTRAINT faith_points_log_deity_id_fkey 
FOREIGN KEY (deity_id) REFERENCES profiles(id) ON DELETE SET NULL;