ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS recurrence_type text CHECK (recurrence_type IN ('once', 'daily', 'weekly', 'monthly')) DEFAULT 'once';