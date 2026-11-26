# RISA Festival '25 — Attendee Growth Strategy & Command Center

**Candidate:** Rudra Gupta  
**Track:** Challenge A — Attendee Growth (Tier 1 City: Bengaluru Urban)  
**Live Application:** https://rudragupta-6071.github.io/risa-growth-dashboard/  
**GitHub Repository:** https://github.com/RudraGupta-6071/risa-growth-dashboard  
**3-Slide Strategy Deck (PDF):** [`RISA_3_Slide_Strategy_Deck.pdf`](RISA_3_Slide_Strategy_Deck.pdf)  
**3-Slide Strategy Deck (PPTX):** [`RISA_3_Slide_Strategy_Deck.pptx`](RISA_3_Slide_Strategy_Deck.pptx)  

---

## 1. Submission Deliverables

| Deliverable | Format | Location | Purpose |
| :--- | :--- | :--- | :--- |
| Three-Slide Growth Strategy | PDF / PPTX | [`RISA_3_Slide_Strategy_Deck.pdf`](RISA_3_Slide_Strategy_Deck.pdf) | Covers Slide 1 (How High Can You Aim?), Slide 2 (Where Will You Place Your Bets?), and Slide 3 (How Will You Know What's Working?). Candidate name included on Slide 1. |
| Working Growth Center | React + TypeScript Web App | https://rudragupta-6071.github.io/risa-growth-dashboard/ | Live analytics dashboard, editable campaign diagnosis table, operational task board, what-if budget simulator, and grounded AI Copilot. |
| Documentation | Markdown | [`README.md`](README.md) | Research, assumptions, calculations, data reconciliation, prioritization framework, setup instructions, tools used, and known limitations. |

---

## 2. Tier 1 City Selection & Market Research (Bengaluru Urban)

### Why Bengaluru?
1. **Campus Density:** Bengaluru Urban hosts **1,148 colleges** with approximately **5.38 Lakh** college students, creating concentrated campus clusters for peer-driven event discovery.
2. **Transit Connectivity:** Namma Metro's **Purple and Green lines** (via the Majestic interchange) connect roughly **82% of priority campuses** within a 40-minute commute, reducing traffic-induced event-day attrition.
3. **Target Audience Clusters:**
   - **Cluster 1 — South-Central Cultural Core** (Christ University, St. Joseph's, Jain University, Mount Carmel): High density of cultural, dance, music, and debate societies.
   - **Cluster 2 — South & West Tech Hubs** (PES University, BMSCE, RVCE, Dayananda Sagar, Ramaiah): High commuter volume along metro corridors with strong affinity for inter-collegiate competitions and live showcases.

---

## 3. Data Reconciliation, Assumptions & Quantitative Model

### Core Formulas
All dashboard KPIs and AI Copilot metrics are computed deterministically in TypeScript (`src/services/analytics.ts`):

- **Blended CAC (All Admitted):** `total_spend / total_attendees`
- **Paid Blended CAC (Excl. Walk-ins):** `total_spend / (total_attendees - walk_in_attendees)`
- **Campaign CAC:** `campaign_spend / campaign_attendees`
- **Stretch CAC:** `stretch_budget / stretch_attendees = 3,00,000 / 2,500 = INR 120`
- **Show-up Rate (Paid Channels):** `paid_admitted / confirmed_registrations * 100`
- **Reg-Start Conversion:** `registrations / reg_starts * 100`

### Baseline Data Reconciliation (Campaigns vs. Daily Historical Rollup)
The historical `daily_metrics` table ends on Event Day (`2025-04-20`) and is preserved read-only. Reconciling channel-level `campaigns` against `daily_metrics` yields:

| Metric | Daily Historical (`2025-04-20`) | Campaign Sum (Baseline) | Variance / Explanation |
| :--- | :--- | :--- | :--- |
| Spend (INR) | 2,74,000 | 2,74,000 | 0 (Exact match) |
| Admitted Attendees | 2,050 | 2,050 | 0 (Exact match; includes 125 walk-ins at INR 0 spend) |
| Registrations | 2,800 | 2,626 | +174 unattributed / pre-campaign daily rollup variance |
| Confirmed | 2,500 | 2,525 | -25 channel-level vs. daily rollup variance |

### Target Scenarios & Capacity Constraints

| Scenario | Admitted Target | Budget | Blended CAC | Paid Show-Up | Key Levers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Realistic Base (Actuals) | 2,050 (1,925 paid + 125 walk-ins) | INR 2,74,000 | INR 134 (INR 133.7 exact) | 76.2% (1,925 / 2,525) | Unoptimized baseline with high Paid Social & Creator spend. |
| Revised Goal (Challenge) | 2,200 | INR 3,00,000 max (INR 2,74,000 reallocated) | INR 136 max (INR 124.5 at INR 2.74L) | 76.5%+ | Reallocate 30% of Paid Social spend into Ambassadors & Referrals. |
| Ambitious Stretch | 2,500 | INR 3,00,000 | INR 120 | 83.3% | Full INR 3.00L deployment with Metro shuttles & waitlist SMS recovery. |

- **Venue Capacity Ceiling:** **2,500 simultaneous visitors**, managed via two staggered entry waves (Morning Wave: 1,100 peak; Evening Wave: 1,400 peak).
- **Campaign-Level Forecast (`analytics.ts`):** Remaining budget (`max(0, budget_goal - total_spend)`) is allocated across scalable paid channels weighted inversely by live CAC (`1 / cac`), converted using each channel's live expected CAC, and capped at the `2,500` venue capacity ceiling.
- **Actuals vs. Projections vs. Assumptions:** Dashboard cards explicitly label observed **ACTUAL** metrics, modeled **PROJECTION** figures, and **ASSUMPTION** (e.g., constant marginal CAC during reallocation).

---

## 4. Prioritization Framework (ICE) & Strategy Deduplication

Strategies are ranked using **ICE** (Impact, Confidence, Ease on a 1–10 scale):

| Rank & Strategy | Impact | Confidence | Ease | ICE | Gross Gain | Budget | Unit CAC | Testing & Primary KPIs |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| 1. Campus Ambassador Network (35 reps) | 9 | 9 | 9 | 9.0 | +420 | INR 45,000 | INR 108 | Pilot 10 campuses Week 1; monitor 48h rep quota completion & WhatsApp link conversion. |
| 2. College Cultural Club Co-Hosting | 9 | 8 | 9 | 8.7 | +385 | INR 31,000 | INR 81 | Pilot 10 clubs (>200 members); track contingent bus confirmations & 91.7% show-up rate. |
| 3. WhatsApp Peer Referral (Squad Pass) | 8 | 9 | 8 | 8.3 | +310 | INR 21,500 | INR 69 | A/B test Buy-3-Get-1 vs. single pass; monitor viral coefficient `k` (target > 1.2). |
| 4. High-Intent Waitlist SMS Recovery | 7 | 8 | 8 | 7.7 | +210 | INR 15,000 | INR 71 | 50/50 holdout on 730 unconfirmed dropouts in final 72h; target 25–28% recovery. |
| 5. Metro Fast-Track QR & Shuttles | 7 | 7 | 7 | 7.0 | +150 | INR 12,500 | INR 83 | Continuous Purple Line shuttles + 6 scanner lanes; monitor gate wait time (< 5 min). |

### Overlap & Deduplication Reconciliation (+1,475 Gross vs. +450 Net Stretch)
- **Gross Sum of 5 Strategies:** `+1,475` incremental attendees.
- **Deduplication & Capacity Deduction:** `-1,025` (`69.5%`) removed for:
  1. **Multi-touch overlap:** Students reached by Ambassadors or Clubs also use Squad Passes, SMS nudges, and Metro shuttles (deduplicated by unique check-in ID).
  2. **Baseline overlap:** Portion of Ambassador and Club volume overlaps with existing baseline run-rate rather than purely net-new admissions.
  3. **Budget & Venue Cap:** `INR 3,00,000` budget ceiling and `2,500` simultaneous venue capacity cap net lift at `+450` above the `2,050` base.

### Explicit Tradeoffs (What We Cut)
- **Paid Social (Meta Ads):** `INR 93,000` spend, `340` attendees, **INR 274 CAC**, `240` no-shows (`58.62%` show-up). Action: **Cut spend by 30%** and reallocate to lowest-CAC scalable channels.
- **Creator Partners:** `INR 59,000` spend, `175` attendees, **INR 337 CAC**, `115` no-shows (`60.34%` show-up). Action: **Stop / Freeze** immediately.

---

## 5. Adaptive Decision Playbook

| Tier | Thresholds | Early Signals | Team Action | AI Copilot Role |
| :--- | :--- | :--- | :--- | :--- |
| Scale | CAC < INR 120 and Show-up >= 75% | Clubs confirming bus contingents; referral `k > 1.2` | Unlock bonus ambassador pool and extra campus kits. | Flags scale threshold and proposes scale-up task for confirmation. |
| Change | CAC INR 120–220 or Show-up 60%–75% | High reg starts with >25% checkout drop-off | Pivot ad copy to Artist Lineup; switch to 1-click WhatsApp RSVP. | Identifies funnel leak and drafts messaging/reminder task. |
| Stop | CAC > INR 220 or Show-up < 60% | Vanity clicks without check-in; high no-show attrition | Pause spend immediately; reallocate remaining budget within 4h. | Triggers `THRESHOLD -> stop` alert and models reallocation. |

---

## 6. Architecture, Tools & Data Sources

### Technology Stack & Plans Used
- **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS, Recharts, Lucide React (open-source).
- **Backend & Database:** Supabase (Free tier) — PostgreSQL with generated columns (`cac_inr`, `showup_rate`), least-privilege Row Level Security (`supabase/migrations/20261126000000_harden_rls_and_constraints.sql`), and Deno Edge Function (`chat-handler`).
- **Embedded AI:** Google AI Studio / Gemini API (`gemini-2.5-flash` / `gemini-3-flash-preview`, Free tier) paired with a deterministic TypeScript analytics and fallback engine (`src/services/analytics.ts`, `src/services/gemini.ts`).
- **Presentation Generation:** `pptxgenjs` (v4.0.1) via `generate_3_slide_deck.cjs` and Microsoft PowerPoint PDF export.
- **Hosting:** GitHub Pages (`gh-pages` branch).

### Data Sources
- **Festival Historical Dataset:** Synthetic, cleaned, and deduplicated RISA Festival 2025 dataset (`campaigns.csv`, `supabase/seed.sql`, `src/services/seedData.ts`).
- **External Benchmarks:**
  - AISHE 2023–24 (1,148 colleges in Bengaluru Urban).
  - C&W / SAPFI 2018–19 (~5.38 Lakh college student population).
  - Namma Metro route map (Purple & Green line Majestic interchange coverage).

### Reused, Modified & Verified
- **Reused:** Provided historical campaign and daily metrics datasets as the baseline seed.
- **Modified:** Built custom React/TypeScript dashboard, deterministic analytics engine, Supabase RLS hardening migration, Edge Function, and `pptxgenjs` slide generator.
- **Verified:**
  - Automated unit and scenario test suite (`npm test` — 8/8 passing) covering stretch CAC (`INR 120`), strategy deduplication, daily reconciliation, attendee/budget edit recalculation, AI lowest-CAC ranking, underperformance diagnosis + follow-ups, budget reallocation, confirmation-gated task creation, and missing-data handling.
  - Production TypeScript check and Vite bundle (`npm run build`).
  - Live browser smoke test on the deployed GitHub Pages URL confirming Supabase persistence, Diagnosis search filtering, and AI Copilot responses.

---

## 7. Local Setup & Configuration

### Prerequisites
- Node.js v18+ (tested on Node v23.10.0) and npm v9+

### Installation & Commands
```bash
git clone https://github.com/RudraGupta-6071/risa-growth-dashboard.git
cd risa-growth-dashboard
npm install
npm test
npm run build
npm run dev
```

### Environment Variables (Optional)
Create a `.env` file in the root directory (or configure via the in-app Settings modal):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```
When Supabase or Gemini credentials are omitted or unreachable, the app falls back to `localStorage` (clearly indicated in the sidebar as `LOCAL STORAGE MODE` vs. `SAVED TO SUPABASE`) and the deterministic TypeScript Copilot engine.

---

## 8. Known Limitations
1. **Synthetic Historical Data:** The 2025 campaign and daily metrics are synthetic; individual attendee demographics (age, gender, major), NPS/satisfaction scores, sponsor causal impact, and post-April 20, 2025 outcomes are not in the dataset.
2. **Single-Touch Attribution:** Channel metrics use last-touch attribution; multi-touch overlap is modeled at the aggregate strategy level (`+1,475` gross to `+450` net).
3. **Constant Marginal CAC Assumption:** Both the What-If Simulator and remaining-budget forecast assume constant marginal CAC when shifting or deploying funds.
4. **Simulated Messaging Execution:** WhatsApp/SMS reminder sequences are tracked as operational tasks in the Task Board rather than connected to live Twilio or WhatsApp Business API webhooks.
5. **Uniform Admission Model:** Assumes a single general admission tier rather than segmented VIP, competition-only, or day-pass pricing.
