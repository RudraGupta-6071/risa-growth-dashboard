# RISA Growth Dashboard — Rudra Gupta

A high-performance React + TypeScript single-page app built for attendee growth analytics, unit economics diagnosis, automated task orchestration, and live Gemini AI Copilot exploration.

---

## 🚀 Quick Start

### 1. Install & Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Zero-Config Ready:** The dashboard includes high-performance auto-fallback local storage pre-seeded with cleaned 2025 actuals. It functions 100% interactively immediately without requiring any credentials up front!

---

## ⚡ Connecting Supabase & Google AI Studio

### Step 1: Supabase Setup (5 min, free)
1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Navigate to **SQL Editor** → **New query**.
3. Paste and run [`supabase/schema.sql`](supabase/schema.sql).
4. Open another query, paste and run [`supabase/seed.sql`](supabase/seed.sql).
5. Go to **Project Settings** → **API** → Copy your:
   - `Project URL`
   - `anon / public key`

### Step 2: Google AI Studio Key (Free)
1. Go to [aistudio.google.com](https://aistudio.google.com) → **Get API Key**.
2. Copy your Gemini API key.

### Step 3: Enter in App or `.env`
Click the **"Storage / Keys"** button in the top right of the dashboard navbar, paste your Supabase URL, Anon Key, and Gemini Key, and click **Save Settings** (or test the connection directly).

Alternatively, create a `.env` file in the root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

---

## 🎯 Evaluator Test Checklist

| Evaluator Test | How to Verify in App |
|---|---|
| **Change a campaign's spend → check if CAC updates** | Go to **Diagnosis** tab → click **Edit** on any campaign (e.g. Paid Social) → update spend → click **Save**. Notice CAC recomputes live and Dashboard KPIs / Budget Burn bar immediately recalculate! |
| **Reset to original data** | In **Diagnosis** tab → click **↺ Reset to Original** → Confirm modal. All spend and attendee counts revert to locked 2025 actuals. |
| **Ask chatbot about changed data** | Edit a campaign's spend in Diagnosis, then switch to **Chatbot** and ask: *"Why is Paid Social underperforming?"*. The bot evaluates the new live numbers in real time! |
| **Ask an unanswerable question** | Ask *"Why did attendees choose this festival?"* or *"What was the sponsor impact?"*. The chatbot strictly responds: *"The data can't answer this."* |
| **Create a task via chatbot** | Ask: *"Create a task to cut Creator Partners budget"* or *"Create a task to pause Paid Social"*. The bot returns a proposed task card with **Confirm & Add**. Clicking Confirm immediately inserts it into the **Tasks** tab with `ai_suggested` badge! |
| **Check if chatbot does math correctly** | All calculations are shown step-by-step (`spend / attendees = CAC`). |
| **Projected Attendees card** | Visible on the Dashboard below the top row with `ASSUMPTION-BASED PROJECTION` tag. |
