-- ============================================
-- POLÍTICAS RLS PARA TODAS LAS TABLAS DEL GRIMORIO
-- ============================================

-- CULTS: autenticados pueden crear, todos ver, main_deity puede editar
CREATE POLICY "cults_insert" ON cults FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cults_select" ON cults FOR SELECT USING (true);
CREATE POLICY "cults_update" ON cults FOR UPDATE USING (auth.uid() = main_deity_id);

-- RANKS
CREATE POLICY "ranks_select" ON ranks FOR SELECT USING (true);
CREATE POLICY "ranks_insert" ON ranks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ranks_update" ON ranks FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "ranks_delete" ON ranks FOR DELETE USING (auth.uid() IS NOT NULL);

-- RULES
CREATE POLICY "rules_select" ON rules FOR SELECT USING (true);
CREATE POLICY "rules_insert" ON rules FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rules_update" ON rules FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "rules_delete" ON rules FOR DELETE USING (auth.uid() IS NOT NULL);

-- TASKS
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (true);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (auth.uid() IS NOT NULL);

-- REWARDS
CREATE POLICY "rewards_select" ON rewards FOR SELECT USING (true);
CREATE POLICY "rewards_insert" ON rewards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rewards_update" ON rewards FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "rewards_delete" ON rewards FOR DELETE USING (auth.uid() IS NOT NULL);

-- PUNISHMENTS
CREATE POLICY "punishments_select" ON punishments FOR SELECT USING (true);
CREATE POLICY "punishments_insert" ON punishments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "punishments_update" ON punishments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "punishments_delete" ON punishments FOR DELETE USING (auth.uid() IS NOT NULL);

-- ASSIGNED_TASKS
CREATE POLICY "assigned_tasks_select" ON assigned_tasks FOR SELECT USING (true);
CREATE POLICY "assigned_tasks_insert" ON assigned_tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "assigned_tasks_update" ON assigned_tasks FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "assigned_tasks_delete" ON assigned_tasks FOR DELETE USING (auth.uid() IS NOT NULL);

-- FETISHES
CREATE POLICY "fetishes_select" ON fetishes FOR SELECT USING (true);
CREATE POLICY "fetishes_insert" ON fetishes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "fetishes_update" ON fetishes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "fetishes_delete" ON fetishes FOR DELETE USING (auth.uid() IS NOT NULL);

-- FETISH_RATINGS
CREATE POLICY "fetish_ratings_select" ON fetish_ratings FOR SELECT USING (true);
CREATE POLICY "fetish_ratings_insert" ON fetish_ratings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "fetish_ratings_update" ON fetish_ratings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "fetish_ratings_delete" ON fetish_ratings FOR DELETE USING (auth.uid() IS NOT NULL);

-- HIERARCHY
CREATE POLICY "hierarchy_select" ON hierarchy FOR SELECT USING (true);
CREATE POLICY "hierarchy_insert" ON hierarchy FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "hierarchy_delete" ON hierarchy FOR DELETE USING (auth.uid() IS NOT NULL);

-- INVITATION_CODES
CREATE POLICY "invitation_codes_select" ON invitation_codes FOR SELECT USING (true);
CREATE POLICY "invitation_codes_insert" ON invitation_codes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "invitation_codes_update" ON invitation_codes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "invitation_codes_delete" ON invitation_codes FOR DELETE USING (auth.uid() IS NOT NULL);

-- CALENDAR_EVENTS
CREATE POLICY "calendar_events_select" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "calendar_events_insert" ON calendar_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "calendar_events_update" ON calendar_events FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "calendar_events_delete" ON calendar_events FOR DELETE USING (auth.uid() IS NOT NULL);

-- NOTES
CREATE POLICY "notes_select" ON notes FOR SELECT USING (true);
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "notes_update" ON notes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "notes_delete" ON notes FOR DELETE USING (auth.uid() IS NOT NULL);

-- SESSION_CARDS
CREATE POLICY "session_cards_select" ON session_cards FOR SELECT USING (true);
CREATE POLICY "session_cards_insert" ON session_cards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "session_cards_update" ON session_cards FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "session_cards_delete" ON session_cards FOR DELETE USING (auth.uid() IS NOT NULL);

-- BEAT_PATTERNS
CREATE POLICY "beat_patterns_select" ON beat_patterns FOR SELECT USING (true);
CREATE POLICY "beat_patterns_insert" ON beat_patterns FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "beat_patterns_update" ON beat_patterns FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "beat_patterns_delete" ON beat_patterns FOR DELETE USING (auth.uid() IS NOT NULL);