-- Idempotent migration: Harden RLS policies and add CHECK constraints for RISA Growth Dashboard

-- 1. Drop legacy overly-permissive policies if present
DROP POLICY IF EXISTS "allow_all_campaigns"     ON campaigns;
DROP POLICY IF EXISTS "allow_all_targets"       ON targets;
DROP POLICY IF EXISTS "allow_all_daily_metrics" ON daily_metrics;
DROP POLICY IF EXISTS "allow_all_tasks"         ON tasks;
DROP POLICY IF EXISTS "allow_all_chat_logs"     ON chat_logs;

-- Drop new policies if re-running
DROP POLICY IF EXISTS "campaigns_select_public"     ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_public"     ON campaigns;
DROP POLICY IF EXISTS "targets_select_public"       ON targets;
DROP POLICY IF EXISTS "targets_update_public"       ON targets;
DROP POLICY IF EXISTS "daily_metrics_select_public" ON daily_metrics;
DROP POLICY IF EXISTS "tasks_select_public"         ON tasks;
DROP POLICY IF EXISTS "tasks_insert_public"         ON tasks;
DROP POLICY IF EXISTS "tasks_update_public"         ON tasks;
DROP POLICY IF EXISTS "tasks_delete_public"         ON tasks;
DROP POLICY IF EXISTS "chat_logs_select_public"     ON chat_logs;
DROP POLICY IF EXISTS "chat_logs_insert_public"     ON chat_logs;

-- 2. Ensure RLS is enabled on all tables
ALTER TABLE campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs     ENABLE ROW LEVEL SECURITY;

-- 3. Campaigns: public read & constrained update only (no public INSERT or DELETE)
CREATE POLICY "campaigns_select_public" ON campaigns
  FOR SELECT USING (true);
CREATE POLICY "campaigns_update_public" ON campaigns
  FOR UPDATE USING (true)
  WITH CHECK (
    spend_inr >= 0
    AND attendees >= 0
    AND status IN ('active', 'paused', 'stopped')
    AND recommendation IN ('scale', 'change', 'stop')
  );

-- 4. Targets: public read & constrained update only (no public INSERT or DELETE)
CREATE POLICY "targets_select_public" ON targets
  FOR SELECT USING (true);
CREATE POLICY "targets_update_public" ON targets
  FOR UPDATE USING (true)
  WITH CHECK (revised_goal > 0);

-- 5. Daily Metrics: strictly read-only for public clients to protect historical records
CREATE POLICY "daily_metrics_select_public" ON daily_metrics
  FOR SELECT USING (true);

-- 6. Tasks: full CRUD for task board operations with enum/title checks
CREATE POLICY "tasks_select_public" ON tasks
  FOR SELECT USING (true);
CREATE POLICY "tasks_insert_public" ON tasks
  FOR INSERT WITH CHECK (
    length(trim(title)) > 0
    AND priority IN ('high', 'medium', 'low')
    AND status IN ('open', 'in_progress', 'done')
    AND source IN ('manual', 'ai_suggested')
  );
CREATE POLICY "tasks_update_public" ON tasks
  FOR UPDATE USING (true)
  WITH CHECK (
    length(trim(title)) > 0
    AND priority IN ('high', 'medium', 'low')
    AND status IN ('open', 'in_progress', 'done')
  );
CREATE POLICY "tasks_delete_public" ON tasks
  FOR DELETE USING (true);

-- 7. Chat Logs: append-only (SELECT + INSERT), no public UPDATE or DELETE
CREATE POLICY "chat_logs_select_public" ON chat_logs
  FOR SELECT USING (true);
CREATE POLICY "chat_logs_insert_public" ON chat_logs
  FOR INSERT WITH CHECK (
    length(trim(session_id)) > 0
    AND role IN ('user', 'assistant')
  );
