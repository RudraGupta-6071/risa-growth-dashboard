import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_CAMPAIGNS, INITIAL_TARGETS, INITIAL_DAILY_METRICS } from './seedData.ts';
import { computeDashboardAnalytics } from './analytics.ts';
import { fallbackChatEngine } from './gemini.ts';

// Minimal localStorage polyfill for Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
}

test('Baseline analytics: stretch CAC = ₹120, strategy deduplication, and daily reconciliation', () => {
  const analytics = computeDashboardAnalytics(INITIAL_CAMPAIGNS, INITIAL_TARGETS, INITIAL_DAILY_METRICS);

  assert.equal(analytics.totalAttendees, 2050);
  assert.equal(analytics.totalSpend, 274000);
  assert.equal(analytics.stretchCac, 120); // ₹3,00,000 / 2,500 = ₹120
  assert.equal(analytics.blendedCac, 134); // Math.round(274000 / 2050)
  assert.equal(analytics.remainingBudget, 26000);

  // Strategy reconciliation: +1,475 gross vs +450 net stretch
  assert.equal(analytics.strategyReconciliation.grossIncrementalSum, 1475);
  assert.equal(analytics.strategyReconciliation.stretchTargetIncrease, 450);
  assert.equal(analytics.strategyReconciliation.overlapAndCapacityDeduction, 1025);

  // Daily vs Campaign reconciliation
  assert.equal(analytics.reconciliation.dailyBaselineRegistrations, 2800);
  assert.equal(analytics.reconciliation.campaignRegistrations, 2626);
  assert.equal(analytics.reconciliation.registrationVariance, 174);
  assert.equal(analytics.reconciliation.admittedDeltaFromBaseline, 0);

  // Dynamic funnel stages (not hardcoded)
  assert.equal(analytics.funnelStages.length, 5);
  assert.equal(analytics.funnelStages[0].stage, 'Reg Starts');
  assert.equal(analytics.funnelStages[3].actual, 2050);
  assert.notEqual(analytics.funnelStages[3].conversionFromPrevPct, 100);
});

test('Scenario 1: Changing campaign attendees updates all dependent metrics', () => {
  const modified = INITIAL_CAMPAIGNS.map(c =>
    c.id === 1 ? { ...c, attendees: 440 } : c // +100 attendees on Paid Social
  );
  const analytics = computeDashboardAnalytics(modified, INITIAL_TARGETS, INITIAL_DAILY_METRICS);

  assert.equal(analytics.totalAttendees, 2150);
  assert.equal(analytics.targetGap, 50); // 2200 - 2150
  assert.equal(analytics.blendedCac, Math.round(274000 / 2150));

  const paidSocial = analytics.campaignMetrics.find(m => m.campaign.id === 1)!;
  assert.equal(paidSocial.cac, Math.round(93000 / 440)); // 211
  assert.equal(paidSocial.noShows, 580 - 440); // 140
  assert.equal(paidSocial.showupRate, Number(((440 / 580) * 100).toFixed(2)));
  assert.equal(analytics.reconciliation.admittedDeltaFromBaseline, 100);
});

test('Scenario 2: Changing campaign budget recalculates CAC and campaign-level forecast', () => {
  // Increase Campus Ambassadors spend by ₹26,000 (exhausting the ₹3,00,000 budget)
  const modified = INITIAL_CAMPAIGNS.map(c =>
    c.id === 2 ? { ...c, spend_inr: 68000 } : c
  );
  const analytics = computeDashboardAnalytics(modified, INITIAL_TARGETS, INITIAL_DAILY_METRICS);

  assert.equal(analytics.totalSpend, 300000);
  assert.equal(analytics.remainingBudget, 0);
  const ambassadors = analytics.campaignMetrics.find(m => m.campaign.id === 2)!;
  assert.equal(ambassadors.cac, Math.round(68000 / 390)); // 174
  // With ₹0 remaining budget, forecast equals current actuals
  assert.equal(analytics.forecast.projectedAttendees, analytics.totalAttendees);
  assert.equal(analytics.forecast.projectedIncremental, 0);
});

test('Scenario 3: AI identifies lowest-CAC campaign dynamically (even after edits)', () => {
  const reply1 = fallbackChatEngine('Which campaign has the lowest CAC?', INITIAL_CAMPAIGNS, INITIAL_TARGETS);
  assert.match(reply1, /Student Referrals/);
  assert.match(reply1, /₹69/);

  // Now edit Organic Search spend down so its CAC beats Student Referrals
  const modified = INITIAL_CAMPAIGNS.map(c =>
    c.id === 6 ? { ...c, spend_inr: 5000 } : c // 5000 / 195 = ₹26
  );
  const reply2 = fallbackChatEngine('Which campaign has the lowest CAC?', modified, INITIAL_TARGETS);
  assert.match(reply2, /Organic Search/);
  assert.match(reply2, /₹26/);
});

test('Scenario 4: AI diagnoses underperforming campaign and supports follow-up questions', () => {
  const q1 = 'Why is Paid Social underperforming?';
  const r1 = fallbackChatEngine(q1, INITIAL_CAMPAIGNS, INITIAL_TARGETS);
  assert.match(r1, /Paid Social/);
  assert.match(r1, /₹274/);
  assert.match(r1, /58\.62%/);
  assert.match(r1, /STOP/);

  // Follow-up referencing "it"
  const r2 = fallbackChatEngine(
    'Create a task for it',
    INITIAL_CAMPAIGNS,
    INITIAL_TARGETS,
    [
      { role: 'user', content: q1 },
      { role: 'assistant', content: r1 },
    ]
  );
  assert.match(r2, /Paid Social/);
  assert.match(r2, /```task/);
});

test('Scenario 5: AI provides deterministic budget reallocation recommendation', () => {
  const reply = fallbackChatEngine('Recommend a budget reallocation', INITIAL_CAMPAIGNS, INITIAL_TARGETS);
  assert.match(reply, /Creator Partners|Paid Social/);
  assert.match(reply, /ASSUMPTION/);
  assert.match(reply, /₹/);
});

test('Scenario 6: AI task creation emits confirmation block rather than auto-creating', () => {
  const reply = fallbackChatEngine('Create a task to cut Creator Partners budget', INITIAL_CAMPAIGNS, INITIAL_TARGETS);
  assert.match(reply, /```task\s*\{[\s\S]*?"title"[\s\S]*?\}\s*```/);
  assert.match(reply, /Creator Partners/);
});

test('Scenario 7: AI explicitly acknowledges missing/unavailable data without guessing', () => {
  const missingAgeReply = fallbackChatEngine(
    'What is the average age and NPS score of our attendees?',
    INITIAL_CAMPAIGNS,
    INITIAL_TARGETS
  );
  assert.match(missingAgeReply, /can't answer|not tracked|not in/i);

  const unfamiliarReply = fallbackChatEngine(
    'What color were the festival wristbands?',
    INITIAL_CAMPAIGNS,
    INITIAL_TARGETS
  );
  assert.match(unfamiliarReply, /couldn't match|don't guess/i);
});
