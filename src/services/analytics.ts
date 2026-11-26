import { Campaign, DailyMetric, Target } from '../types';

export const VENUE_CAPACITY_CEILING = 2500;

export interface StrategyContribution {
  id: number;
  name: string;
  grossIncremental: number;
  estimatedSpend: number;
  note: string;
}

export const GROWTH_STRATEGIES: StrategyContribution[] = [
  { id: 1, name: 'Campus Ambassador Network', grossIncremental: 420, estimatedSpend: 45000, note: '35 reps across 25 hubs' },
  { id: 2, name: 'College Cultural Club Co-Hosting', grossIncremental: 385, estimatedSpend: 31000, note: 'Semi-finals & bulk contingents' },
  { id: 3, name: 'WhatsApp Peer Referral & Group Pass', grossIncremental: 310, estimatedSpend: 21500, note: 'Squad Pass k=1.24' },
  { id: 4, name: 'High-Intent Retargeting & Waitlist SMS', grossIncremental: 210, estimatedSpend: 15000, note: '28% dropout recapture' },
  { id: 5, name: 'Metro Fast-Track QR & Bus Shuttles', grossIncremental: 150, estimatedSpend: 12500, note: 'Purple Line shuttle & 6 lanes' },
];

export interface CampaignMetrics {
  campaign: Campaign;
  cac: number;
  showupRate: number;
  regConversionRate: number;
  clickToRegRate: number;
  noShows: number;
  thresholdRecommendation: 'scale' | 'change' | 'stop';
}

export interface CampaignForecastItem {
  campaignId: number;
  name: string;
  allocatedBudget: number;
  expectedCac: number;
  showupRate: number;
  projectedIncrementalAttendees: number;
}

export interface FunnelStage {
  stage: string;
  actual: number;
  conversionFromPrevPct: number | null;
  kind: 'actual' | 'goal';
}

export interface ReconciliationSummary {
  dailyBaselineDate: string | null;
  dailyBaselineRegistrations: number;
  campaignRegistrations: number;
  registrationVariance: number;
  dailyBaselineConfirmed: number;
  campaignConfirmed: number;
  confirmedVariance: number;
  dailyBaselineAdmitted: number;
  campaignAdmitted: number;
  admittedDeltaFromBaseline: number;
  dailyBaselineSpend: number;
  campaignSpend: number;
  spendDeltaFromBaseline: number;
}

export interface StrategyReconciliation {
  strategies: StrategyContribution[];
  grossIncrementalSum: number;
  stretchTargetIncrease: number;
  overlapAndCapacityDeduction: number;
  deduplicationRatePct: number;
}

export interface ReallocationRecommendation {
  fromCampaign: CampaignMetrics;
  toCampaigns: CampaignMetrics[];
  suggestedShiftAmount: number;
  estimatedLostAttendees: number;
  estimatedGainedAttendees: number;
  netAttendeeGain: number;
  newBlendedCac: number;
}

export interface DashboardAnalytics {
  campaignMetrics: CampaignMetrics[];
  paidCampaigns: CampaignMetrics[];
  byCacAsc: CampaignMetrics[];
  byCacDesc: CampaignMetrics[];
  byShowupAsc: CampaignMetrics[];
  byShowupDesc: CampaignMetrics[];
  bestCacCampaign: CampaignMetrics | null;
  worstCacCampaign: CampaignMetrics | null;
  worstShowupCampaign: CampaignMetrics | null;

  totalSpend: number;
  totalAttendees: number;
  walkInAttendees: number;
  paidAttendees: number;
  totalImpressions: number;
  totalClicks: number;
  totalRegStarts: number;
  totalRegistrations: number;
  totalConfirmed: number;
  totalNoShows: number;
  totalCancels: number;

  blendedCac: number;
  paidBlendedCac: number;
  avgShowupRate: number;

  attendeesTarget: Target;
  registrationsTarget: Target;
  confirmedTarget: Target;
  budgetTarget: Target;

  stretchCac: number;
  targetCac: number;
  targetGap: number;
  remainingBudget: number;
  overBudget: number;
  budgetUtilizationPct: number;

  funnelStages: FunnelStage[];
  forecast: {
    projectedAttendees: number;
    projectedAttendeesUncapped: number;
    projectedIncremental: number;
    remainingBudgetUsed: number;
    capacityCeiling: number;
    capacityCapped: boolean;
    projectedBlendedCac: number;
    breakdown: CampaignForecastItem[];
  };
  reconciliation: ReconciliationSummary;
  strategyReconciliation: StrategyReconciliation;
  reallocationSuggestion: ReallocationRecommendation | null;
}

export const evaluateThreshold = (
  c: Pick<Campaign, 'spend_inr'>,
  cac: number,
  showupRate: number
): 'scale' | 'change' | 'stop' => {
  if (c.spend_inr === 0) return 'scale';
  if (cac > 220 || (showupRate > 0 && showupRate < 60)) return 'stop';
  if (cac >= 120 || (showupRate > 0 && showupRate < 75)) return 'change';
  return 'scale';
};

export const getCampaignMetrics = (c: Campaign): CampaignMetrics => {
  const cac = c.attendees > 0 ? Math.round(c.spend_inr / c.attendees) : 0;
  const showupRate = c.confirmed > 0 ? Number(((c.attendees / c.confirmed) * 100).toFixed(2)) : 0;
  const regConversionRate = c.reg_starts > 0 ? Number(((c.registrations / c.reg_starts) * 100).toFixed(1)) : 0;
  const clickToRegRate = c.clicks > 0 ? Number(((c.registrations / c.clicks) * 100).toFixed(1)) : 0;
  const noShows = Math.max(0, c.confirmed - c.attendees);
  const thresholdRecommendation = evaluateThreshold(c, cac, showupRate);

  return {
    campaign: {
      ...c,
      cac_inr: cac,
      showup_rate: showupRate,
      noshow_count: noShows,
    },
    cac,
    showupRate,
    regConversionRate,
    clickToRegRate,
    noShows,
    thresholdRecommendation,
  };
};

export const computeDashboardAnalytics = (
  campaigns: Campaign[],
  targets: Target[],
  dailyMetrics: DailyMetric[] = []
): DashboardAnalytics => {
  const campaignMetrics = campaigns.map(getCampaignMetrics);
  const paidCampaigns = campaignMetrics.filter(m => m.campaign.spend_inr > 0);
  const nonWalkInCampaigns = campaignMetrics.filter(m => m.campaign.channel_type !== 'walk_in');

  const withPositiveCac = paidCampaigns.filter(m => m.campaign.attendees > 0);
  const byCacAsc = [...withPositiveCac].sort((a, b) => a.cac - b.cac);
  const byCacDesc = [...withPositiveCac].sort((a, b) => b.cac - a.cac);
  const byShowupAsc = [...nonWalkInCampaigns].sort((a, b) => a.showupRate - b.showupRate);
  const byShowupDesc = [...nonWalkInCampaigns].sort((a, b) => b.showupRate - a.showupRate);

  const totalSpend = campaigns.reduce((s, c) => s + c.spend_inr, 0);
  const totalAttendees = campaigns.reduce((s, c) => s + c.attendees, 0);
  const walkInAttendees = campaigns
    .filter(c => c.channel_type === 'walk_in')
    .reduce((s, c) => s + c.attendees, 0);
  const paidAttendees = Math.max(0, totalAttendees - walkInAttendees);

  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalRegStarts = campaigns.reduce((s, c) => s + c.reg_starts, 0);
  const totalRegistrations = campaigns.reduce((s, c) => s + c.registrations, 0);
  const totalConfirmed = campaigns.reduce((s, c) => s + c.confirmed, 0);
  const totalNoShows = nonWalkInCampaigns.reduce((s, m) => s + m.noShows, 0);
  const totalCancels = campaigns.reduce((s, c) => s + c.cancel_count, 0);

  const blendedCac = totalAttendees > 0 ? Math.round(totalSpend / totalAttendees) : 0;
  const paidBlendedCac = paidAttendees > 0 ? Math.round(totalSpend / paidAttendees) : 0;

  const nonWalkInAttendees = nonWalkInCampaigns.reduce((s, m) => s + m.campaign.attendees, 0);
  const nonWalkInConfirmed = nonWalkInCampaigns.reduce((s, m) => s + m.campaign.confirmed, 0);
  const avgShowupRate =
    nonWalkInConfirmed > 0 ? Number(((nonWalkInAttendees / nonWalkInConfirmed) * 100).toFixed(1)) : 0;

  const attendeesTarget: Target = targets.find(t => t.metric === 'attendees') || {
    id: 4,
    metric: 'attendees',
    base_value: 2050,
    stretch_value: 2500,
    revised_goal: 2200,
    unit: 'people',
  };
  const registrationsTarget: Target = targets.find(t => t.metric === 'registrations') || {
    id: 2,
    metric: 'registrations',
    base_value: 2800,
    stretch_value: 3067,
    revised_goal: 3200,
    unit: 'registrations',
  };
  const confirmedTarget: Target = targets.find(t => t.metric === 'confirmed') || {
    id: 3,
    metric: 'confirmed',
    base_value: 2500,
    stretch_value: 2740,
    revised_goal: 2800,
    unit: 'confirmed',
  };
  const budgetTarget: Target = targets.find(t => t.metric === 'budget_inr') || {
    id: 5,
    metric: 'budget_inr',
    base_value: 274000,
    stretch_value: 300000,
    revised_goal: 300000,
    unit: 'INR',
  };

  // Stretch CAC: ₹3,00,000 / 2,500 = ₹120
  const stretchCac =
    attendeesTarget.stretch_value > 0
      ? Math.round(budgetTarget.stretch_value / attendeesTarget.stretch_value)
      : 0;
  const targetCac =
    attendeesTarget.revised_goal > 0
      ? Math.round(budgetTarget.revised_goal / attendeesTarget.revised_goal)
      : 0;

  const targetGap = attendeesTarget.revised_goal - totalAttendees;
  const remainingBudget = Math.max(0, budgetTarget.revised_goal - totalSpend);
  const overBudget = Math.max(0, totalSpend - budgetTarget.revised_goal);
  const budgetUtilizationPct =
    budgetTarget.revised_goal > 0 ? Math.round((totalSpend / budgetTarget.revised_goal) * 100) : 0;

  // Dynamic Funnel Stages (derived from live campaign sums + target goal)
  const funnelStages: FunnelStage[] = [
    {
      stage: 'Reg Starts',
      actual: totalRegStarts,
      conversionFromPrevPct: null,
      kind: 'actual',
    },
    {
      stage: 'Registrations',
      actual: totalRegistrations,
      conversionFromPrevPct:
        totalRegStarts > 0 ? Number(((totalRegistrations / totalRegStarts) * 100).toFixed(1)) : 0,
      kind: 'actual',
    },
    {
      stage: 'Confirmed',
      actual: totalConfirmed,
      conversionFromPrevPct:
        totalRegistrations > 0 ? Number(((totalConfirmed / totalRegistrations) * 100).toFixed(1)) : 0,
      kind: 'actual',
    },
    {
      stage: 'Admitted (incl. Walk-ins)',
      actual: totalAttendees,
      conversionFromPrevPct:
        totalConfirmed > 0 ? Number(((totalAttendees / totalConfirmed) * 100).toFixed(1)) : 0,
      kind: 'actual',
    },
    {
      stage: 'Revised Goal',
      actual: attendeesTarget.revised_goal,
      conversionFromPrevPct:
        attendeesTarget.revised_goal > 0
          ? Number(((totalAttendees / attendeesTarget.revised_goal) * 100).toFixed(1))
          : 0,
      kind: 'goal',
    },
  ];

  // Campaign-level Forecast using remaining budget, expected CAC, show-up rates, and capacity constraints
  const scalablePaid = byCacAsc.filter(
    m => m.campaign.recommendation === 'scale' || m.thresholdRecommendation === 'scale'
  );
  const forecastPool = scalablePaid.length > 0 ? scalablePaid : byCacAsc;

  let forecastBreakdown: CampaignForecastItem[] = [];
  let rawIncremental = 0;

  if (remainingBudget > 0 && forecastPool.length > 0) {
    const inverseCacSum = forecastPool.reduce((s, m) => s + (m.cac > 0 ? 1 / m.cac : 0), 0);
    forecastBreakdown = forecastPool.map(m => {
      const weight = inverseCacSum > 0 && m.cac > 0 ? (1 / m.cac) / inverseCacSum : 1 / forecastPool.length;
      const allocatedBudget = Math.round(remainingBudget * weight);
      // Expected CAC incorporates live CAC; incremental attendees = allocatedBudget / expectedCac
      const expectedCac = m.cac > 0 ? m.cac : blendedCac || 120;
      const projectedIncrementalAttendees = Math.floor(allocatedBudget / expectedCac);
      rawIncremental += projectedIncrementalAttendees;

      return {
        campaignId: m.campaign.id,
        name: m.campaign.name,
        allocatedBudget,
        expectedCac,
        showupRate: m.showupRate,
        projectedIncrementalAttendees,
      };
    });
  }

  const capacityCeiling = Math.max(VENUE_CAPACITY_CEILING, attendeesTarget.stretch_value || VENUE_CAPACITY_CEILING);
  const projectedAttendeesUncapped = totalAttendees + rawIncremental;
  const projectedAttendees = Math.min(capacityCeiling, projectedAttendeesUncapped);
  const capacityCapped = projectedAttendeesUncapped > capacityCeiling;
  const projectedTotalSpend = totalSpend + remainingBudget;
  const projectedBlendedCac =
    projectedAttendees > 0 ? Math.round(projectedTotalSpend / projectedAttendees) : 0;

  // Reconciliation between live campaign totals and historical daily metrics
  const sortedDaily = [...dailyMetrics].sort((a, b) => a.metric_date.localeCompare(b.metric_date));
  const latestDaily = sortedDaily.length > 0 ? sortedDaily[sortedDaily.length - 1] : null;

  const reconciliation: ReconciliationSummary = {
    dailyBaselineDate: latestDaily?.metric_date ?? null,
    dailyBaselineRegistrations: latestDaily?.registrations ?? 0,
    campaignRegistrations: totalRegistrations,
    registrationVariance: (latestDaily?.registrations ?? 0) - totalRegistrations,
    dailyBaselineConfirmed: latestDaily?.confirmed ?? 0,
    campaignConfirmed: totalConfirmed,
    confirmedVariance: (latestDaily?.confirmed ?? 0) - totalConfirmed,
    dailyBaselineAdmitted: latestDaily?.admitted ?? 0,
    campaignAdmitted: totalAttendees,
    admittedDeltaFromBaseline: totalAttendees - (latestDaily?.admitted ?? 0),
    dailyBaselineSpend: latestDaily?.spend_inr ?? 0,
    campaignSpend: totalSpend,
    spendDeltaFromBaseline: totalSpend - (latestDaily?.spend_inr ?? 0),
  };

  // Strategy Overlap & Deduplication Reconciliation (+1,475 gross vs +450 net stretch)
  const grossIncrementalSum = GROWTH_STRATEGIES.reduce((s, st) => s + st.grossIncremental, 0);
  const stretchTargetIncrease = Math.max(0, attendeesTarget.stretch_value - attendeesTarget.base_value);
  const overlapAndCapacityDeduction = Math.max(0, grossIncrementalSum - stretchTargetIncrease);
  const deduplicationRatePct =
    grossIncrementalSum > 0 ? Number(((overlapAndCapacityDeduction / grossIncrementalSum) * 100).toFixed(1)) : 0;

  const strategyReconciliation: StrategyReconciliation = {
    strategies: GROWTH_STRATEGIES,
    grossIncrementalSum,
    stretchTargetIncrease,
    overlapAndCapacityDeduction,
    deduplicationRatePct,
  };

  // Deterministic Reallocation Recommendation (from highest-CAC 'stop' channel to lowest-CAC 'scale' channels)
  let reallocationSuggestion: ReallocationRecommendation | null = null;
  const stopOrWorst = byCacDesc.find(m => m.thresholdRecommendation === 'stop' || m.campaign.recommendation === 'stop') || byCacDesc[0];
  const scaleTargets = byCacAsc.filter(m => m.campaign.id !== stopOrWorst?.campaign.id && m.cac > 0).slice(0, 2);

  if (stopOrWorst && scaleTargets.length > 0 && stopOrWorst.campaign.spend_inr >= 10000) {
    // Suggest shifting 30% of the underperforming channel's spend (rounded to nearest ₹1,000)
    const suggestedShiftAmount = Math.round((stopOrWorst.campaign.spend_inr * 0.3) / 1000) * 1000;
    if (suggestedShiftAmount > 0 && stopOrWorst.cac > 0) {
      const estimatedLostAttendees = Math.floor(suggestedShiftAmount / stopOrWorst.cac);
      const avgTargetCac =
        scaleTargets.reduce((s, m) => s + m.cac, 0) / scaleTargets.length;
      const estimatedGainedAttendees = avgTargetCac > 0 ? Math.floor(suggestedShiftAmount / avgTargetCac) : 0;
      const netAttendeeGain = estimatedGainedAttendees - estimatedLostAttendees;
      const newTotalAttendees = totalAttendees + netAttendeeGain;
      const newBlendedCac = newTotalAttendees > 0 ? Math.round(totalSpend / newTotalAttendees) : blendedCac;

      reallocationSuggestion = {
        fromCampaign: stopOrWorst,
        toCampaigns: scaleTargets,
        suggestedShiftAmount,
        estimatedLostAttendees,
        estimatedGainedAttendees,
        netAttendeeGain,
        newBlendedCac,
      };
    }
  }

  return {
    campaignMetrics,
    paidCampaigns,
    byCacAsc,
    byCacDesc,
    byShowupAsc,
    byShowupDesc,
    bestCacCampaign: byCacAsc[0] || null,
    worstCacCampaign: byCacDesc[0] || null,
    worstShowupCampaign: byShowupAsc[0] || null,

    totalSpend,
    totalAttendees,
    walkInAttendees,
    paidAttendees,
    totalImpressions,
    totalClicks,
    totalRegStarts,
    totalRegistrations,
    totalConfirmed,
    totalNoShows,
    totalCancels,

    blendedCac,
    paidBlendedCac,
    avgShowupRate,

    attendeesTarget,
    registrationsTarget,
    confirmedTarget,
    budgetTarget,

    stretchCac,
    targetCac,
    targetGap,
    remainingBudget,
    overBudget,
    budgetUtilizationPct,

    funnelStages,
    forecast: {
      projectedAttendees,
      projectedAttendeesUncapped,
      projectedIncremental: Math.max(0, projectedAttendees - totalAttendees),
      remainingBudgetUsed: remainingBudget,
      capacityCeiling,
      capacityCapped,
      projectedBlendedCac,
      breakdown: forecastBreakdown,
    },
    reconciliation,
    strategyReconciliation,
    reallocationSuggestion,
  };
};
