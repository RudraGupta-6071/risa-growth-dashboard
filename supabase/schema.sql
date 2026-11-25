-- ─── CAMPAIGNS ────────────────────────────────────────────────────────────────
-- Pre-aggregated per-campaign funnel. Editable by the user via the app.
CREATE TABLE IF NOT EXISTS campaigns (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  channel_type     TEXT NOT NULL,          -- 'paid_social','organic','referral', etc.
  spend_inr        INTEGER NOT NULL,       -- current/editable spend in ₹
  spend_original   INTEGER NOT NULL,       -- locked 2025 original (for reset)
  impressions      INTEGER DEFAULT 0,
  clicks           INTEGER DEFAULT 0,
  reg_starts       INTEGER DEFAULT 0,
  registrations    INTEGER DEFAULT 0,
  confirmed        INTEGER DEFAULT 0,
  attendees        INTEGER NOT NULL,       -- unique verified admitted
  attendees_original INTEGER NOT NULL,    -- locked original
  cancel_count     INTEGER DEFAULT 0,
  noshow_count     INTEGER DEFAULT 0,
  cac_inr          INTEGER GENERATED ALWAYS AS (
                     CASE WHEN attendees > 0 THEN spend_inr / attendees ELSE 0 END
                   ) STORED,
  showup_rate      NUMERIC(5,2) GENERATED ALWAYS AS (
                     CASE WHEN confirmed > 0
                       THEN ROUND(attendees::NUMERIC / confirmed * 100, 2)
                     ELSE 0 END
                   ) STORED,
  status           TEXT DEFAULT 'active',  -- 'active','paused','stopped'
  recommendation   TEXT DEFAULT 'scale',   -- 'scale','change','stop' — overrideable
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TARGETS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS targets (
  id               SERIAL PRIMARY KEY,
  metric           TEXT UNIQUE NOT NULL,
  base_value       INTEGER NOT NULL,
  stretch_value    INTEGER NOT NULL,
  revised_goal     INTEGER NOT NULL,
  unit             TEXT DEFAULT 'people'
);

-- ─── DAILY METRICS ───────────────────────────────────────────────────────────
-- Lightweight daily rollup for the funnel trend chart.
CREATE TABLE IF NOT EXISTS daily_metrics (
  id               SERIAL PRIMARY KEY,
  metric_date      DATE NOT NULL,
  registrations    INTEGER DEFAULT 0,
  confirmed        INTEGER DEFAULT 0,
  admitted         INTEGER DEFAULT 0,
  spend_inr        INTEGER DEFAULT 0,
  UNIQUE(metric_date)
);

-- ─── TASKS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT,
  campaign_id      INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
  owner            TEXT,
  due_date         DATE,
  priority         TEXT DEFAULT 'medium',   -- 'high','medium','low'
  status           TEXT DEFAULT 'open',     -- 'open','in_progress','done'
  source           TEXT DEFAULT 'manual',   -- 'manual' or 'ai_suggested'
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CHAT LOGS (optional — keep last 50 per session) ──────────────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id               SERIAL PRIMARY KEY,
  session_id       TEXT NOT NULL,
  role             TEXT NOT NULL,           -- 'user' or 'assistant'
  content          TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ENABLE ROW LEVEL SECURITY (open read/write for demo — no login required)
ALTER TABLE campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_campaigns"     ON campaigns     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_targets"       ON targets       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_daily_metrics" ON daily_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tasks"         ON tasks         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_chat_logs"     ON chat_logs     FOR ALL USING (true) WITH CHECK (true);
