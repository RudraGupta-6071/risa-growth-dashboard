-- ─── CAMPAIGNS ────────────────────────────────────────────────────────────────
-- Pre-aggregated per-campaign funnel. Editable by the user via the app.
CREATE TABLE IF NOT EXISTS campaigns (
  id                 SERIAL PRIMARY KEY,
  name               TEXT NOT NULL,
  channel_type       TEXT NOT NULL,          -- 'paid_social','organic','referral', etc.
  spend_inr          INTEGER NOT NULL CHECK (spend_inr >= 0),
  spend_original     INTEGER NOT NULL CHECK (spend_original >= 0),
  impressions        INTEGER DEFAULT 0 CHECK (impressions >= 0),
  clicks             INTEGER DEFAULT 0 CHECK (clicks >= 0),
  reg_starts         INTEGER DEFAULT 0 CHECK (reg_starts >= 0),
  registrations      INTEGER DEFAULT 0 CHECK (registrations >= 0),
  confirmed          INTEGER DEFAULT 0 CHECK (confirmed >= 0),
  attendees          INTEGER NOT NULL CHECK (attendees >= 0),
  attendees_original INTEGER NOT NULL CHECK (attendees_original >= 0),
  cancel_count       INTEGER DEFAULT 0 CHECK (cancel_count >= 0),
  noshow_count       INTEGER DEFAULT 0 CHECK (noshow_count >= 0),
  cac_inr            INTEGER GENERATED ALWAYS AS (
                       CASE WHEN attendees > 0 THEN spend_inr / attendees ELSE 0 END
                     ) STORED,
  showup_rate        NUMERIC(5,2) GENERATED ALWAYS AS (
                       CASE WHEN confirmed > 0
                         THEN ROUND(attendees::NUMERIC / confirmed * 100, 2)
                       ELSE 0 END
                     ) STORED,
  status             TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  recommendation     TEXT DEFAULT 'scale'  CHECK (recommendation IN ('scale', 'change', 'stop')),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TARGETS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS targets (
  id               SERIAL PRIMARY KEY,
  metric           TEXT UNIQUE NOT NULL,
  base_value       INTEGER NOT NULL CHECK (base_value >= 0),
  stretch_value    INTEGER NOT NULL CHECK (stretch_value >= 0),
  revised_goal     INTEGER NOT NULL CHECK (revised_goal > 0),
  unit             TEXT DEFAULT 'people'
);

-- ─── DAILY METRICS ───────────────────────────────────────────────────────────
-- Immutable historical daily rollup for the funnel trend chart.
CREATE TABLE IF NOT EXISTS daily_metrics (
  id               SERIAL PRIMARY KEY,
  metric_date      DATE NOT NULL,
  registrations    INTEGER DEFAULT 0 CHECK (registrations >= 0),
  confirmed        INTEGER DEFAULT 0 CHECK (confirmed >= 0),
  admitted         INTEGER DEFAULT 0 CHECK (admitted >= 0),
  spend_inr        INTEGER DEFAULT 0 CHECK (spend_inr >= 0),
  UNIQUE(metric_date)
);

-- ─── TASKS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description      TEXT,
  campaign_id      INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
  owner            TEXT,
  due_date         DATE,
  priority         TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status           TEXT DEFAULT 'open'   CHECK (status IN ('open', 'in_progress', 'done')),
  source           TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai_suggested')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CHAT LOGS (optional — keep last 50 per session) ─────────────────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id               SERIAL PRIMARY KEY,
  session_id       TEXT NOT NULL CHECK (length(trim(session_id)) > 0),
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LEAST-PRIVILEGE ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs     ENABLE ROW LEVEL SECURITY;

-- Drop legacy permissive policies if re-running migration
DROP POLICY IF EXISTS "allow_all_campaigns"     ON campaigns;
DROP POLICY IF EXISTS "allow_all_targets"       ON targets;
DROP POLICY IF EXISTS "allow_all_daily_metrics" ON daily_metrics;
DROP POLICY IF EXISTS "allow_all_tasks"         ON tasks;
DROP POLICY IF EXISTS "allow_all_chat_logs"     ON chat_logs;

-- Campaigns: public read & constrained update only (no public INSERT or DELETE)
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

-- Targets: public read & constrained update only (no public INSERT or DELETE)
CREATE POLICY "targets_select_public" ON targets
  FOR SELECT USING (true);
CREATE POLICY "targets_update_public" ON targets
  FOR UPDATE USING (true)
  WITH CHECK (revised_goal > 0);

-- Daily Metrics: strictly read-only for public clients to protect historical records
CREATE POLICY "daily_metrics_select_public" ON daily_metrics
  FOR SELECT USING (true);

-- Tasks: full CRUD for task board operations with enum checks
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

-- Chat Logs: append-only (SELECT + INSERT), no public UPDATE or DELETE
CREATE POLICY "chat_logs_select_public" ON chat_logs
  FOR SELECT USING (true);
CREATE POLICY "chat_logs_insert_public" ON chat_logs
  FOR INSERT WITH CHECK (
    length(trim(session_id)) > 0
    AND role IN ('user', 'assistant')
  );
