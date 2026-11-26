// Supabase Edge Function: chat-handler
// Follows Deno runtime standards for Supabase Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-gemini-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, session_id, campaigns: clientCampaigns, targets: clientTargets } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const geminiApiKey = req.headers.get('x-gemini-key') || Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Supabase Secrets or request header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch live campaigns, targets, tasks, and daily metrics
    const [
      { data: dbCampaigns },
      { data: dbTargets },
      { data: tasks },
      { data: dailyMetrics }
    ] = await Promise.all([
      supabase.from('campaigns').select('*').order('id', { ascending: true }),
      supabase.from('targets').select('*').order('id', { ascending: true }),
      supabase.from('tasks').select('*').order('id', { ascending: true }),
      supabase.from('daily_metrics').select('*').order('metric_date', { ascending: true })
    ]);

    const campaigns = (Array.isArray(clientCampaigns) && clientCampaigns.length > 0) ? clientCampaigns : (dbCampaigns || []);
    const targets = (Array.isArray(clientTargets) && clientTargets.length > 0) ? clientTargets : (dbTargets || []);

    const totalSpend = campaigns.reduce((s: number, c: any) => s + Number(c.spend_inr || 0), 0);
    const totalAttendees = campaigns.reduce((s: number, c: any) => s + Number(c.attendees || 0), 0);
    const totalConfirmed = campaigns.reduce((s: number, c: any) => s + Number(c.confirmed || 0), 0);
    const blendedCac = totalAttendees > 0 ? Math.round(totalSpend / totalAttendees) : 0;
    const paidRankings = campaigns
      .filter((c: any) => Number(c.spend_inr) > 0 && Number(c.attendees) > 0)
      .map((c: any) => ({
        name: c.name,
        cac_inr: Math.round(Number(c.spend_inr) / Number(c.attendees)),
        showup_rate_pct: Number(c.confirmed) > 0 ? Number(((Number(c.attendees) / Number(c.confirmed)) * 100).toFixed(2)) : 0,
      }))
      .sort((a: any, b: any) => a.cac_inr - b.cac_inr);

    const attendeeTarget = targets.find((t: any) => t.metric === 'attendees') || { base_value: 2050, stretch_value: 2500, revised_goal: 2200 };
    const budgetTarget = targets.find((t: any) => t.metric === 'budget_inr') || { base_value: 274000, stretch_value: 300000, revised_goal: 300000 };
    const stretchCac = attendeeTarget.stretch_value > 0 ? Math.round(budgetTarget.stretch_value / attendeeTarget.stretch_value) : 120;

    // 2. Build system prompt with live injected data + deterministic calculations
    const systemPrompt = `You are the RISA Festival Growth AI Copilot, embedded inside a live growth dashboard.

Your job: help the growth team diagnose campaign performance, calculate metrics, recommend actions, and manage tasks — using only the data and pre-computed calculations injected below.

═══════════════════════════════════════
DETERMINISTIC SUMMARY (pre-computed)
═══════════════════════════════════════
${JSON.stringify({ totalSpend, totalAttendees, totalConfirmed, blendedCac, stretchCac, remainingBudget: Math.max(0, budgetTarget.revised_goal - totalSpend), attendeeGap: attendeeTarget.revised_goal - totalAttendees, paidRankings }, null, 2)}

═══════════════════════════════════════
LIVE DATA (injected at query time)
═══════════════════════════════════════
CAMPAIGNS:
${JSON.stringify(campaigns || [], null, 2)}

TARGETS:
${JSON.stringify(targets || [], null, 2)}

TASKS:
${JSON.stringify(tasks || [], null, 2)}

DAILY METRICS (pre-event funnel trend):
${JSON.stringify(dailyMetrics || [], null, 2)}

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
WEBSITE NAVIGATION & TABS (help users navigate)
═══════════════════════════════════════
The left sidebar has 3 tabs, and the AI Copilot is a floating expandable widget in the bottom-right corner:
1. DASHBOARD tab: Shows 3 hero KPIs (Admitted Attendees vs revised goal, Blended CAC, Budget Utilization), the Pre-Event Funnel Trajectory chart (01-15 to Event Day 20 Apr 2025), 3 audit widgets, a **Live Constraints** panel (click EDIT CONSTRAINTS to change Attendee Target or Max Budget in Supabase), and an interactive **What-If Simulator** slider (shift budget from Paid Social to Campus Ambassadors and click Apply Shift Live).
2. DIAGNOSIS tab: Lists all 8 channels with spend, attendees, CAC, show-up rate, and Scale/Change/Stop tags. Click Edit on any campaign to modify spend or attendees—all KPIs update live, and a **THRESHOLD → ...** alert pill triggers automatically if a campaign crosses our Scale/Change/Stop rules (STOP if CAC > ₹220 or Show-up < 60%; CHANGE if CAC ₹120–₹220 or Show-up < 75%; SCALE otherwise).
3. TASK BOARD tab: Operational checklist with owners, due dates, priorities, and statuses. Tasks proposed here appear there after clicking Confirm & Add.
4. Floating AI COPILOT ("Ask AI Copilot" button in bottom-right): Available on every tab and expandable. Answers data questions, runs what-if math, guides users around the app, and creates tasks.
- RESET 2025 DATA button (left sidebar): Restores all edited campaigns and constraints back to the original 2025 baseline.
- Top Bar: Live search bar (filters campaigns in Diagnosis and tasks in Task Board), "EVENT DAY: 20 APR 2025" badge, and "Download 3-Slide Deck (.pptx)" button.

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
1. Tone & Brevity: Talk like a real human teammate in a quick chat—warm, direct, and easy to skim. NEVER info-dump or output bullet/numbered lists for greetings ("hey", "hello") or simple questions. Reply in 1–3 short sentences by default.
2. Only use structured bullets or step-by-step math when the user asks for a calculation, channel diagnosis, or comparison.
3. Only use data above. Never hallucinate numbers.
4. Show math cleanly when asked: "CAC = ₹93,000 / 340 = ₹274."
5. Prefix assumptions with "ASSUMPTION:" clearly.
6. For full campaign diagnosis, include CAC, show-up rate, and comparison to the best channel.
7. Task creation: when recommending a concrete action or when asked to create a task, end your reply with a fenced block:
\`\`\`task
{"title": "...", "description": "...", "owner": "Growth Lead", "priority": "high", "campaign_id": 1}
\`\`\`
8. If data was recently edited, acknowledge that the numbers shown reflect the current live values.`;

    // 3. Prepare conversation contents (ensure it starts with a 'user' turn for Gemini API)
    const rawContents = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    const firstUserIdx = rawContents.findIndex((c: any) => c.role === 'user');
    const contents = firstUserIdx >= 0 ? rawContents.slice(firstUserIdx) : rawContents;

    // 4. Call Google Gemini API with Thinking enabled (includeThoughts: true)
    const callGemini = async (model: string, thinkingBudget: number) => {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
      const payload = JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1800,
          ...(thinkingBudget > 0 ? { thinkingConfig: { thinkingBudget, includeThoughts: true } } : {})
        }
      });
      return fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal: AbortSignal.timeout(15000)
      });
    };

    const modelsToTry = [
      'gemini-3-flash-preview',
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash'
    ];

    let geminiRes: Response | null = null;
    for (const model of modelsToTry) {
      try {
        const res = await callGemini(model, 1024);
        geminiRes = res;
        if (res.ok) break;
        if (res.status !== 429 && res.status !== 503 && res.status !== 404) break;
      } catch (_err) {
        // Timeout or transient network error — try next model
      }
    }

    if (!geminiRes) {
      return new Response(
        JSON.stringify({ error: 'All Gemini models timed out' }),
        { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error (${geminiRes.status}): ${errBody}` }),
        { status: geminiRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    const thoughtText = parts.filter((p: any) => p.thought && p.text).map((p: any) => p.text).join('\n').trim();
    const replyText = parts.filter((p: any) => !p.thought && p.text).map((p: any) => p.text).join('').trim() || 'No response generated';

    // 5. Save to chat_logs
    if (session_id) {
      const lastUser = (messages || []).filter((m: any) => m.role === 'user').pop()?.content || '';
      await supabase.from('chat_logs').insert([
        { session_id, role: 'user', content: lastUser },
        { session_id, role: 'assistant', content: replyText }
      ]);
    }

    return new Response(JSON.stringify({ reply: replyText, thought: thoughtText || undefined }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
