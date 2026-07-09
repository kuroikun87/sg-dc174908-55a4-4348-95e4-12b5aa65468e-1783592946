-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Cultos
CREATE TABLE IF NOT EXISTS cults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    main_deity_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Rangos
CREATE TABLE IF NOT EXISTS ranks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cult_id UUID REFERENCES cults(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Reglas/Leyes/Mandamientos/Oraciones
CREATE TABLE IF NOT EXISTS rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cult_id UUID REFERENCES cults(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('law', 'rule', 'commandment', 'prayer', 'other')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Premios
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cult_id UUID REFERENCES cults(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    faith_points_cost INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Consecuencias
CREATE TABLE IF NOT EXISTS consequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cult_id UUID REFERENCES cults(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    faith_points_remove INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cult_id UUID REFERENCES cults(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    faith_points_reward INTEGER NOT NULL DEFAULT 0,
    requires_evidence BOOLEAN DEFAULT FALSE,
    evidence_image_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Asignaciones (tareas/premios/consecuencias a fieles)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    assigner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('task', 'reward', 'consequence')),
    reference_id UUID,
    custom_name TEXT,
    custom_description TEXT,
    custom_faith_points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'claimed', 'removed')),
    completed_at TIMESTAMPTZ,
    evidence_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Fetiches/Prácticas
CREATE TABLE IF NOT EXISTS fetishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cult_id UUID REFERENCES cults(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Reacciones de Fieles a Fetiches
CREATE TABLE IF NOT EXISTS fetish_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fetish_id UUID REFERENCES fetishes(id) ON DELETE CASCADE NOT NULL,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reaction TEXT NOT NULL CHECK (reaction IN ('love', 'like', 'neutral', 'soft_limit', 'hard_limit')),
    is_starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fetish_id, follower_id)
);

-- Tabla de Eventos del Almanaque
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('free_time', 'busy', 'event', 'ritual', 'other')),
    event_date DATE NOT NULL,
    event_time TIME,
    notify_deity BOOLEAN DEFAULT FALSE,
    notify_follower BOOLEAN DEFAULT FALSE,
    is_editable_by_owner BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Notas
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    is_personal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Jerarquía (asignaciones de fieles a deidades/fieles mayores)
CREATE TABLE IF NOT EXISTS hierarchy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    superior_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    subordinate_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    cult_id UUID REFERENCES cults(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(superior_id, subordinate_id)
);

-- Tabla de Tarjetas de Sesión BDSM
CREATE TABLE IF NOT EXISTS session_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cult_id UUID REFERENCES cults(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('action', 'position', 'command', 'custom')),
    is_predefined BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Patrones de Beats
CREATE TABLE IF NOT EXISTS beat_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    pattern JSONB NOT NULL,
    bpm INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Mensajes de Audio de Sesión
CREATE TABLE IF NOT EXISTS session_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    audio_url TEXT NOT NULL,
    duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS

-- Cults
ALTER TABLE cults ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_cults" ON cults FOR SELECT USING (true);
CREATE POLICY "auth_insert_cults" ON cults FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "main_deity_update_cults" ON cults FOR UPDATE USING (auth.uid() = main_deity_id);

-- Ranks
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_ranks" ON ranks FOR SELECT USING (true);
CREATE POLICY "auth_insert_ranks" ON ranks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_ranks" ON ranks FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Rules
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_rules" ON rules FOR SELECT USING (true);
CREATE POLICY "auth_insert_rules" ON rules FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_rules" ON rules FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Rewards
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_rewards" ON rewards FOR SELECT USING (true);
CREATE POLICY "auth_insert_rewards" ON rewards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Consequences
ALTER TABLE consequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_consequences" ON consequences FOR SELECT USING (true);
CREATE POLICY "auth_insert_consequences" ON consequences FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "auth_insert_tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_assignments" ON assignments FOR SELECT USING (auth.uid() = assignee_id OR auth.uid() = assigner_id);
CREATE POLICY "insert_assignments" ON assignments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fetishes
ALTER TABLE fetishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_fetishes" ON fetishes FOR SELECT USING (true);
CREATE POLICY "auth_insert_fetishes" ON fetishes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fetish Reactions
ALTER TABLE fetish_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_reactions" ON fetish_reactions FOR SELECT USING (auth.uid() = follower_id);
CREATE POLICY "insert_own_reactions" ON fetish_reactions FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "update_own_reactions" ON fetish_reactions FOR UPDATE USING (auth.uid() = follower_id);

-- Calendar Events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_events" ON calendar_events FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = created_by);
CREATE POLICY "insert_events" ON calendar_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_notes" ON notes FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "insert_own_notes" ON notes FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "update_own_notes" ON notes FOR UPDATE USING (auth.uid() = owner_id);

-- Hierarchy
ALTER TABLE hierarchy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_hierarchy" ON hierarchy FOR SELECT USING (true);
CREATE POLICY "insert_hierarchy" ON hierarchy FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Session Cards
ALTER TABLE session_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_cards" ON session_cards FOR SELECT USING (true);
CREATE POLICY "auth_insert_cards" ON session_cards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Beat Patterns
ALTER TABLE beat_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_patterns" ON beat_patterns FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "insert_own_patterns" ON beat_patterns FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Session Messages
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_messages" ON session_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "insert_messages" ON session_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);