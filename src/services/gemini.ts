import { Campaign, DailyMetric, Target } from '../types';
import { getStoredConfig } from './supabase';
import {
  CampaignMetrics,
  computeDashboardAnalytics,
  DashboardAnalytics,
} from './analytics';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const buildSystemPrompt = (
  campaigns: Campaign[],
  targets: Target[],
  dailyMetrics: DailyMetric[] = []
): string => {
  const analytics = computeDashboardAnalytics(campaigns, targets, dailyMetrics);

  const campaignsJson = JSON.stringify(
    analytics.campaignMetrics.map(m => ({
      id: m.campaign.id,
      name: m.campaign.name,
      channel: m.campaign.channel_type,
      spend_inr: m.campaign.spend_inr,
      impressions: m.campaign.impressions,
      clicks: m.campaign.clicks,
      reg_starts: m.campaign.reg_starts,
      registrations: m.campaign.registrations,
      confirmed: m.campaign.confirmed,
      attendees: m.campaign.attendees,
      noshow_count: m.noShows,
      cancel_count: m.campaign.cancel_count,
      cac_inr: m.cac,
      showup_rate_pct: m.showupRate,
      reg_conversion_pct: m.regConversionRate,
      status: m.campaign.status,
      recommendation: m.campaign.recommendation,
      threshold_rule: m.thresholdRecommendation,
    })),
    null,
    2
  );

  const deterministicSummary = JSON.stringify(
    {
      actuals: {
        total_spend_inr: analytics.totalSpend,
        total_attendees: analytics.totalAttendees,
        paid_attendees: analytics.paidAttendees,
        walk_in_attendees: analytics.walkInAttendees,
        total_registrations: analytics.totalRegistrations,
        total_confirmed: analytics.totalConfirmed,
        total_noshows: analytics.totalNoShows,
        blended_cac_inr: analytics.blendedCac,
        paid_blended_cac_inr: analytics.paidBlendedCac,
        avg_showup_rate_pct: analytics.avgShowupRate,
      },
      targets_and_gaps: {
        attendee_goal: analytics.attendeesTarget.revised_goal,
        attendee_gap: analytics.targetGap,
        budget_limit_inr: analytics.budgetTarget.revised_goal,
        remaining_budget_inr: analytics.remainingBudget,
        stretch_attendees: analytics.attendeesTarget.stretch_value,
        stretch_budget_inr: analytics.budgetTarget.stretch_value,
        stretch_cac_inr: analytics.stretchCac,
      },
      rankings: {
        by_cac_ascending: analytics.byCacAsc.map(m => ({
          name: m.campaign.name,
          cac_inr: m.cac,
          attendees: m.campaign.attendees,
          showup_rate_pct: m.showupRate,
        })),
        worst_showup: analytics.worstShowupCampaign
          ? {
              name: analytics.worstShowupCampaign.campaign.name,
              showup_rate_pct: analytics.worstShowupCampaign.showupRate,
              noshows: analytics.worstShowupCampaign.noShows,
            }
          : null,
      },
      forecast: analytics.forecast,
      strategy_reconciliation: analytics.strategyReconciliation,
      reallocation_suggestion: analytics.reallocationSuggestion
        ? {
            from: analytics.reallocationSuggestion.fromCampaign.campaign.name,
            to: analytics.reallocationSuggestion.toCampaigns.map(c => c.campaign.name),
            shift_inr: analytics.reallocationSuggestion.suggestedShiftAmount,
            lost_attendees: analytics.reallocationSuggestion.estimatedLostAttendees,
            gained_attendees: analytics.reallocationSuggestion.estimatedGainedAttendees,
            net_gain: analytics.reallocationSuggestion.netAttendeeGain,
            new_blended_cac_inr: analytics.reallocationSuggestion.newBlendedCac,
          }
        : null,
    },
    null,
    2
  );

  return `You are the RISA Festival Growth AI Copilot, embedded inside a live growth dashboard.

Your job: interpret questions, explain findings from the deterministic metrics below, recommend actions, and propose tasks — using ONLY the live data and pre-computed TypeScript calculations below.

═══════════════════════════════════════
PRE-COMPUTED DETERMINISTIC ANALYTICS (source of truth)
═══════════════════════════════════════
${deterministicSummary}

CAMPAIGNS:
${campaignsJson}

TARGETS:
${JSON.stringify(targets, null, 2)}

═══════════════════════════════════════
WHAT YOU KNOW (sourced from the data)
═══════════════════════════════════════
- Dataset covers RISA Festival 2025, synthetic data, cleaned and deduplicated.
- "Attendee" = unique external person, admitted AND verified at check-in.
- CAC = spend_inr / attendees. Stretch CAC = ₹3,00,000 / 2,500 = ₹120.
- Show-up rate = attendees / confirmed × 100.
- Walk-ins have no paid campaign, ₹0 spend, CAC = 0; included in total attendees but excluded from paid campaign CAC rankings.
- 5 Growth Strategies gross sum (+1,475) vs Stretch increase (+450) reconciles via multi-touch overlap deduplication and budget/venue capacity limits (2,500 peak).
- Bangalore: 1,148 colleges (AISHE 2023-24). ~5.38L students (C&W/SAPFI 2018-19).
- Data ends 20 April 2025 (event day).

═══════════════════════════════════════
WHAT YOU CANNOT ANSWER (acknowledge missing data explicitly)
═══════════════════════════════════════
- Why any individual attended or cancelled.
- Causal impact of sponsors on attendance.
- Anything after 20 April 2025.
- NPS, satisfaction, ticket pricing tiers, weather, or attendee demographics (age, gender, college major breakdown per attendee) — NOT in dataset.
- Whether the data represents real people or events.
When asked about any unavailable data, explicitly state what is missing from the dataset instead of guessing or fabricating.

═══════════════════════════════════════
RULES
═══════════════════════════════════════
1. Never recalculate or contradict the pre-computed deterministic numbers above.
2. Clearly distinguish ACTUALS, PROJECTIONS, and ASSUMPTIONS (prefix assumptions with "ASSUMPTION:").
3. Show math cleanly when explaining CAC or gaps: e.g. "CAC = ₹93,000 / 340 = ₹274."
4. For campaign diagnosis, always include: CAC, show-up rate, no-shows, and comparison to the lowest-CAC paid channel.
5. Task creation: when proposing a task, end your reply with a fenced block (the UI requires user confirmation before saving):
\`\`\`task
{"title": "...", "description": "...", "owner": "Growth Lead", "priority": "high", "campaign_id": 1}
\`\`\`
6. For follow-up questions, use conversation history AND the current live data (which may have been edited by the user).
7. Be concise and direct.`;
};

const findMentionedCampaign = (
  text: string,
  analytics: DashboardAnalytics
): CampaignMetrics | undefined => {
  const q = text.toLowerCase();
  return analytics.campaignMetrics.find(m => {
    const name = m.campaign.name.toLowerCase();
    const channel = m.campaign.channel_type.toLowerCase();
    if (q.includes(name) || q.includes(channel)) return true;
    if (name.includes('ambassador') && q.includes('ambassador')) return true;
    if (name.includes('paid social') && (q.includes('paid social') || q.includes('meta'))) return true;
    if (name.includes('creator') && (q.includes('creator') || q.includes('influencer'))) return true;
    if (name.includes('college') && (q.includes('college') || q.includes('partnership') || q.includes('club'))) return true;
    if (name.includes('referral') && (q.includes('referral') || q.includes('squad'))) return true;
    if (name.includes('organic') && q.includes('organic')) return true;
    if (name.includes('community') && q.includes('community')) return true;
    if (name.includes('walk') && (q.includes('walk-in') || q.includes('walkin') || q.includes('walk in'))) return true;
    return false;
  });
};

const resolveCampaignFromHistory = (
  query: string,
  history: ChatMessage[],
  analytics: DashboardAnalytics
): CampaignMetrics | undefined => {
  const direct = findMentionedCampaign(query, analytics);
  if (direct) return direct;

  // Check recent turns for follow-ups ("it", "that campaign", "this channel", etc.)
  const isFollowUpRef = /\b(it|its|that|this|they|them|the channel|the campaign|same)\b/i.test(query);
  if (isFollowUpRef) {
    for (let i = history.length - 1; i >= 0; i--) {
      const match = findMentionedCampaign(history[i].content, analytics);
      if (match) return match;
    }
  }
  return undefined;
};

const formatCampaignDiagnosis = (
  m: CampaignMetrics,
  analytics: DashboardAnalytics
): string => {
  const best = analytics.bestCacCampaign;
  const isUnderperforming = m.thresholdRecommendation === 'stop' || m.campaign.recommendation === 'stop';
  const cacComparison =
    best && best.campaign.id !== m.campaign.id && best.cac > 0 && m.cac > 0
      ? ` (${(m.cac / best.cac).toFixed(1)}× higher than lowest-CAC paid channel ${best.campaign.name} at ₹${best.cac})`
      : '';

  if (m.campaign.channel_type === 'walk_in') {
    return `**${m.campaign.name} (ACTUALS):**
- **Admitted Attendees:** ${m.campaign.attendees.toLocaleString('en-IN')}
- **Spend:** ₹${m.campaign.spend_inr.toLocaleString('en-IN')} | **CAC:** ₹${m.cac} (excluded from paid CAC rankings)
- **Status:** Included in total festival admissions (${analytics.totalAttendees.toLocaleString('en-IN')}).`;
  }

  return `**${m.campaign.name} Diagnosis (Live ACTUALS):**
- **CAC:** ₹${m.campaign.spend_inr.toLocaleString('en-IN')} / ${m.campaign.attendees} = **₹${m.cac}**${cacComparison}
- **Show-Up Rate:** ${m.campaign.attendees} / ${m.campaign.confirmed} = **${m.showupRate}%** (Festival avg: ${analytics.avgShowupRate}%)
- **Funnel Drop-off:** ${m.noShows} no-shows and ${m.campaign.cancel_count} cancellations out of ${m.campaign.confirmed} confirmed (${m.regConversionRate}% reg-start completion).
- **Threshold Status:** **${m.thresholdRecommendation.toUpperCase()}**${
    isUnderperforming
      ? ' — High CAC and/or low show-up conversion indicate low attendee intent.'
      : ' — Unit economics are within healthy scaling thresholds.'
  }`;
};

// Deterministic TypeScript engine using live computed analytics & conversation history
export const fallbackChatEngine = (
  userMessage: string,
  campaigns: Campaign[],
  targets: Target[],
  conversationHistory: ChatMessage[] = [],
  dailyMetrics: DailyMetric[] = []
): string => {
  const query = userMessage.toLowerCase().trim();
  const analytics = computeDashboardAnalytics(campaigns, targets, dailyMetrics);
  const {
    totalSpend,
    totalAttendees,
    totalConfirmed,
    totalRegistrations,
    blendedCac,
    avgShowupRate,
    attendeesTarget,
    budgetTarget,
    stretchCac,
    targetGap,
    remainingBudget,
    bestCacCampaign,
    worstCacCampaign,
    worstShowupCampaign,
    forecast,
    strategyReconciliation,
    reallocationSuggestion,
  } = analytics;

  // 0. Greetings & acknowledgements
  if (/^(hi|hey|hello|yo|hiya|good morning|good evening|thanks|thank you|cool|nice|got it)[\s!.]*$/i.test(query)) {
    if (query.includes('thank') || query.includes('cool') || query.includes('nice') || query.includes('got it')) {
      return `Anytime! Ask me about another channel, test a budget reallocation, or propose a growth task.`;
    }
    const gapText =
      targetGap > 0
        ? `closing the ${targetGap}-attendee gap to ${attendeesTarget.revised_goal.toLocaleString('en-IN')}`
        : `maintaining our lead above the ${attendeesTarget.revised_goal.toLocaleString('en-IN')} goal`;
    return `Hey! I'm analyzing live RISA '25 data (${totalAttendees.toLocaleString('en-IN')} admitted, ₹${blendedCac} blended CAC). Ask me about channel CACs, underperforming campaigns, budget reallocation, or ${gapText}.`;
  }

  // 1. Missing / Unanswerable Data Check — explicitly acknowledge missing data
  const missingDataCategories: { triggers: string[]; missing: string }[] = [
    {
      triggers: ['age', 'gender', 'demographic', 'income', 'major', 'department'],
      missing: 'attendee demographics (age, gender, income, or individual major breakdown)',
    },
    {
      triggers: ['nps', 'satisfaction', 'rating', 'feedback', 'sentiment', 'review', 'survey'],
      missing: 'post-event NPS, satisfaction scores, or survey feedback',
    },
    {
      triggers: ['sponsor', 'sponsorship', 'roi of sponsor'],
      missing: 'causal impact of sponsors on attendee turnout',
    },
    {
      triggers: ['weather', 'rain', 'food', 'music genre', 'artist'],
      missing: 'event-day weather, food preferences, or artist-level attribution',
    },
    {
      triggers: ['after april 20', '2026', 'next year', 'post-event'],
      missing: 'any metrics after Event Day (20 April 2025)',
    },
    {
      triggers: ['why did attendee', 'individual', 'specific person', 'real people'],
      missing: 'individual-level reasons for attending/cancelling or real-world identity data (dataset is synthetic)',
    },
  ];

  const matchedMissing = missingDataCategories.find(cat => cat.triggers.some(t => query.includes(t)));
  if (matchedMissing) {
    return `I can't answer that from the dataset — **${matchedMissing.missing}** are not tracked in the RISA 2025 data. I can only analyze campaign spend, funnel counts (impressions, clicks, reg starts, registrations, confirmed, admitted), CAC, show-up rates, targets, and tasks.`;
  }

  // 2. Task Creation (always requires user confirmation via ```task block)
  const asksForTask =
    query.includes('create a task') ||
    query.includes('add a task') ||
    query.includes('suggest a task') ||
    query.includes('make a task') ||
    (query.includes('task') && (query.includes('create') || query.includes('add') || query.includes('propose') || query.includes('draft')));

  if (asksForTask) {
    const referenced = resolveCampaignFromHistory(query, conversationHistory, analytics);
    if (referenced) {
      const actionVerb =
        referenced.thresholdRecommendation === 'stop'
          ? 'Cut / Reallocate'
          : referenced.thresholdRecommendation === 'scale'
          ? 'Scale'
          : 'Optimize';
      const priority = referenced.thresholdRecommendation === 'stop' || referenced.thresholdRecommendation === 'scale' ? 'high' : 'medium';
      const desc =
        referenced.thresholdRecommendation === 'stop'
          ? `${referenced.campaign.name} has CAC ₹${referenced.cac} and ${referenced.showupRate}% show-up (${referenced.noShows} no-shows). Cut spend and reallocate to ${bestCacCampaign?.campaign.name || 'lowest-CAC channels'}.`
          : `${referenced.campaign.name} delivers ${referenced.campaign.attendees} attendees at ₹${referenced.cac} CAC (${referenced.showupRate}% show-up). Expand execution within remaining ₹${remainingBudget.toLocaleString('en-IN')} budget.`;

      return `Based on live metrics for **${referenced.campaign.name}** (CAC ₹${referenced.cac}, ${referenced.showupRate}% show-up), please confirm below to add this task:

\`\`\`task
{"title": "${actionVerb} ${referenced.campaign.name} campaign", "description": "${desc}", "owner": "Growth Lead", "priority": "${priority}", "campaign_id": ${referenced.campaign.id}}
\`\`\``;
    }

    if (query.includes('reminder') || query.includes('whatsapp') || query.includes('show up') || query.includes('show-up') || query.includes('no-show')) {
      return `With **${analytics.totalNoShows} total no-shows** (${(100 - avgShowupRate).toFixed(1)}% drop-off from confirmed), please confirm below to add this reminder task:

\`\`\`task
{"title": "Launch T-7 / T-3 / T-1 Show-up Reminder Sequence", "description": "Target ${analytics.totalNoShows} historical no-show gap across ${totalConfirmed.toLocaleString('en-IN')} confirmed sign-ups using WhatsApp/SMS QR passes.", "owner": "Growth Lead", "priority": "high", "campaign_id": null}
\`\`\``;
    }

    const fallbackTarget = worstCacCampaign || analytics.campaignMetrics[0];
    return `Here is a proposed task based on your current highest-CAC channel (**${fallbackTarget?.campaign.name}** at ₹${fallbackTarget?.cac}). Click **Confirm & Add** to save it:

\`\`\`task
{"title": "Review ${fallbackTarget?.campaign.name || 'Campaign'} unit economics", "description": "Audit ₹${fallbackTarget?.campaign.spend_inr.toLocaleString('en-IN')} spend at ₹${fallbackTarget?.cac} CAC and ${fallbackTarget?.showupRate}% show-up.", "owner": "Growth Lead", "priority": "high", "campaign_id": ${fallbackTarget?.campaign.id ?? 'null'}}
\`\`\``;
  }

  // 3. Budget Reallocation Recommendation (deterministic from live data)
  if (query.includes('reallocat') || query.includes('shift budget') || query.includes('move budget') || (query.includes('budget') && query.includes('recommend'))) {
    if (!reallocationSuggestion) {
      return `No reallocation candidate is currently available because active paid spend is too low to shift.`;
    }
    const { fromCampaign, toCampaigns, suggestedShiftAmount, estimatedLostAttendees, estimatedGainedAttendees, netAttendeeGain, newBlendedCac } = reallocationSuggestion;
    const toNames = toCampaigns.map(c => `${c.campaign.name} (₹${c.cac} CAC)`).join(' and ');
    return `**Deterministic Budget Reallocation Recommendation:**
- **Source (Cut 30%):** **${fromCampaign.campaign.name}** — current CAC ₹${fromCampaign.cac}, ${fromCampaign.showupRate}% show-up (${fromCampaign.noShows} no-shows). Shifting **₹${suggestedShiftAmount.toLocaleString('en-IN')}** reduces it by ~${estimatedLostAttendees} attendees.
- **Destination (Scale):** **${toNames}**.
- **ASSUMPTION (Constant Marginal CAC):** Reallocating ₹${suggestedShiftAmount.toLocaleString('en-IN')} yields ~**${estimatedGainedAttendees} attendees**, for a net gain of **${netAttendeeGain >= 0 ? '+' : ''}${netAttendeeGain} attendees** (new blended CAC: **₹${newBlendedCac}**) with ₹0 added budget.`;
  }

  // 4. Stretch CAC & 5-Strategy Reconciliation
  if (query.includes('stretch') || query.includes('1,475') || query.includes('1475') || query.includes('overlap') || query.includes('dedup')) {
    return `**Stretch Target & Strategy Deduplication Reconciliation:**
- **Stretch CAC (ACTUAL FORMULA):** ₹${budgetTarget.stretch_value.toLocaleString('en-IN')} / ${attendeesTarget.stretch_value.toLocaleString('en-IN')} = **₹${stretchCac}** per attendee.
- **5 Strategies Gross Sum:** +${strategyReconciliation.grossIncrementalSum.toLocaleString('en-IN')} incremental attendees across the 5 growth initiatives.
- **Deduplication & Capacity Cap:** Subtracting **${strategyReconciliation.overlapAndCapacityDeduction.toLocaleString('en-IN')}** (${strategyReconciliation.deduplicationRatePct}%) for multi-touch channel overlap, baseline run-rate overlap, and the ${forecast.capacityCeiling.toLocaleString('en-IN')} venue capacity ceiling reconciles to the **+${strategyReconciliation.stretchTargetIncrease}** net stretch increase (${attendeesTarget.base_value} → ${attendeesTarget.stretch_value}).`;
  }

  // 5. Lowest / Best CAC
  if (query.includes('best cac') || query.includes('lowest cac') || query.includes('cheapest') || query.includes('most cost effective') || query.includes('most efficient')) {
    if (!bestCacCampaign) return `No paid campaigns with positive attendees are available to rank.`;
    const runnerUp = analytics.byCacAsc[1];
    return `Based on live data, **${bestCacCampaign.campaign.name}** has the lowest CAC among paid channels:
- **CAC:** ₹${bestCacCampaign.campaign.spend_inr.toLocaleString('en-IN')} / ${bestCacCampaign.campaign.attendees} = **₹${bestCacCampaign.cac}**
- **Show-up Rate:** ${bestCacCampaign.showupRate}% (${bestCacCampaign.campaign.attendees} / ${bestCacCampaign.campaign.confirmed} confirmed)
${runnerUp ? `- **Runner-up:** ${runnerUp.campaign.name} at **₹${runnerUp.cac}** CAC (${runnerUp.showupRate}% show-up).` : ''}
- *Note: Walk-ins (${analytics.walkInAttendees} attendees, ₹0 spend) are excluded from paid CAC rankings.*`;
  }

  // 6. Worst / Highest CAC or Underperforming Campaigns
  if (query.includes('worst cac') || query.includes('highest cac') || query.includes('most expensive') || query.includes('least efficient') || (query.includes('underperform') && !resolveCampaignFromHistory(query, conversationHistory, analytics))) {
    if (!worstCacCampaign) return `No paid campaigns with positive attendees are available to rank.`;
    return formatCampaignDiagnosis(worstCacCampaign, analytics);
  }

  // 7. Specific Campaign Diagnosis or Follow-up on a Campaign
  const targetCampaign = resolveCampaignFromHistory(query, conversationHistory, analytics);
  if (targetCampaign) {
    return formatCampaignDiagnosis(targetCampaign, analytics);
  }

  // 8. Target Gap, Shortfall & Forecast
  if (query.includes('short') || query.includes('revised goal') || query.includes('target') || query.includes('gap') || query.includes('shortfall') || query.includes('project') || query.includes('forecast') || query.includes('reach')) {
    const pct = attendeesTarget.revised_goal > 0 ? ((totalAttendees / attendeesTarget.revised_goal) * 100).toFixed(1) : '0';
    return `**Live Target & Campaign-Level Forecast:**
- **Actual Admitted:** ${totalAttendees.toLocaleString('en-IN')} (${pct}% of ${attendeesTarget.revised_goal.toLocaleString('en-IN')} goal; gap = **${targetGap > 0 ? targetGap : 0}**)
- **Remaining Budget:** ₹${remainingBudget.toLocaleString('en-IN')} of ₹${budgetTarget.revised_goal.toLocaleString('en-IN')}
- **PROJECTION (ASSUMPTION: Constant Channel CAC):** Deploying remaining ₹${remainingBudget.toLocaleString('en-IN')} across scalable channels projects **${forecast.projectedAttendees.toLocaleString('en-IN')} attendees** (+${forecast.projectedIncremental} incremental${forecast.capacityCapped ? `, capped at ${forecast.capacityCeiling.toLocaleString('en-IN')} venue ceiling` : ''}, projected CAC **₹${forecast.projectedBlendedCac}**).`;
  }

  // 9. Budget & Spend Overview
  if (query.includes('budget') || query.includes('spend') || query.includes('money') || query.includes('cost') || query.includes('cac')) {
    return `**Live Budget & Unit Economics (ACTUALS):**
- **Total Spend:** ₹${totalSpend.toLocaleString('en-IN')} / ₹${budgetTarget.revised_goal.toLocaleString('en-IN')} (${analytics.budgetUtilizationPct}% utilized, ₹${remainingBudget.toLocaleString('en-IN')} remaining)
- **Blended CAC (All):** ₹${totalSpend.toLocaleString('en-IN')} / ${totalAttendees} = **₹${blendedCac}**
- **Paid Blended CAC (Excl. Walk-ins):** ₹${totalSpend.toLocaleString('en-IN')} / ${analytics.paidAttendees} = **₹${analytics.paidBlendedCac}**
- **Stretch Target CAC:** ₹${budgetTarget.stretch_value.toLocaleString('en-IN')} / ${attendeesTarget.stretch_value.toLocaleString('en-IN')} = **₹${stretchCac}**`;
  }

  // 10. Bottlenecks & No-Shows
  if (query.includes('bottleneck') || query.includes('dropout') || query.includes('leak') || query.includes('no-show') || query.includes('noshow') || query.includes('show-up') || query.includes('conversion')) {
    return `**Live Funnel Bottlenecks (ACTUALS):**
- **Confirmed → Admitted:** ${totalConfirmed.toLocaleString('en-IN')} confirmed vs ${analytics.paidAttendees.toLocaleString('en-IN')} paid admitted (**${avgShowupRate}%** show-up; **${analytics.totalNoShows} no-shows**, ${analytics.totalCancels} cancellations).
- **Lowest Show-up Channel:** ${worstShowupCampaign ? `${worstShowupCampaign.campaign.name} at **${worstShowupCampaign.showupRate}%** (${worstShowupCampaign.noShows} no-shows)` : 'N/A'}.
- **Reg Starts → Registrations:** ${totalRegistrations.toLocaleString('en-IN')} / ${analytics.totalRegStarts.toLocaleString('en-IN')} (**${analytics.totalRegStarts > 0 ? ((totalRegistrations / analytics.totalRegStarts) * 100).toFixed(1) : 0}%**).`;
  }

  // 11. General Recommendations
  if (query.includes('recommend') || query.includes('what should we do') || query.includes('scale') || query.includes('stop') || query.includes('strategy')) {
    const scaleList = analytics.campaignMetrics
      .filter(m => m.thresholdRecommendation === 'scale' && m.campaign.spend_inr > 0)
      .map(m => `${m.campaign.name} (₹${m.cac})`)
      .join(', ');
    const stopList = analytics.campaignMetrics
      .filter(m => m.thresholdRecommendation === 'stop')
      .map(m => `${m.campaign.name} (₹${m.cac})`)
      .join(', ');
    return `**Live Recommendations (Rule-Based):**
- **SCALE (CAC < ₹120 & Show-up ≥ 75%):** ${scaleList || 'None'}
- **STOP (CAC > ₹220 or Show-up < 60%):** ${stopList || 'None'}
${reallocationSuggestion ? `- **REALLOCATE:** Shift ₹${reallocationSuggestion.suggestedShiftAmount.toLocaleString('en-IN')} from ${reallocationSuggestion.fromCampaign.campaign.name} to ${reallocationSuggestion.toCampaigns.map(c => c.campaign.name).join(' & ')} for net **+${reallocationSuggestion.netAttendeeGain} attendees**.` : ''}`;
  }

  // 12. Dynamic Comparisons
  if (query.includes('vs') || query.includes('compare')) {
    const matches = analytics.campaignMetrics.filter(m => query.includes(m.campaign.name.toLowerCase()));
    const c1 = matches[0] || analytics.byCacAsc[0];
    const c2 = matches[1] || analytics.byCacDesc[0];
    if (c1 && c2) {
      const cheaper = c1.cac <= c2.cac ? c1 : c2;
      return `**Live Comparison: ${c1.campaign.name} vs ${c2.campaign.name}**
- **${c1.campaign.name}:** Spend ₹${c1.campaign.spend_inr.toLocaleString('en-IN')} | Attendees ${c1.campaign.attendees} | CAC **₹${c1.cac}** | Show-up **${c1.showupRate}%**
- **${c2.campaign.name}:** Spend ₹${c2.campaign.spend_inr.toLocaleString('en-IN')} | Attendees ${c2.campaign.attendees} | CAC **₹${c2.cac}** | Show-up **${c2.showupRate}%**
- **Verdict:** ${cheaper.campaign.name} is **₹${Math.abs(c1.cac - c2.cac)} cheaper per attendee**.`;
    }
  }

  // 13. Website Navigation Guide
  if (query.includes('navigate') || query.includes('tabs') || query.includes('how to use') || query.includes('guide')) {
    return `**Dashboard Navigation:**
1. **DASHBOARD:** Live KPIs (Actuals), Campaign-level Forecast (Projections), Funnel Stages, Constraints, and What-If Simulator.
2. **DIAGNOSIS:** Edit any campaign's spend/attendees and see live CAC, Show-up %, and Threshold alerts.
3. **TASK BOARD:** Manage growth tasks; AI-proposed tasks appear here only after you click **Confirm & Add**.`;
  }

  // 14. Unfamiliar / Unrecognized Question — explicitly acknowledge limitation instead of guessing
  return `I couldn't match **"${userMessage}"** to a specific metric in the RISA 2025 dataset. I only answer from verified live data and don't guess missing information. You can ask me about:
- Lowest or highest CAC campaigns (e.g. *"Which campaign has the lowest CAC?"*)
- Why a channel is underperforming (e.g. *"Why is Paid Social underperforming?"*)
- Budget reallocation or target forecasts (e.g. *"Recommend a budget reallocation"*)
- Creating an action task with confirmation (e.g. *"Create a task to cut Creator Partners"*)`;
};

export interface ChatReply {
  reply: string;
  thought?: string;
}

export const sendChatMessage = async (
  messages: ChatMessage[],
  campaigns: Campaign[],
  targets: Target[],
  sessionId: string,
  dailyMetrics: DailyMetric[] = []
): Promise<ChatReply> => {
  const { url, anonKey, geminiKey } = getStoredConfig();

  // 1. Try Supabase Edge Function first
  if (url && anonKey) {
    try {
      const edgeUrl = `${url.replace(/\/$/, '')}/functions/v1/chat-handler`;
      const res = await fetch(edgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          ...(geminiKey ? { 'x-gemini-key': geminiKey } : {}),
        },
        body: JSON.stringify({
          messages,
          session_id: sessionId,
          campaigns,
          targets,
          dailyMetrics,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) return { reply: data.reply, thought: data.thought };
      }
    } catch (e) {
      console.warn('Edge function not reachable, trying direct Gemini API...', e);
    }
  }

  // 2. Try direct Google Gemini API if Gemini API Key is provided locally
  if (geminiKey) {
    const systemInstruction = buildSystemPrompt(campaigns, targets, dailyMetrics);
    const rawContents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
    const firstUserIdx = rawContents.findIndex(c => c.role === 'user');
    const contents = firstUserIdx >= 0 ? rawContents.slice(firstUserIdx) : rawContents;

    for (const model of ['gemini-2.5-flash', 'gemini-3-flash-preview']) {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const res = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1800,
              thinkingConfig: { thinkingBudget: 1024, includeThoughts: true },
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          const thoughtText = parts.filter((p: any) => p.thought && p.text).map((p: any) => p.text).join('\n').trim();
          const replyText = parts.filter((p: any) => !p.thought && p.text).map((p: any) => p.text).join('').trim();
          if (replyText) return { reply: replyText, thought: thoughtText || undefined };
        }
      } catch (e) {
        console.warn(`Direct Gemini API (${model}) failed:`, e);
      }
    }
  }

  // 3. Deterministic TypeScript Engine (with full conversation history + live data)
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  return {
    reply: fallbackChatEngine(lastUserMsg, campaigns, targets, messages.slice(0, -1), dailyMetrics),
  };
};
