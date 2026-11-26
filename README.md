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
1. **College & Enrolment Scale:** Bengaluru Urban had **1,148 colleges** according to AISHE 2023–24 (the highest district count in India). A separate Cushman & Wakefield–SAPFI study (*Exploring the Student Housing Universe in India – City Insights*, Jan 2020) estimated **5.38 lakh** higher-education students in Bengaluru in **2018–19**. The enrolment figure is a historical benchmark, not a current student count.
2. **Transit Connectivity:** Namma Metro's **Purple Line** (East–West) and **Green Line** (North–South), intersecting at Nadaprabhu Kempegowda Station (Majestic), serve major academic corridors across South-Central and West Bengaluru, reducing traffic-induced event-day attrition.
3. **Target Audience Clusters (Prioritized):**
   - **Cluster 1 — South-Central Cultural Core** (Christ University, St. Joseph's, Jain University, Mount Carmel): High concentration of cultural, music, dance, and debate societies.
   - **Cluster 2 — South & West Tech Hubs** (PES University, BMSCE, RVCE, Dayananda Sagar, Ramaiah): High commuter volume along metro corridors with strong affinity for inter-collegiate competitions and live showcases.

---

## 3. Data Reconciliation, Assumptions & Quantitative Model

Throughout the dashboard and this document, figures are separated into **Actuals** (from the synthetic 2025 dataset), **Modeled Calculations** (deterministic TypeScript outputs), and **Planning Assumptions**.

### Core Formulas (Modeled Calculations)
All dashboard KPIs and AI Copilot metrics are computed deterministically in TypeScript (`src/services/analytics.ts`):

- **Blended CAC (All Admitted):** `total_spend / total_attendees`
- **Paid Blended CAC (Excl. Walk-ins):** `total_spend / (total_attendees - walk_in_attendees)`
- **Campaign CAC:** `campaign_spend / campaign_attendees`
- **Stretch CAC:** `stretch_budget / stretch_attendees = 3,00,000 / 2,500 = INR 120`
- **Show-up Rate (Paid Channels):** `paid_admitted / confirmed_registrations * 100`
- **Reg-Start Conversion:** `registrations / reg_starts * 100`

### Baseline Data Reconciliation (Campaigns vs. Daily Historical Rollup — Actuals)
The historical `daily_metrics` table ends on Event Day (`2025-04-20`) and is preserved read-only. Reconciling channel-level `campaigns` against `daily_metrics` yields:

| Metric | Daily Historical (`2025-04-20`) | Campaign Sum (Baseline) | Variance / Explanation |
| :--- | :--- | :--- | :--- |
| Spend (INR) | 2,74,000 | 2,74,000 | 0 (Exact match) |
| Admitted Attendees | 2,050 | 2,050 | 0 (Exact match; includes 125 walk-ins at INR 0 spend) |
| Registrations | 2,800 | 2,626 | +174 unattributed / pre-campaign daily rollup variance |
| Confirmed | 2,500 | 2,525 | -25 channel-level vs. daily rollup variance |

### Target Scenarios & Capacity Constraints

| Scenario | Admitted Target (Denominator) | Budget | Blended CAC (Spend / Target) | Paid Show-Up | Key Levers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Realistic Base (Actuals) | 2,050 (1,925 paid + 125 walk-ins) | INR 2,74,000 | INR 134 (`2,74,000 / 2,050 = 133.7`) | 76.2% (`1,925 / 2,525`) | Unoptimized baseline with high Paid Social & Creator spend. |
| Revised Goal (Challenge) | 2,200 | INR 2,74,000 (reallocated) to INR 3,00,000 (max cap) | INR 124.5 (`2,74,000 / 2,200`) to INR 136.4 (`3,00,000 / 2,200`) | 76.5%+ (Planning assumption) | Reallocate 30% of Paid Social spend into Ambassadors & Referrals; optionally deploy remaining INR 26,000. |
| Ambitious Stretch | 2,500 | INR 3,00,000 | INR 120 (`3,00,000 / 2,500`) | 83.3% (Planning assumption) | Full INR 3.00L deployment with Metro shuttles & waitlist SMS recovery. |

- **Total Admission Ceiling vs. Simultaneous Occupancy:** **2,500** is the **total unique admitted attendee ceiling** in the festival model. Simultaneous venue occupancy is kept below that ceiling via two staggered entry waves (Morning Wave: 1,100 peak; Evening Wave: 1,400 peak).
- **Campaign-Level Forecast (`analytics.ts` — Modeled Calculation):** Remaining budget (`max(0, budget_goal - total_spend)`) is allocated across scalable paid channels weighted inversely by live CAC (`1 / cac`), converted using each channel's historical CAC (**Assumption:** constant marginal CAC), and capped at the `2,500` total admission ceiling.

---

## 4. Prioritization Framework (ICE) & Strategy Deduplication

Strategies are ranked using **ICE** (Impact, Confidence, Ease on a 1–10 scale). **Methodology Note:** ICE scores are judgment-based planning scores used to rank relative execution priority, not statistically validated probabilities.

### Ranked Initiatives (Demand Generation vs. Operational Conversion)

| Rank & Strategy | Category | Impact | Confidence | Ease | ICE | Gross Gain | Budget | Unit CAC | Testing & Primary KPIs |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| 1. Campus Ambassador Network (35 reps) | Demand Generation | 9 | 9 | 9 | 9.0 | +420 | INR 45,000 | INR 108 | Pilot 10 campuses Week 1; monitor 48h rep quota completion & WhatsApp link conversion. |
| 2. College Cultural Club Co-Hosting | Demand Generation | 9 | 8 | 9 | 8.7 | +385 | INR 31,000 | INR 81 | Pilot 10 clubs (>200 members); track contingent bus confirmations & 91.7% show-up rate. |
| 3. WhatsApp Peer Referral (Squad Pass) | Demand Generation | 8 | 9 | 8 | 8.3 | +310 | INR 21,500 | INR 69 | A/B test Buy-3-Get-1 vs. single pass; monitor viral coefficient `k` (target > 1.2). |
| 4. High-Intent Waitlist SMS Recovery | Funnel Recovery | 7 | 8 | 8 | 7.7 | +210 | INR 15,000 | INR 71 | 50/50 holdout on 730 unconfirmed dropouts in final 72h; target 25–28% recovery. |
| 5. Metro Fast-Track QR & Shuttles | Operational Conversion & Gate Capacity | 7 | 7 | 7 | 7.0 | +150 | INR 12,500 | INR 83 | Continuous Purple Line shuttles + 6 scanner lanes; monitor gate wait time (< 5 min). |

*Note on #5:* Metro shuttles and 6 fast-track QR scanner lanes do not generate top-of-funnel demand; they are operational conversion and gate-throughput improvements that reduce confirmed-to-admitted friction.

### Budget Reconciliation (INR 1,25,000 Strategy Allocation Within INR 3,00,000 Total Cap)
The **INR 1,25,000** sum across the 5 initiatives is **not** incremental spend on top of `INR 2,74,000`. It represents the **target allocation within the INR 3,00,000 total budget**, funded by:
- Existing Ambassador (`INR 42,000`) and College Partnership (`INR 31,000`) budgets (`INR 73,000`), plus
- The `INR 26,000` unspent budget runway (`3,00,000 - 2,74,000`), plus
- Reallocation of `INR 26,000`–`28,000` from underperforming Paid Social (`INR 93,000`) and Creator Partners (`INR 59,000`).

### Overlap & Deduplication Planning Assumption (+1,475 Gross vs. +450 Net Stretch)
- **Gross Sum of 5 Strategies:** `+1,475` gross incremental attendees.
- **Deduplication & Capacity Adjustment (Planning Assumption):** `-1,025` (`69.5%`) deducted to reconcile to the `+450` net stretch increase (`2,050 -> 2,500`). This planning assumption is estimated from three adjustments:
  1. **Baseline Run-Rate Overlap (~35% of gross, ~515):** A substantial share of Ambassador (`+420`) and Club (`+385`) volume continues existing baseline acquisition (`390` and `385` in the 2025 base) rather than representing purely net-new incremental students.
  2. **Multi-Touch Channel Overlap (~25% of gross, ~370):** Students touched by Ambassadors or Clubs also forward WhatsApp Squad Passes, receive SMS recovery nudges, or ride the Metro shuttle.
  3. **Total Admission Capacity Cap (~140):** Even if gross demand exceeds `2,500`, total festival admissions are capped at `2,500`.
- **Measurement:** In live execution, actual unique incremental attendees are deduplicated and measured via **unique check-in IDs** and **channel-tagged QR/referral codes**, rather than relying on the planning assumption.

### Explicit Tradeoffs (What We Cut & +190 Payoff Math)
- **Paid Social (Meta Ads):** `INR 93,000` spend, `340` attendees, **INR 274 CAC**, `240` no-shows (`58.62%` actual show-up; part of the `600`-person paid registration-to-admission gap). Action: **Cut spend by 30% (`-INR 28,000`, `-102` paid attendees)** and reallocate to lowest-CAC scalable channels.
- **Creator Partners:** `INR 59,000` spend, `175` attendees, **INR 337 CAC**, `115` no-shows (`60.34%` actual show-up). Action: **Stop / Freeze** immediately.
- **Reallocation Math (`+190` Net at `INR 0` Extra Budget):** Shifting `INR 28,000` from Paid Social (`INR 274` CAC -> `-102` attendees) into Referrals/Clubs/Ambassadors (`~INR 96` avg CAC -> `+292` attendees) yields **`+190` net attendees** (`292 - 102`). This `+190` is **included within** the `+450` net stretch lift, not additive on top of it.

---

## 5. Adaptive Decision Playbook

Thresholds are anchored to the **INR 120 stretch CAC benchmark** (`3,00,000 / 2,500`). **Caveat:** Historical channel CACs (such as Referrals at `INR 69`, College Partnerships at `INR 81`, and Ambassadors at `INR 108`) reflect current spend levels and **may rise (marginal CAC > historical CAC)** as spend scales due to audience saturation.

| Tier | Thresholds | Early Signals | Team Action | AI Copilot Role |
| :--- | :--- | :--- | :--- | :--- |
| Scale | CAC < INR 120 and Actual Show-up > 80% | Clubs confirming bus contingents; referral `k > 1.2` | Unlock bonus ambassador pool and extra campus kits while monitoring marginal CAC. | Flags scale threshold and proposes scale-up task for confirmation. |
| Change | CAC INR 120–220 or Actual Show-up 60%–80% | High reg starts with >25% checkout drop-off | Pivot ad copy to Artist Lineup; switch to 1-click WhatsApp RSVP. | Identifies funnel leak and drafts messaging/reminder task. |
| Stop | CAC > INR 220 or Actual Show-up < 60% | Vanity clicks without check-in; high no-show attrition | Pause spend immediately; reallocate remaining budget within 4h. | Triggers `THRESHOLD -> stop` alert and models reallocation. |

---

## 6. Architecture, Tools, Sources & Verification

### Technology Stack & Plans Used
- **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS, Recharts, Lucide React (open-source).
- **Backend & Database:** Supabase (Free tier) — PostgreSQL with generated columns (`cac_inr`, `showup_rate`), least-privilege Row Level Security (`supabase/migrations/20261126000000_harden_rls_and_constraints.sql`), and Deno Edge Function (`chat-handler`).
- **Embedded AI:** Google AI Studio / Gemini API (`gemini-2.5-flash` / `gemini-3-flash-preview`, Free tier) paired with a deterministic TypeScript analytics and fallback engine (`src/services/analytics.ts`, `src/services/gemini.ts`).
- **Presentation Generation:** `pptxgenjs` (v4.0.1) via `generate_3_slide_deck.cjs` and Microsoft PowerPoint PDF export.
- **Hosting:** GitHub Pages (`gh-pages` branch).

### Data Sources & Citations
- **Festival Historical Dataset (Synthetic):** Cleaned, deduplicated RISA Festival 2025 dataset (`campaigns.csv`, `supabase/seed.sql`, `src/services/seedData.ts`).
- **AISHE 2023–24 (Ministry of Education, Government of India):** Reported **1,148 colleges** in Bengaluru Urban district (highest in India, up from 1,107 in 2022–23). Official portal: https://aishe.gov.in/
- **Cushman & Wakefield & SAPFI (*Exploring the Student Housing Universe in India – City Insights*, Jan 2020):** Estimated **5.38 lakh** higher-education students in Bengaluru for the **2018–19** academic year (historical benchmark). Publisher: https://www.cushmanwakefield.com/
- **Bangalore Metro Rail Corporation Limited (BMRCL — Namma Metro):** Purple Line and Green Line network intersecting at Nadaprabhu Kempegowda Station, Majestic. Official portal: https://english.bmrc.co.in/

### What Was Reused, Modified & Verified
- **Reused:** Provided historical campaign and daily metrics datasets as the baseline seed.
- **Modified:** Built custom React/TypeScript dashboard, deterministic analytics engine, Supabase RLS hardening migration, Edge Function, and `pptxgenjs` slide generator.
- **Verified (Observed Checks Only):**
  - **Automated Tests (`npm test`):** 8/8 unit and scenario tests passed locally (covering `INR 120` stretch CAC, strategy deduplication, daily reconciliation, attendee/budget edit recalculation, AI lowest-CAC ranking, underperformance diagnosis + follow-ups, budget reallocation, confirmation-gated task creation, and missing-data handling).
  - **Production Build (`npm run build`):** `tsc && vite build` passed with zero errors.
  - **Supabase Deployment:** Pushed `20261126000000_harden_rls_and_constraints.sql` and deployed `chat-handler` to project `kuqntcxcvallojirzndx`.
  - **Live Browser Smoke Check:** Loaded `https://rudragupta-6071.github.io/risa-growth-dashboard/` with zero console errors, confirmed `SAVED TO SUPABASE` sidebar status (read connection), verified `STRETCH CAC: INR 120` and audit cards, verified `Diagnosis` search filtering (`Paid Social`), and verified AI Copilot response to `"Which campaign has the lowest CAC?"`.
  - **Not Verified End-to-End in Live Browser:** Live Supabase **write/reset mutations** (editing spend/attendees in the live browser and reloading from remote DB) were tested via local unit tests and `localStorage` fallback rather than a live browser write-and-reload cycle.

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
2. **Single-Touch Attribution & Assumed Deduplication:** Channel metrics use last-touch attribution; the `-1,025` (`69.5%`) strategy overlap/capacity deduction is a planning assumption until measured via unique check-in IDs.
3. **Constant Marginal CAC Assumption:** Both the What-If Simulator and remaining-budget forecast assume constant marginal CAC when shifting or deploying funds, whereas real channels experience diminishing returns at higher spend.
4. **Simulated Messaging Execution:** WhatsApp/SMS reminder sequences are tracked as operational tasks in the Task Board rather than connected to live Twilio or WhatsApp Business API webhooks.
5. **Uniform Admission Model:** Assumes a single general admission tier rather than segmented VIP, competition-only, or day-pass pricing.
