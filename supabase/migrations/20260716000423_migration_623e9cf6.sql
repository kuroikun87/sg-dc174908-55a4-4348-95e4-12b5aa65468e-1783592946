ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS title_locked_until timestamptz NULL,
ADD COLUMN IF NOT EXISTS title_locked_by uuid NULL;