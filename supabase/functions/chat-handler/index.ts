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
    const { messages, session_id } = await req.json();

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
      { data: campaigns },
      { data: targets },
      { data: tasks },
      { data: dailyMetrics }
    ] = await Promise.all([
      supabase.from('campaigns').select('*').order('id', { ascending: true }),
      supabase.from('targets').select('*').order('id', { ascending: true }),
      supabase.from('tasks').select('*').order('id', { ascending: true }),
      supabase.from('daily_metrics').select('*').order('metric_date', { ascending: true })
    ]);

    // 2. Build system prompt with live injected data
    const systemPrompt = `You are the RISA Festival Growth AI Copilot, embedded inside a live growth dashboard.

Your job: help the growth team diagnose campaign performance, calculate metrics, recommend actions, and manage tasks — using only the data injected below.

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
\`\`\`task
{"title": "...", "description": "...", "owner": "Growth Lead", "priority": "high", "campaign_id": 1}
\`\`\`
6. For follow-up questions, use the previous messages to stay consistent.
7. Be concise. No more than 5 sentences unless doing a full diagnosis.
8. If data was recently edited (the user may mention this), acknowledge that the numbers shown are the current live values.`;

    // 3. Prepare conversation contents (ensure it starts with a 'user' turn for Gemini API)
    const rawContents = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    const firstUserIdx = rawContents.findIndex((c: any) => c.role === 'user');
    const contents = firstUserIdx >= 0 ? rawContents.slice(firstUserIdx) : rawContents;

    // 4. Call Google Gemini 2.5 Flash API with Thinking enabled (with 1x retry on 503/429)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const payload = JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1500,
        thinkingConfig: {
          thinkingBudget: 1024
        }
      }
    });

    let geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });

    if (geminiRes.status === 503 || geminiRes.status === 429) {
      await new Promise((r) => setTimeout(r, 700));
      geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
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
    const replyText = parts.filter((p: any) => !p.thought && p.text).map((p: any) => p.text).join('') || 'No response generated';

    // 5. Save to chat_logs
    if (session_id) {
      const lastUser = (messages || []).filter((m: any) => m.role === 'user').pop()?.content || '';
      await supabase.from('chat_logs').insert([
        { session_id, role: 'user', content: lastUser },
        { session_id, role: 'assistant', content: replyText }
      ]);
    }

    return new Response(JSON.stringify({ reply: replyText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
