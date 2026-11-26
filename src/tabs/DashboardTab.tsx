import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  AlertCircle,
  Sliders,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Campaign, Target, DailyMetric } from '../types';

interface DashboardTabProps {
  campaigns: Campaign[];
  targets: Target[];
  dailyMetrics: DailyMetric[];
  loading: boolean;
  error?: string | null;
  lastUpdated: Date;
  onRefresh: () => void;
  onUpdateTarget?: (metric: string, revisedGoal: number) => Promise<void>;
  onApplyReallocation?: (
    fromId: number,
    fromNewSpend: number,
    fromNewAttendees: number,
    toId: number,
    toNewSpend: number,
    toNewAttendees: number
  ) => Promise<void>;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  campaigns,
  targets,
  dailyMetrics,
  loading,
  error,
  lastUpdated,
  onRefresh,
  onUpdateTarget,
  onApplyReallocation
}) => {
  const [editingConstraints, setEditingConstraints] = useState(false);
  const [goalInput, setGoalInput] = useState<number>(2200);
  const [budgetInput, setBudgetInput] = useState<number>(300000);
  const [savingConstraints, setSavingConstraints] = useState(false);
  const [shiftAmount, setShiftAmount] = useState<number>(28000);
  const [applyingShift, setApplyingShift] = useState(false);

  const attendeesTargetObj = targets.find(t => t.metric === 'attendees');
  const budgetTargetObj = targets.find(t => t.metric === 'budget_inr');

  useEffect(() => {
    if (attendeesTargetObj) setGoalInput(attendeesTargetObj.revised_goal);
    if (budgetTargetObj) setBudgetInput(budgetTargetObj.revised_goal);
  }, [attendeesTargetObj, budgetTargetObj]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[#C4ABA1]">
        <div className="w-8 h-8 border-2 border-[#F6C445] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-bold uppercase tracking-wider">Loading metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#381B16] border border-[#F87171]/40 rounded-3xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-[#F87171] mx-auto mb-2" />
        <h3 className="text-base font-bold text-[#FFFFFF] mb-1">Failed to load live metrics</h3>
        <p className="text-xs text-[#C4ABA1] mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="px-5 py-2 bg-[#F6C445] text-[#140A09] text-xs font-black rounded-full hover:bg-[#FDE047]"
        >
          RETRY
        </button>
      </div>
    );
  }

  // 1. Calculations
  const totalAttendees = campaigns.reduce((acc, c) => acc + c.attendees, 0);
  const totalRegistrations = campaigns.reduce((acc, c) => acc + c.registrations, 0);
  const totalConfirmed = campaigns.reduce((acc, c) => acc + c.confirmed, 0);
  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend_inr, 0);

  const attendeesTarget = targets.find(t => t.metric === 'attendees') || {
    base_value: 2050,
    stretch_value: 2500,
    revised_goal: 2200
  };
  const registrationsTarget = targets.find(t => t.metric === 'registrations') || {
    base_value: 2800,
    stretch_value: 3067,
    revised_goal: 3200
  };
  const budgetTarget = targets.find(t => t.metric === 'budget_inr') || {
    base_value: 274000,
    stretch_value: 300000,
    revised_goal: 300000
  };

  const blendedCac = totalAttendees > 0 ? Math.round(totalSpend / totalAttendees) : 0;

  const nonWalkInCampaigns = campaigns.filter(c => c.channel_type !== 'walk_in');
  const nonWalkInAttendees = nonWalkInCampaigns.reduce((sum, c) => sum + c.attendees, 0);
  const nonWalkInConfirmed = nonWalkInCampaigns.reduce((sum, c) => sum + c.confirmed, 0);
  const avgShowupRate = nonWalkInConfirmed > 0 ? Number(((nonWalkInAttendees / nonWalkInConfirmed) * 100).toFixed(1)) : 0;

  const budgetUsedPct = budgetTarget.revised_goal > 0 ? totalSpend / budgetTarget.revised_goal : 0.91;
  const stretchDelta = (attendeesTarget.stretch_value || 2500) - (attendeesTarget.base_value || 2050);
  const projectedAttendees = Math.round(totalAttendees + stretchDelta * (1 - budgetUsedPct * 0.3));

  // Funnel Data
  const funnelData = [
    { stage: 'Identified', actual: 2050 },
    { stage: 'Registrations', actual: totalRegistrations },
    { stage: 'Confirmed', actual: totalConfirmed },
    { stage: 'Admitted', actual: totalAttendees },
    { stage: 'Revised Goal', actual: attendeesTarget.revised_goal },
  ];

  // Budget calculations
  const budgetMax = 300000;
  const spendPct = Math.min(100, Math.round((totalSpend / budgetMax) * 100));
  const remainingSpend = Math.max(0, budgetMax - totalSpend);

  return (
    <div className="space-y-8">
      {/* SECTION 1: 3 Hero KPI Cards (Rounded-3xl corners matching template) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Attendees */}
        <div className="bg-[#2B1613] border border-[#3E201B] p-7 rounded-3xl flex flex-col justify-between items-center text-center shadow-xl hover:border-[#F6C445]/40 transition-all">
          <div>
            <span className="text-[11px] font-bold text-[#C4ABA1] tracking-widest uppercase">
              ATTENDEE METRIC
            </span>
            <div className="text-[10px] text-[#F6C445] font-black tracking-wider uppercase mt-1">
              TOTAL VERIFIED ADMITTED
            </div>
          </div>
          <div className="my-5 text-4xl lg:text-5xl font-black text-[#F6C445] tracking-tight">
            {totalAttendees.toLocaleString('en-IN')}
          </div>
          <button className="px-6 py-2 bg-[#F6C445] text-[#140A09] font-black text-[11px] tracking-wider uppercase rounded-full shadow hover:bg-[#FDE047] transition-colors">
            TARGET: {attendeesTarget.revised_goal.toLocaleString('en-IN')}
          </button>
        </div>

        {/* Card 2: Inverted Middle Card (Rounded-3xl & Highlighted) */}
        <div className="bg-[#F6C445] border border-[#F6C445] p-7 rounded-3xl flex flex-col justify-between items-center text-center shadow-2xl scale-[1.02]">
          <div>
            <span className="text-[11px] font-black text-[#140A09]/75 tracking-widest uppercase">
              UNIT ECONOMICS
            </span>
            <div className="text-[10px] text-[#140A09] font-black tracking-wider uppercase mt-1">
              BLENDED CAC (SPEND ÷ ATTENDEES)
            </div>
          </div>
          <div className="my-5 text-4xl lg:text-5xl font-black text-[#140A09] tracking-tight">
            ₹{blendedCac}
          </div>
          <button className="px-6 py-2 bg-[#140A09] text-[#F6C445] font-black text-[11px] tracking-wider uppercase rounded-full shadow hover:bg-[#281512] transition-colors">
            OPTIMAL &lt; ₹150
          </button>
        </div>

        {/* Card 3: Total Spend */}
        <div className="bg-[#2B1613] border border-[#3E201B] p-7 rounded-3xl flex flex-col justify-between items-center text-center shadow-xl hover:border-[#F6C445]/40 transition-all">
          <div>
            <span className="text-[11px] font-bold text-[#C4ABA1] tracking-widest uppercase">
              BUDGET UTILIZATION
            </span>
            <div className="text-[10px] text-[#F6C445] font-black tracking-wider uppercase mt-1">
              CUMULATIVE CAMPAIGN SPEND
            </div>
          </div>
          <div className="my-5 text-4xl lg:text-5xl font-black text-[#F6C445] tracking-tight">
            ₹{(totalSpend / 100000).toFixed(2)}L
          </div>
          <button className="px-6 py-2 bg-[#F6C445] text-[#140A09] font-black text-[11px] tracking-wider uppercase rounded-full shadow hover:bg-[#FDE047] transition-colors">
            MAX: ₹3.00L
          </button>
        </div>
      </div>

      {/* Secondary Metrics Bar (Rounded-2xl pills) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1C0E0C] border border-[#381B16] px-5 py-3.5 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-bold text-[#C4ABA1] uppercase">Registrations</span>
          <span className="text-sm font-black text-[#FFFFFF]">
            {totalRegistrations.toLocaleString('en-IN')}{' '}
            <span className="text-[11px] text-[#F6C445] font-bold">/ 3,200</span>
          </span>
        </div>
        <div className="bg-[#1C0E0C] border border-[#381B16] px-5 py-3.5 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-bold text-[#C4ABA1] uppercase">Avg Show-Up Rate</span>
          <span className="text-sm font-black text-[#34D399]">{avgShowupRate}%</span>
        </div>
        <div className="bg-[#1C0E0C] border border-[#381B16] px-5 py-3.5 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-bold text-[#C4ABA1] uppercase">Projected Attendees</span>
          <span className="text-sm font-black text-[#F6C445]">{projectedAttendees}</span>
        </div>
      </div>

      {/* SECTION 2: Central Wave Chart (Rounded-3xl container) */}
      <div className="bg-[#2B1613] border border-[#3E201B] p-6 lg:p-8 rounded-3xl shadow-xl">
        {/* Section Header with Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#FFFFFF] uppercase">
            <span>PRE-EVENT FUNNEL TRAJECTORY</span>
            <ChevronRight className="w-4 h-4 text-[#F6C445]" />
            <span className="text-[#C4ABA1]">CUMULATIVE SIGN-UPS VS EVENT DAY (20 APR 2025)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-[#FFFFFF]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF]" /> Registrations
            </span>
            <span className="flex items-center gap-1.5 text-[#34D399]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" /> Confirmed
            </span>
            <span className="flex items-center gap-1.5 text-[#F6C445]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F6C445]" /> Admitted (Gate)
            </span>
          </div>
        </div>

        {/* Monotone Area Chart (never overshoots below 0) */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyMetrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="regWave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="confWave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="yellowWave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F6C445" stopOpacity={0.85} />
                  <stop offset="95%" stopColor="#F6C445" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#3E201B" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="metric_date"
                stroke="#C4ABA1"
                fontSize={10}
                tickLine={false}
                tickFormatter={val => val.substring(5)}
              />
              <YAxis
                stroke="#C4ABA1"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 3000]}
                ticks={[0, 500, 1000, 1500, 2000, 2500, 3000]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#140A09',
                  borderColor: '#F6C445',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  borderRadius: '16px'
                }}
              />
              <Area
                type="monotone"
                dataKey="registrations"
                name="Cumulative Registrations"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#regWave)"
              />
              <Area
                type="monotone"
                dataKey="confirmed"
                name="Cumulative Confirmed"
                stroke="#34D399"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#confWave)"
              />
              <Area
                type="monotone"
                dataKey="admitted"
                name="Event-Day Admitted"
                stroke="#F6C445"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#yellowWave)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3: Bottom 3-Card Row (Rounded-3xl widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Conversion Funnel Stages */}
        <div className="bg-[#2B1613] border border-[#3E201B] p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-[#FFFFFF] tracking-wider mb-4">
            <span className="text-[#F6C445]">01.</span>
            <span>FUNNEL CONVERSION STAGES</span>
          </div>
          <div className="space-y-3 text-xs">
            {funnelData.map((f, i) => (
              <div key={i} className="flex items-center justify-between pb-2 border-b border-[#3E201B]">
                <span className="text-[#C4ABA1] font-semibold">{f.stage}</span>
                <span className="font-black text-[#F6C445]">{f.actual.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-2 text-[10px] text-[#C4ABA1] text-center font-bold uppercase">
            Identified → Admitted: 100%
          </div>
        </div>

        {/* Widget 2: Budget Burn Meter */}
        <div className="bg-[#2B1613] border border-[#3E201B] p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-[#FFFFFF] tracking-wider mb-4">
            <span className="text-[#F6C445]">02.</span>
            <span>BUDGET BURN METRICS</span>
          </div>

          <div className="space-y-4 my-auto">
            <div>
              <div className="flex justify-between text-xs mb-1 text-[#C4ABA1] font-bold">
                <span>CAPITAL COMMITTED</span>
                <span className="text-[#F6C445] font-black">{spendPct}%</span>
              </div>
              <div className="w-full bg-[#140A09] h-3.5 overflow-hidden border border-[#3E201B] rounded-full p-0.5">
                <div
                  className="bg-[#F6C445] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${spendPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 text-[#C4ABA1] font-bold">
                <span>SAFETY BUFFER</span>
                <span className="text-[#34D399] font-black">{100 - spendPct}%</span>
              </div>
              <div className="w-full bg-[#140A09] h-3.5 overflow-hidden border border-[#3E201B] rounded-full p-0.5">
                <div
                  className="bg-[#34D399] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${100 - spendPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 flex justify-between text-[11px] text-[#C4ABA1] border-t border-[#3E201B] font-bold">
            <span>SPENT: ₹{(totalSpend / 1000).toFixed(0)}K</span>
            <span className="text-[#FFFFFF] font-black">LEFT: ₹{(remainingSpend / 1000).toFixed(0)}K</span>
          </div>
        </div>

        {/* Widget 3: Key Ratio Gauges */}
        <div className="bg-[#2B1613] border border-[#3E201B] p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-[#FFFFFF] tracking-wider mb-4">
            <span className="text-[#F6C445]">03.</span>
            <span>CORE RATIO AUDIT</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-auto text-center">
            <div className="p-4 bg-[#1C0E0C] border border-[#3E201B] rounded-2xl">
              <div className="text-2xl font-black text-[#34D399]">
                {avgShowupRate}%
              </div>
              <div className="text-[10px] text-[#C4ABA1] uppercase font-bold mt-1">
                SHOW-UP
              </div>
            </div>

            <div className="p-4 bg-[#1C0E0C] border border-[#3E201B] rounded-2xl">
              <div className="text-2xl font-black text-[#F6C445]">
                {((totalAttendees / attendeesTarget.revised_goal) * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-[#C4ABA1] uppercase font-bold mt-1">
                GOAL MET
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 text-[10px] text-[#C4ABA1] text-center font-bold uppercase border-t border-[#3E201B]">
            STATUS: ACTIVE DEMO EVALUATION
          </div>
        </div>
      </div>

      {/* SECTION 4: Interactive Constraints & What-If Budget Reallocation Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editable Constraints Panel */}
        <div className="bg-[#2B1613] border border-[#3E201B] p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-[#FFFFFF] tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-[#F6C445]" />
              <span>LIVE CONSTRAINTS (BUDGET & GOAL)</span>
            </div>
            {!editingConstraints ? (
              <button
                onClick={() => setEditingConstraints(true)}
                className="text-[11px] font-black text-[#F6C445] bg-[#1C0E0C] hover:bg-[#381D19] border border-[#3E201B] px-3 py-1 rounded-full transition-colors"
              >
                EDIT CONSTRAINTS
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={savingConstraints}
                  onClick={async () => {
                    if (!onUpdateTarget) return;
                    setSavingConstraints(true);
                    try {
                      await onUpdateTarget('attendees', Math.max(100, Number(goalInput)));
                      await onUpdateTarget('budget_inr', Math.max(10000, Number(budgetInput)));
                      setEditingConstraints(false);
                    } finally {
                      setSavingConstraints(false);
                    }
                  }}
                  className="p-1.5 rounded-full bg-[#34D399]/20 text-[#34D399] hover:bg-[#34D399]/30"
                  title="Save constraints"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={savingConstraints}
                  onClick={() => setEditingConstraints(false)}
                  className="p-1.5 rounded-full bg-[#F87171]/20 text-[#F87171] hover:bg-[#F87171]/30"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#1C0E0C] border border-[#3E201B] rounded-2xl">
              <div className="text-[10px] font-bold text-[#C4ABA1] uppercase mb-1">Attendee Target</div>
              {editingConstraints ? (
                <input
                  type="number"
                  value={goalInput}
                  onChange={e => setGoalInput(Number(e.target.value))}
                  className="w-full bg-[#140A09] border border-[#F6C445] rounded-xl px-2.5 py-1.5 text-sm font-black text-[#FFFFFF] focus:outline-none"
                />
              ) : (
                <div className="text-xl font-black text-[#F6C445]">{attendeesTarget.revised_goal.toLocaleString('en-IN')}</div>
              )}
              <div className="text-[10px] text-[#C4ABA1] mt-1">
                Gap: <span className="font-bold text-[#FFFFFF]">{Math.max(0, attendeesTarget.revised_goal - totalAttendees)}</span> needed
              </div>
            </div>

            <div className="p-4 bg-[#1C0E0C] border border-[#3E201B] rounded-2xl">
              <div className="text-[10px] font-bold text-[#C4ABA1] uppercase mb-1">Max Budget (₹)</div>
              {editingConstraints ? (
                <input
                  type="number"
                  step={5000}
                  value={budgetInput}
                  onChange={e => setBudgetInput(Number(e.target.value))}
                  className="w-full bg-[#140A09] border border-[#F6C445] rounded-xl px-2.5 py-1.5 text-sm font-black text-[#FFFFFF] focus:outline-none"
                />
              ) : (
                <div className="text-xl font-black text-[#FFFFFF]">₹{budgetTarget.revised_goal.toLocaleString('en-IN')}</div>
              )}
              <div className="text-[10px] text-[#C4ABA1] mt-1">
                Buffer: <span className={`font-bold ${remainingSpend < 0 ? 'text-[#F87171]' : 'text-[#34D399]'}`}>₹{remainingSpend.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-[#C4ABA1]">
            Evaluator Test: Change budget or attendee goal here, then ask the Copilot how to adapt.
          </div>
        </div>

        {/* What-If Budget Reallocation Simulator */}
        {(() => {
          const paidSocial = campaigns.find(c => c.name.toLowerCase().includes('paid social')) || campaigns[0];
          const ambassadors = campaigns.find(c => c.name.toLowerCase().includes('ambassador')) || campaigns[1];
          const psCac = paidSocial && paidSocial.attendees > 0 ? paidSocial.spend_inr / paidSocial.attendees : 274;
          const ambCac = ambassadors && ambassadors.attendees > 0 ? ambassadors.spend_inr / ambassadors.attendees : 108;
          const maxShift = Math.min(60000, paidSocial ? paidSocial.spend_inr : 60000);
          const clampedShift = Math.min(shiftAmount, maxShift);
          const lostFromPs = Math.floor(clampedShift / psCac);
          const gainedInAmb = Math.floor(clampedShift / ambCac);
          const netDelta = gainedInAmb - lostFromPs;
          const simAttendees = totalAttendees + netDelta;
          const simCac = simAttendees > 0 ? Math.round(totalSpend / simAttendees) : 0;

          return (
            <div className="bg-[#2B1613] border border-[#3E201B] p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-[#FFFFFF] tracking-wider">
                  <span className="text-[#F6C445]">WHAT-IF SIMULATOR</span>
                  <span className="text-[#C4ABA1]">(PAID SOCIAL → AMBASSADORS)</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F6C445]/15 text-[#F6C445]">
                  ASSUMPTION: CONSTANT CAC
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#C4ABA1]">Shift Budget Amount:</span>
                    <span className="text-[#F6C445] font-black">₹{clampedShift.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxShift}
                    step={2000}
                    value={clampedShift}
                    onChange={e => setShiftAmount(Number(e.target.value))}
                    className="w-full accent-[#F6C445] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2.5 bg-[#1C0E0C] border border-[#3E201B] rounded-2xl">
                    <div className="text-[10px] text-[#C4ABA1] font-bold">NET GAIN</div>
                    <div className="text-base font-black text-[#34D399]">+{netDelta}</div>
                  </div>
                  <div className="p-2.5 bg-[#1C0E0C] border border-[#3E201B] rounded-2xl">
                    <div className="text-[10px] text-[#C4ABA1] font-bold">SIM ATTENDEES</div>
                    <div className="text-base font-black text-[#F6C445]">{simAttendees.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="p-2.5 bg-[#1C0E0C] border border-[#3E201B] rounded-2xl">
                    <div className="text-[10px] text-[#C4ABA1] font-bold">NEW CAC</div>
                    <div className="text-base font-black text-[#FFFFFF]">₹{simCac}</div>
                  </div>
                </div>
              </div>

              {onApplyReallocation && paidSocial && ambassadors && (
                <button
                  disabled={applyingShift || clampedShift === 0}
                  onClick={async () => {
                    setApplyingShift(true);
                    try {
                      await onApplyReallocation(
                        paidSocial.id,
                        Math.max(0, paidSocial.spend_inr - clampedShift),
                        Math.max(0, paidSocial.attendees - lostFromPs),
                        ambassadors.id,
                        ambassadors.spend_inr + clampedShift,
                        ambassadors.attendees + gainedInAmb
                      );
                    } finally {
                      setApplyingShift(false);
                    }
                  }}
                  className="mt-4 w-full py-2 bg-[#F6C445] hover:bg-[#FFD15C] disabled:opacity-50 text-[#140A09] font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{applyingShift ? 'Applying...' : `Apply ₹${(clampedShift / 1000).toFixed(0)}K Shift Live`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
