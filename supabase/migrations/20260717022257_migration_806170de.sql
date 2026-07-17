-- Agregar foreign key constraint para deity_id en faith_points_log si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'faith_points_log_deity_id_fkey'
  ) THEN
    ALTER TABLE faith_points_log
    ADD CONSTRAINT faith_points_log_deity_id_fkey 
    FOREIGN KEY (deity_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;