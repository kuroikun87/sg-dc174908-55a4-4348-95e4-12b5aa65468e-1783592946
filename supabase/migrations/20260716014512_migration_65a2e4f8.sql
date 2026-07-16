-- Agregar timezone a profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS timezone text NULL DEFAULT 'UTC';

-- Agregar campos de recurrencia a tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS recurrence_type text NULL DEFAULT 'once',
ADD COLUMN IF NOT EXISTS recurrence_days integer[] NULL,
ADD COLUMN IF NOT EXISTS time_limit time NULL;

-- Constraint para recurrence_type
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_recurrence_type_check;

ALTER TABLE tasks
ADD CONSTRAINT tasks_recurrence_type_check 
CHECK (recurrence_type IN ('once', 'daily', 'weekly'));

-- Agregar campos a assigned_tasks para deadline, rewards y punishments
ALTER TABLE assigned_tasks
ADD COLUMN IF NOT EXISTS due_date timestamptz NULL,
ADD COLUMN IF NOT EXISTS reward_id uuid NULL,
ADD COLUMN IF NOT EXISTS reward_faith_points integer NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS punishment_id uuid NULL,
ADD COLUMN IF NOT EXISTS punishment_faith_points integer NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS deity_timezone text NULL DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS follower_timezone text NULL DEFAULT 'UTC';

-- Foreign keys para reward y punishment
ALTER TABLE assigned_tasks
DROP CONSTRAINT IF EXISTS assigned_tasks_reward_id_fkey;

ALTER TABLE assigned_tasks
ADD CONSTRAINT assigned_tasks_reward_id_fkey
FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE SET NULL;

ALTER TABLE assigned_tasks
DROP CONSTRAINT IF EXISTS assigned_tasks_punishment_id_fkey;

ALTER TABLE assigned_tasks
ADD CONSTRAINT assigned_tasks_punishment_id_fkey
FOREIGN KEY (punishment_id) REFERENCES punishments(id) ON DELETE SET NULL;