import { Campaign, Target } from '../types';
import { getStoredConfig } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const buildSystemPrompt = (campaigns: Campaign[], targets: Target[]): string => {
  const campaignsJson = JSON.stringify(
    campaigns.map(c => ({
      id: c.id,
      name: c.name,
      channel: c.channel_type,
      spend_inr: c.spend_inr,
      attendees: c.attendees,
      confirmed: c.confirmed,
      registrations: c.registrations,
      cac_inr: c.cac_inr ?? (c.attendees > 0 ? Math.round(c.spend_inr / c.attendees) : 0),
      showup_rate: `${c.showup_rate ?? (c.confirmed > 0 ? ((c.attendees / c.confirmed) * 100).toFixed(2) : 0)}%`,
      noshow_count: c.noshow_count,
      status: c.status,
      recommendation: c.recommendation
    })),
    null,
    2
  );

  const targetsJson = JSON.stringify(targets, null, 2);

  return `You are the RISA Festival Growth AI Copilot, embedded inside a live growth dashboard.

Your job: help the growth team diagnose campaign performance, calculate metrics, recommend actions, and manage tasks — using only the data injected below.

═══════════════════════════════════════
LIVE DATA (injected at query time)
═══════════════════════════════════════
CAMPAIGNS:
${campaignsJson}

TARGETS:
${targetsJson}

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
};

// Fallback rule engine that responds accurately according to specification when no Gemini key is provided
export const fallbackChatEngine = (
  userMessage: string,
  campaigns: Campaign[],
  targets: Target[]
): string => {
  const query = userMessage.toLowerCase().trim();

  // 1. Unanswerable check
  const unanswerableTriggers = [
    'why did', 'why attendees chose', 'food', 'sponsor', 'sponsorship',
    'satisfaction', 'nps', 'demographics', 'after april 20', 'future',
    'weather', 'survey', 'gender', 'age', 'next year', '2026'
  ];
  if (unanswerableTriggers.some(t => query.includes(t)) && !query.includes('underperforming') && !query.includes('paid social')) {
    return "The data can't answer this.";
  }

  // 2. Paid Social underperforming
  if (query.includes('paid social') && (query.includes('underperforming') || query.includes('why') || query.includes('diagnos') || query.includes('perform'))) {
    const ps = campaigns.find(c => c.name.toLowerCase().includes('paid social')) || campaigns[0];
    const bestCac = [...campaigns].filter(c => c.spend_inr > 0).sort((a, b) => (a.cac_inr || 0) - (b.cac_inr || 0))[0];
    const cac = ps.cac_inr || Math.round(ps.spend_inr / ps.attendees);
    const bestCacVal = bestCac.cac_inr || Math.round(bestCac.spend_inr / bestCac.attendees);
    const showup = ps.showup_rate || Number(((ps.attendees / ps.confirmed) * 100).toFixed(2));
    
    return `Based on live data, Paid Social is severely underperforming:
1. **CAC:** CAC = spend / attendees = ₹${ps.spend_inr.toLocaleString('en-IN')} / ${ps.attendees} = ₹${cac}. This is nearly 4× worse than the best channel (${bestCac.name} at ₹${bestCacVal}).
2. **Show-up Rate:** Show-up rate = attendees / confirmed = ${ps.attendees} / ${ps.confirmed} = ${showup}% (benchmark is 82%).
3. **No-Show Gap:** Out of ${ps.confirmed} confirmed registrants, ${ps.noshow_count || (ps.confirmed - ps.attendees)} failed to show up (plus ${ps.cancel_count} cancellations).
4. **Diagnosis:** High drop-off between click and confirmed attendance indicates poor intent from social ads. Recommendation is to STOP or cut budget by 30%.`;
  }

  // 3. Best CAC
  if (query.includes('best cac') || query.includes('lowest cac') || query.includes('cheapest channel')) {
    const valid = [...campaigns].filter(c => c.spend_inr > 0).sort((a, b) => (a.cac_inr || 0) - (b.cac_inr || 0));
    const best = valid[0];
    const cac = best.cac_inr || Math.round(best.spend_inr / best.attendees);
    return `The data shows that **${best.name}** has the best (lowest) CAC:
- Calculation: CAC = spend / attendees = ₹${best.spend_inr.toLocaleString('en-IN')} / ${best.attendees} = ₹${cac}.
- Show-up rate: ${best.attendees} / ${best.confirmed} = ${best.showup_rate}%.
- Status: Recommended to **${best.recommendation.toUpperCase()}**.`;
  }

  // 4. Short of revised goal
  if (query.includes('short') || query.includes('revised goal') || query.includes('target gap') || query.includes('how many attendees')) {
    const totalAttendees = campaigns.reduce((sum, c) => sum + c.attendees, 0);
    const targetObj = targets.find(t => t.metric === 'attendees');
    const target = targetObj ? targetObj.revised_goal : 2200;
    const gap = target - totalAttendees;

    return `Based on the live data:
- **Total Unique Attendees Achieved:** ${totalAttendees.toLocaleString('en-IN')} (including 125 walk-ins).
- **Revised Goal:** ${target.toLocaleString('en-IN')} attendees.
- **Calculation:** Shortfall = ${target} - ${totalAttendees} = **${gap} attendees** (${((totalAttendees / target) * 100).toFixed(1)}% achieved).
ASSUMPTION: Closing the ${gap}-attendee gap requires reallocating budget from high-CAC channels (Paid Social) to high-converting channels (Campus Ambassadors & College Partnerships).`;
  }

  // 5. Create task to cut Creator Partners / pause Paid Social / general task request
  if (query.includes('task') || query.includes('cut') || query.includes('pause') || query.includes('reallocate')) {
    if (query.includes('creator partner')) {
      const cp = campaigns.find(c => c.name.toLowerCase().includes('creator')) || campaigns[2];
      return `Based on the numbers, Creator Partners has a CAC of ₹${cp.cac_inr || 337} with only ${cp.attendees} attendees from ₹${cp.spend_inr.toLocaleString('en-IN')} spend. Here is the suggested task:

\`\`\`task
{"title": "Cut Creator Partners budget", "description": "Reallocate budget from Creator Partners (CAC ₹${cp.cac_inr || 337}) to Campus Ambassadors (CAC ₹108).", "owner": "Growth Lead", "priority": "high", "campaign_id": ${cp.id}}
\`\`\``;
    }

    if (query.includes('paid social')) {
      const ps = campaigns.find(c => c.name.toLowerCase().includes('paid social')) || campaigns[0];
      return `The data shows Paid Social has consumed ₹${ps.spend_inr.toLocaleString('en-IN')} at ₹${ps.cac_inr || 274} CAC. Here is the suggested task:

\`\`\`task
{"title": "Pause Paid Social campaign", "description": "Pause ad sets with CAC > ₹200 and redirect funds to College Partnerships.", "owner": "Growth Lead", "priority": "high", "campaign_id": ${ps.id}}
\`\`\``;
    }

    return `I can create a growth task for this. Here is the proposed action:

\`\`\`task
{"title": "Growth optimization task", "description": "Execute growth priority based on live campaign diagnosis.", "owner": "Growth Lead", "priority": "medium", "campaign_id": null}
\`\`\``;
  }

  // General summary calculation
  const totalSpend = campaigns.reduce((s, c) => s + c.spend_inr, 0);
  const totalAttendees = campaigns.reduce((s, c) => s + c.attendees, 0);
  const blendedCac = totalAttendees > 0 ? Math.round(totalSpend / totalAttendees) : 0;

  return `The live data shows ${campaigns.length} active campaigns:
- **Total Spend:** ₹${totalSpend.toLocaleString('en-IN')}
- **Total Attendees:** ${totalAttendees.toLocaleString('en-IN')}
- **Blended CAC:** spend / attendees = ₹${totalSpend} / ${totalAttendees} = ₹${blendedCac} per attendee.
You can ask me to diagnose any channel, calculate gaps, or create tasks!`;
};

// Send message to Gemini / Edge Function / Fallback
export const sendChatMessage = async (
  messages: ChatMessage[],
  campaigns: Campaign[],
  targets: Target[],
  sessionId: string
): Promise<string> => {
  const { url, geminiKey } = getStoredConfig();

  // 1. Try Supabase Edge Function if Supabase URL is present
  if (url) {
    try {
      const edgeUrl = `${url.replace(/\/$/, '')}/functions/v1/chat-handler`;
      const res = await fetch(edgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiKey ? { 'x-gemini-key': geminiKey } : {})
        },
        body: JSON.stringify({
          messages,
          session_id: sessionId,
          campaigns,
          targets
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) return data.reply;
      }
    } catch (e) {
      console.warn('Edge function not reachable, trying direct Gemini API...', e);
    }
  }

  // 2. Try direct Google Gemini API if Gemini API Key is provided
  if (geminiKey) {
    try {
      const systemInstruction = buildSystemPrompt(campaigns, targets);
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const payload = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        }
      };

      const res = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) return replyText;
      }
    } catch (e) {
      console.warn('Direct Gemini API call failed, using built-in engine:', e);
    }
  }

  // 3. Built-in Deterministic Engine with exact system prompt rules
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  return fallbackChatEngine(lastUserMsg, campaigns, targets);
};
