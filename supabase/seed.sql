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
