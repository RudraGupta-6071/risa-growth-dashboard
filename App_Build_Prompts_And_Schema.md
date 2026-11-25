# RISA Growth APM — App Build Guide
**Rudra Gupta · Challenge A: Attendee Growth · Bangalore**

> Free-tier stack: **Supabase** (DB + Auth) · **Lovable** (React frontend) · **Google AI Studio / Gemini 1.5 Flash** (chatbot)

---

## 0. Order of Operations

```
Step A → Run Supabase SQL schema (5 min)
Step B → Seed data into Supabase (run seed SQL below)
Step C → Paste Lovable Prompt 1 (the whole app skeleton)
Step D → Paste Lovable Prompt 2 (chatbot panel)
Step E → Paste Lovable Prompt 3 (reset + live-recompute)
Step F → Paste Lovable Prompt 4 (polish + deploy check)
```

---

## STEP A — Supabase Schema

> Go to **Supabase → SQL Editor → New Query** and run this entire block.

```sql
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
ALTER TABLE campaigns    ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_campaigns"     ON campaigns     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_targets"       ON targets       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_daily_metrics" ON daily_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tasks"         ON tasks         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_chat_logs"     ON chat_logs     FOR ALL USING (true) WITH CHECK (true);
```

---

## STEP B — Seed Data

> Same SQL Editor, new query. Run after the schema.

```sql
-- ─── CAMPAIGNS (cleaned 2025 actuals) ─────────────────────────────────────
INSERT INTO campaigns
  (name, channel_type, spend_inr, spend_original, impressions, clicks,
   reg_starts, registrations, confirmed, attendees, attendees_original,
   cancel_count, noshow_count, status, recommendation)
VALUES
  ('Paid Social',          'paid_social',  93000, 93000, 42000, 3200, 1100, 680, 580, 340, 340, 71, 240, 'active', 'stop'),
  ('Campus Ambassadors',   'ambassador',   42000, 42000,  8000, 2900,  620, 475, 474, 390, 390, 12,  84, 'active', 'scale'),
  ('Creator Partners',     'influencer',   59000, 59000, 32000, 2100,  420, 290, 290, 175, 175, 30, 115, 'active', 'stop'),
  ('College Partnerships', 'partnership',  31000, 31000,  5500, 2600,  510, 420, 420, 385, 385,  9,  35, 'active', 'scale'),
  ('Student Referrals',    'referral',     19000, 19000,  2200, 1800,  420, 320, 320, 275, 275, 11,  45, 'active', 'scale'),
  ('Organic Search',       'organic',      14000, 14000, 18000, 1600,  310, 235, 235, 195, 195,  8,  40, 'active', 'scale'),
  ('Community Groups',     'community',    16000, 16000,  3200, 1100,  250, 206, 206, 165, 165, 10,  41, 'active', 'change'),
  ('Walk-ins',             'walk_in',          0,     0,      0,    0,    0,   0,   0, 125, 125,  0,   0, 'active', 'scale');

-- ─── TARGETS ─────────────────────────────────────────────────────────────────
INSERT INTO targets (metric, base_value, stretch_value, revised_goal, unit) VALUES
  ('identified_people', 2050, 2500, 2200, 'people'),
  ('registrations',     2800, 3067, 3200, 'registrations'),
  ('confirmed',         2500, 2740, 2800, 'confirmed'),
  ('attendees',         2050, 2500, 2200, 'people'),
  ('budget_inr',      274000, 300000, 300000, 'INR');

-- ─── DAILY METRICS (representative sample — 30 days pre-event) ───────────
-- Cumulative registrations building up to event day (20 Apr 2025)
INSERT INTO daily_metrics (metric_date, registrations, confirmed, admitted, spend_inr) VALUES
  ('2025-01-15',  120,  95,   0,  18000),
  ('2025-02-01',  380, 310,   0,  52000),
  ('2025-02-15',  620, 510,   0,  88000),
  ('2025-03-01',  980, 820,   0, 130000),
  ('2025-03-15', 1380,1160,   0, 175000),
  ('2025-04-01', 1920,1620,   0, 230000),
  ('2025-04-07', 2200,1850,   0, 252000),
  ('2025-04-14', 2600,2200,   0, 268000),
  ('2025-04-17', 2720,2380,   0, 272000),
  ('2025-04-19', 2800,2500,   0, 274000),
  ('2025-04-20', 2800,2500,2050, 274000);

-- ─── SAMPLE TASKS ─────────────────────────────────────────────────────────
INSERT INTO tasks (title, description, campaign_id, owner, due_date, priority, status, source) VALUES
  ('Cut Paid Social budget by 30%',
   'CAC ₹274 — highest of all channels. Reallocate ₹28K to Campus Ambassadors and College Partnerships.',
   1, 'Growth Lead', '2025-03-01', 'high', 'open', 'ai_suggested'),
  ('Launch show-up reminder sequence',
   'WhatsApp/SMS at T-7, T-3, T-1 days with one-tap "Still Coming" link. Expected +146 attendees.',
   NULL, 'Growth Lead', '2025-04-13', 'high', 'open', 'ai_suggested'),
  ('Pilot 10 Bangalore college clubs',
   'Target clubs with >200 members. Offer group registration link and campus coordinator role.',
   4, 'Partnerships Manager', '2025-02-15', 'high', 'open', 'manual'),
  ('Outreach to 88 waitlisted people',
   'Time-limited spot offer email/WhatsApp. Target 25% recovery (+22 attendees).',
   NULL, 'CRM Manager', '2025-04-01', 'medium', 'open', 'manual'),
  ('Set up gate registration desk',
   'QR + NFC tap for walk-in attribution. Coordinate with venue ops.',
   8, 'Ops Lead', '2025-04-18', 'low', 'open', 'manual');
```

---

## STEP C — Lovable Prompt 1 (Main App)

> Go to **lovable.dev → New Project → paste this entire prompt**.
> This is your one big prompt. Use it first.

---

```
Build a React + TypeScript single-page app called "RISA Festival Growth Dashboard" for an attendee growth assignment. Connect it to my Supabase project using the anon public key I will provide in the env vars (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).

DESIGN SYSTEM
Dark theme throughout. Background #0F0F1A, cards #1A1A2E, borders #2E2E4A. Accent purple #6C63FF, green #00C896, amber #FFC107, red #FF4D4D, coral #FF6584. White text #E8E8F0, muted text #9898B0. Use rounded corners (8px), no shadows, tight spacing. Font: Inter or system-ui. Mobile-responsive. No external CSS frameworks — use Tailwind only.

NAVIGATION
Fixed top navbar with logo "RISA Growth" on the left and four tabs on the right: Dashboard, Diagnosis, Tasks, Chatbot. Active tab gets the purple accent underline.

──────────────────────────────────────
TAB 1: DASHBOARD
──────────────────────────────────────
Fetch from Supabase tables: campaigns, targets, daily_metrics.

Section A — KPI Cards (top row, 5 cards)
Card 1: Total Attendees — sum of campaigns.attendees vs targets.revised_goal (metric='attendees'). Show actual / goal and % achieved. Color green if ≥ 95%, amber if 85–95%, red if < 85%.
Card 2: Registrations — sum of campaigns.registrations vs target (metric='registrations'). Same color logic.
Card 3: Total Spend — sum of campaigns.spend_inr vs targets.revised_goal (metric='budget_inr'). Show ₹ formatted (e.g. ₹2.74L). Green if under budget.
Card 4: Blended CAC — total spend ÷ total attendees. Show ₹X. Green if < ₹150, amber if ₹150–200, red if > ₹200.
Card 5: Avg Show-up Rate — weighted average of showup_rate across non-walk_in campaigns. Green if > 82%, amber if 70–82%, red if < 70%.

Section B — Funnel Chart
A horizontal funnel showing 5 stages: Identified → Registrations → Confirmed → Admitted → Target. Use actual DB values for the first 4. Show base (grey bar) and stretch target (green outline bar) side by side for each stage. Use numbers from the targets table: base_value and stretch_value.

Section C — Registration Trend Line
Line chart from daily_metrics: x-axis is metric_date, y-axis is registrations (blue line) and admitted (green line). Use recharts or a simple SVG chart. Mark the revised target as a dashed horizontal line.

Section D — Budget Burn Bar
Horizontal bar: spend_inr as filled portion vs 300000 as full width. Show ₹ spent and ₹ remaining. Color the bar green if < 80% spent, amber if 80–95%, red if > 95%.

──────────────────────────────────────
TAB 2: DIAGNOSIS
──────────────────────────────────────
Fetch from campaigns table.

Section A — Campaign Leaderboard Table
Columns: Campaign | Spend | Attendees | CAC | Show-Up% | Registrations | Status | Recommendation | Actions
Sort by CAC ascending by default. Allow click-sort on any column.
Color CAC cell: green if < ₹100, amber if ₹100–200, red if > ₹200.
Color Show-Up% cell: green if > 82%, amber if 65–82%, red if < 65%.
Recommendation badge: "🟢 Scale" (green), "🟡 Change" (amber), "🔴 Stop" (red).
Actions column: Edit button (opens inline edit for spend_inr and recommendation), Save button.
When spend_inr is edited and saved, update the campaigns table in Supabase AND recompute the KPI cards on the Dashboard tab (the CAC field is computed server-side, so just re-fetch).

Section B — Bottleneck Flags
Below the table, show 3 auto-generated insight cards:
1. Highest CAC: "⚠ [Campaign] has the highest CAC at ₹X — X× the cheapest channel."
2. Worst Show-Up: "⚠ [Campaign] has the lowest show-up rate at X% — X pts below the 82% benchmark."
3. Budget Concentration: "⚠ Top 2 channels consume X% of budget but deliver only Y% of attendees."
Compute these live from the DB data, do not hardcode.

Section C — No-Show Analysis
Show a small bar chart: for each non-walk_in campaign, show confirmed vs attendees (the gap = no-shows). Label with absolute no-show count. Sorted by no-show count descending.

──────────────────────────────────────
TAB 3: TASKS
──────────────────────────────────────
Fetch from tasks table, joined with campaigns for campaign name.

Section A — Task Board (Kanban or table — your choice, table is simpler)
Columns: Title | Campaign | Owner | Due Date | Priority | Status | Source | Actions
Priority badge colors: high=red, medium=amber, low=muted.
Status badge: open=border only, in_progress=amber fill, done=green fill.
Source badge: ai_suggested=purple, manual=muted.
Actions: Edit (inline), Delete, Mark Done.

Section B — Add Task Form
Always visible below the table (not a modal). Fields: Title (required), Description (optional), Campaign (dropdown from campaigns table), Owner, Due Date, Priority (select: high/medium/low), Status (select: open/in_progress/done). Submit button "Add Task". On submit, INSERT into tasks table, then refresh the list.

Section C — Stats Row
3 small cards: Total Tasks | Open Tasks | High-Priority Open. All computed live from the DB.

──────────────────────────────────────
GLOBAL RULES
- All DB reads use the Supabase JS client (createClient from @supabase/supabase-js).
- All writes (edits, task adds, campaign updates) call .upsert() or .update() on the Supabase client and re-fetch the relevant data after.
- Show a loading spinner on each section while fetching.
- Show an error banner ("Failed to load — check Supabase connection") if any fetch fails.
- Never hardcode data. Everything comes from Supabase.
- Use React Query or useEffect+useState for data fetching — your choice.

Do not build the Chatbot tab yet. Leave it as an empty placeholder panel with the text "AI Chatbot — coming next."
```

---

## STEP D — Lovable Prompt 2 (Chatbot Panel)

> Paste this as a **follow-up prompt** after Prompt 1 is working and you've tested the first 3 tabs.

---

```
Add the AI Chatbot to the fourth tab (Chatbot). It must read live data from Supabase and answer questions using real numbers, not hardcoded text.

ARCHITECTURE
Create a Supabase Edge Function called "chat-handler" that:
1. Receives { messages: [{role, content}], session_id: string } from the frontend.
2. Builds a system prompt by querying the campaigns and targets tables and formatting the data as a compact JSON block (see system prompt template below).
3. Calls the Gemini 1.5 Flash API (https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent) with the full messages array + system prompt.
4. Returns the assistant reply text.
5. Saves both the user message and the assistant reply to chat_logs table.

Store the Gemini API key as a Supabase secret called GEMINI_API_KEY (set via Supabase Dashboard → Settings → Edge Functions → Secrets).

SYSTEM PROMPT TEMPLATE (inject live data into the {{...}} placeholders in the edge function)
---
You are the RISA Festival Growth AI Copilot. You help the growth team analyze attendee data, diagnose campaign performance, and manage tasks.

LIVE DATA (as of query time):
{{campaigns_json}}
{{targets_json}}

RULES — follow all of these without exception:
1. Answer ONLY from the live data above. Do not use general knowledge about festivals.
2. All calculations must be shown step-by-step (e.g. CAC = spend / attendees = 93000 / 340 = ₹274).
3. If a question cannot be answered from the data (e.g. why attendees chose this festival, causal impact of sponsors, any event after 20 April 2025), say exactly: "The data can't answer this."
4. Separate facts (from data) from assumptions clearly. Use the word ASSUMPTION: before any assumed statement.
5. When diagnosing a campaign, always state: CAC, show-up rate, comparison to best channel, and what the data shows.
6. TASK CREATION FLOW: When you want to suggest creating a task, output a JSON block like this at the end of your message:
   ```task
   {"title": "...", "description": "...", "owner": "...", "priority": "high|medium|low", "campaign_id": null_or_number}
   ```
   The user will then confirm or reject it. Do not create tasks without showing this block first.
7. Never say "I think" or "probably." Use "The data shows," "Based on the numbers," or "The data can't answer this."
---

FRONTEND CHATBOT UI
Inside the Chatbot tab, build:
- A scrollable message thread (user messages right-aligned purple bubble, assistant messages left-aligned dark card).
- A text input at the bottom with a Send button (or Enter to send).
- While waiting for the edge function response, show a "Thinking..." animated dots indicator in the thread.
- If the assistant reply contains a ```task ... ``` block, parse it and show a "Create this task?" card below the message with two buttons: ✅ Confirm (saves to tasks table via Supabase) and ✕ Dismiss. After confirming, show a success toast "Task created!" and add it to the Tasks tab.
- Show a small disclaimer at the top: "Answers are based on 2025 festival data. Some questions may be unanswerable from the data."
- Add 4 quick-start suggestion chips below the disclaimer that pre-fill the input:
  "Why is Paid Social underperforming?"
  "Which campaign has the best CAC?"
  "How many attendees are we short of the revised goal?"
  "Create a task to cut Creator Partners budget"

DEMO WORKFLOW
Make sure this exact flow works end to end:
User: "Why is Paid Social underperforming?"
Bot: Gives CAC (₹274), show-up rate (58.6%), comparison to best (Referrals ₹69), and shows the no-show gap (240 people).
User: "Create a task to pause Paid Social"
Bot: Proposes a task JSON block.
User clicks Confirm.
Task appears in the Tasks tab with source="ai_suggested".
```

---

## STEP E — Lovable Prompt 3 (Reset + Live Recompute)

> Paste after Prompt 2 is working.

---

```
Add two features that the evaluators will specifically test:

FEATURE 1 — Reset to Original Data
Add a "Reset to Original Data" button in the Diagnosis tab, top-right corner. Style it with a red border and "↺ Reset to Original" label.

When clicked:
1. Show a confirmation modal: "This will restore all campaign spend and attendee numbers to the original 2025 dataset. Any manual edits will be lost. Continue?"
2. On confirm, run an UPDATE on the campaigns table: SET spend_inr = spend_original, attendees = attendees_original for all rows.
3. Re-fetch the campaigns and re-render the Dashboard and Diagnosis tabs.
4. Show a success toast: "Data reset to original 2025 values."

FEATURE 2 — Live Recompute on Edit
When a user edits spend_inr for any campaign in the Diagnosis tab and saves:
1. The campaigns table is updated in Supabase.
2. The Dashboard KPI cards immediately re-fetch and recompute: Total Spend, Blended CAC (total spend / total attendees), Avg Show-Up Rate.
3. The Budget Burn Bar updates to reflect the new total spend.
4. The Bottleneck Flags in Diagnosis recompute (highest CAC, worst show-up, budget concentration).
5. The chatbot also sees the new data on the next message, because the edge function queries live from Supabase on each call.

Add a small "Last updated: [timestamp]" label below the KPI card row that updates every time data is re-fetched.

Also add a "Projected Attendees" KPI card (6th card, full-width below the first row):
Formula: sum(campaigns.attendees) + (stretch_value - base_value from targets where metric='attendees') * (1 - budget_used_pct * 0.3)
Label it as "ASSUMPTION-BASED PROJECTION" in small muted text below the number. Color green if > revised_goal, amber if within 10% below, red if > 10% below.
```

---

## STEP F — Lovable Prompt 4 (Polish + Deploy)

> Paste last, right before you deploy.

---

```
Final polish before deployment:

1. PAGE TITLE: Set the browser tab title to "RISA Growth Dashboard — Rudra Gupta"

2. EMPTY STATES: If the tasks table is empty, show "No tasks yet. Add one below or ask the AI Copilot." If campaigns fail to load, show the error banner with a Retry button.

3. CHATBOT HISTORY: On first load of the Chatbot tab, fetch the last 20 messages from chat_logs for the current session_id (store session_id in localStorage as a UUID, generate one on first visit). Display them so the conversation persists across page refreshes.

4. MOBILE: On screens < 768px, collapse the Diagnosis table into cards (one card per campaign showing name, CAC, show-up%, recommendation). The task form stacks vertically. The chatbot takes full screen height.

5. FOOTER: Add a small footer: "Data: RISA Festival 2025 (synthetic). Cleaned & modelled by Rudra Gupta. Reset to original data available in the Diagnosis tab."

6. DEPLOY: When you click the Lovable deploy button, the app should work from the public URL with no login required (the Supabase RLS policies allow all reads and writes without authentication). Test in an incognito window and confirm all 4 tabs load data.
```

---

## Chatbot System Prompt (Full Version for the Edge Function)

> This goes inside your Supabase Edge Function as the system message, with live data injected.

```
You are the RISA Festival Growth AI Copilot, embedded inside a live growth dashboard.

Your job: help the growth team diagnose campaign performance, calculate metrics, recommend actions, and manage tasks — using only the data injected below.

═══════════════════════════════════════
LIVE DATA (injected at query time)
═══════════════════════════════════════
CAMPAIGNS:
{{campaigns_json}}

TARGETS:
{{targets_json}}

═══════════════════════════════════════
WHAT YOU KNOW (sourced from the data)
═══════════════════════════════════════
- Dataset covers RISA Festival 2025, synthetic data, cleaned and deduplicated.
- "Attendee" = unique external person, admitted AND verified at check-in.
- CAC = spend_inr / attendees. Computed field in DB.
- Show-up rate = attendees / confirmed × 100. Computed field in DB.
- Revised targets (effective 15 Mar 2025): 2,200 unique visitors, ₹3,00,000 budget.
- Walk-ins have no campaign, no spend, CAC = 0.
- 125 walk-ins are included in total attendees but excluded from campaign CAC.
- Bangalore: 1,148 colleges (AISHE 2023-24, sourced). ~5.38L students (C&W/SAPFI 2018-19, sourced).
- Data ends 20 April 2025 (event day).

═══════════════════════════════════════
WHAT YOU CANNOT ANSWER (say "The data can't answer this")
═══════════════════════════════════════
- Why any individual attended or cancelled.
- Causal impact of sponsors on attendance.
- What would happen if you ran a different campaign.
- Anything after 20 April 2025.
- NPS, satisfaction, or attendee demographics (not in dataset).
- Whether the data represents real people or events.

═══════════════════════════════════════
RULES
═══════════════════════════════════════
1. Only use data above. Never hallucinate numbers.
2. Show calculations step by step: "CAC = ₹93,000 / 340 = ₹274."
3. Prefix assumptions with "ASSUMPTION:" clearly.
4. For campaign diagnosis, always include: CAC, show-up rate, comparison to best channel.
5. Task creation: when suggesting a task, end your reply with a fenced block:
   ```task
   {"title": "...", "description": "...", "owner": "Growth Lead", "priority": "high", "campaign_id": 1}
   ```
6. For follow-up questions, use the previous messages to stay consistent.
7. Be concise. No more than 5 sentences unless doing a full diagnosis.
8. If data was recently edited (the user may mention this), acknowledge that the numbers shown are the current live values.
```

---

## Environment Variables Checklist

| Variable | Where to set | Value |
|---|---|---|
| `VITE_SUPABASE_URL` | Lovable → Settings → Env Vars | From Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Lovable → Settings → Env Vars | From Supabase → Settings → API |
| `GEMINI_API_KEY` | Supabase → Settings → Edge Functions → Secrets | From aistudio.google.com → Get API Key |

---

## Free Tier Limits Summary

| Service | Free limit | This app's usage | Safe? |
|---|---|---|---|
| Supabase DB | 500 MB | ~2 MB (pre-aggregated tables) | ✅ |
| Supabase Edge Functions | 500K invocations/month | Demo: < 500 | ✅ |
| Supabase project pause | After 7 days inactive | Manually unpause before demo | ⚠ Check |
| Lovable edits | Credit-based | 4 prompts above = ~4 edits | ✅ |
| Gemini 1.5 Flash | 15 RPM, 1M tokens/day | Demo: < 100 calls | ✅ |
| Vercel (Lovable deploy) | 100 GB bandwidth | Static site: negligible | ✅ |

> [!WARNING]
> Supabase free projects **pause after 7 days of inactivity**. Before your demo, go to Supabase → your project and click "Restore" if it's paused. Takes ~1 minute.

> [!TIP]
> Save your Lovable prompts in a text file before pasting them. If Lovable misunderstands something, you can paste only the relevant section as a correction rather than re-using a whole prompt credit.

---

## What the Evaluators Will Test — and How the App Handles It

| Test | How the app handles it |
|---|---|
| Change a campaign's spend → check if CAC updates | Edit spend in Diagnosis → Supabase updates → Dashboard re-fetches → CAC recomputes |
| Ask chatbot about changed data | Edge function queries live Supabase on every call — no cached data |
| Ask an unanswerable question | System prompt rule 2 → "The data can't answer this" |
| Reset to original data | Reset button → restores spend_original and attendees_original columns |
| Create a task via chatbot | Task JSON block → Confirm button → INSERT to tasks table → visible in Tasks tab |
| Check if chatbot does math correctly | Show-calculations rule → all arithmetic shown step by step |
