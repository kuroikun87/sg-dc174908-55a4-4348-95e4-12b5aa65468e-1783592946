-- Agregar ON DELETE CASCADE a foreign keys para permitir borrado en Supabase
ALTER TABLE cults DROP CONSTRAINT IF EXISTS cults_main_deity_id_fkey;
ALTER TABLE cults ADD CONSTRAINT cults_main_deity_id_fkey 
  FOREIGN KEY (main_deity_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE invitation_codes DROP CONSTRAINT IF EXISTS invitation_codes_creator_id_fkey;
ALTER TABLE invitation_codes ADD CONSTRAINT invitation_codes_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE;