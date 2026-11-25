import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Edit2,
  Check,
  X,
  AlertTriangle,
  ArrowUpDown,
  TrendingDown,
  PieChart,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Campaign } from '../types';

interface DiagnosisTabProps {
  campaigns: Campaign[];
  onUpdateCampaign: (id: number, updates: Partial<Campaign>) => Promise<void>;
  onOpenResetModal: () => void;
  loading: boolean;
}

type SortField = 'name' | 'spend_inr' | 'attendees' | 'cac_inr' | 'showup_rate' | 'registrations';

export const DiagnosisTab: React.FC<DiagnosisTabProps> = ({
  campaigns,
  onUpdateCampaign,
  onOpenResetModal,
  loading
}) => {
  const [sortField, setSortField] = useState<SortField>('cac_inr');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSpend, setEditSpend] = useState<number>(0);
  const [editRecommendation, setEditRecommendation] = useState<'scale' | 'change' | 'stop'>('scale');
  const [saving, setSaving] = useState(false);

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'cac_inr') {
        aVal = a.cac_inr ?? (a.attendees > 0 ? Math.round(a.spend_inr / a.attendees) : 9999);
        bVal = b.cac_inr ?? (b.attendees > 0 ? Math.round(b.spend_inr / b.attendees) : 9999);
      }

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [campaigns, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const startEdit = (c: Campaign) => {
    setEditingId(c.id);
    setEditSpend(c.spend_inr);
    setEditRecommendation(c.recommendation);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    try {
      await onUpdateCampaign(id, {
        spend_inr: Number(editSpend),
        recommendation: editRecommendation
      });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const nonWalkIns = useMemo(() => campaigns.filter(c => c.channel_type !== 'walk_in'), [campaigns]);

  const highestCacCampaign = useMemo(() => {
    if (nonWalkIns.length === 0) return null;
    return [...nonWalkIns].sort((a, b) => (b.cac_inr || 0) - (a.cac_inr || 0))[0];
  }, [nonWalkIns]);

  const lowestCacCampaign = useMemo(() => {
    if (nonWalkIns.length === 0) return null;
    return [...nonWalkIns].sort((a, b) => (a.cac_inr || 0) - (b.cac_inr || 0))[0];
  }, [nonWalkIns]);

  const cacMultiple = useMemo(() => {
    if (!highestCacCampaign || !lowestCacCampaign || !lowestCacCampaign.cac_inr) return '1';
    return ((highestCacCampaign.cac_inr || 0) / lowestCacCampaign.cac_inr).toFixed(1);
  }, [highestCacCampaign, lowestCacCampaign]);

  const worstShowupCampaign = useMemo(() => {
    if (nonWalkIns.length === 0) return null;
    return [...nonWalkIns].sort((a, b) => (a.showup_rate || 0) - (b.showup_rate || 0))[0];
  }, [nonWalkIns]);

  const showupGap = useMemo(() => {
    if (!worstShowupCampaign) return 0;
    return (82.0 - (worstShowupCampaign.showup_rate || 0)).toFixed(1);
  }, [worstShowupCampaign]);

  const concentration = useMemo(() => {
    const totalSpend = campaigns.reduce((s, c) => s + c.spend_inr, 0);
    const totalAttendees = campaigns.reduce((s, c) => s + c.attendees, 0);
    const sortedBySpend = [...campaigns].sort((a, b) => b.spend_inr - a.spend_inr);
    const top2 = sortedBySpend.slice(0, 2);
    const top2Spend = top2.reduce((s, c) => s + c.spend_inr, 0);
    const top2Attendees = top2.reduce((s, c) => s + c.attendees, 0);

    const spendPct = totalSpend > 0 ? Math.round((top2Spend / totalSpend) * 100) : 0;
    const attendeesPct = totalAttendees > 0 ? Math.round((top2Attendees / totalAttendees) * 100) : 0;
    return {
      channels: top2.map(c => c.name).join(' & '),
      spendPct,
      attendeesPct
    };
  }, [campaigns]);

  const noShowData = useMemo(() => {
    return [...nonWalkIns]
      .map(c => ({
        name: c.name,
        confirmed: c.confirmed,
        attendees: c.attendees,
        noShows: c.noshow_count || Math.max(0, c.confirmed - c.attendees)
      }))
      .sort((a, b) => b.noShows - a.noShows);
  }, [nonWalkIns]);

  const getCacBadge = (cac: number) => {
    if (cac < 100) return 'text-[#34D399] bg-[#34D399]/15 border border-[#34D399]/30';
    if (cac <= 200) return 'text-[#F6C445] bg-[#F6C445]/15 border border-[#F6C445]/30';
    return 'text-[#F87171] bg-[#F87171]/15 border border-[#F87171]/30';
  };

  const getShowupBadge = (rate: number) => {
    if (rate > 82) return 'text-[#34D399] bg-[#34D399]/15 border border-[#34D399]/30';
    if (rate >= 65) return 'text-[#F6C445] bg-[#F6C445]/15 border border-[#F6C445]/30';
    return 'text-[#F87171] bg-[#F87171]/15 border border-[#F87171]/30';
  };

  const getRecommendationBadge = (rec: string) => {
    if (rec === 'scale') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">
          🟢 Scale
        </span>
      );
    }
    if (rec === 'change') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#F6C445]/15 text-[#F6C445] border border-[#F6C445]/30">
          🟡 Change
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30">
        🔴 Stop
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Header with Reset Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#381B16] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-[#F6C445] tracking-widest mb-1">
            <span>CHANNEL AUDIT</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#C4ABA1]">UNIT ECONOMICS & BOTTLENECK LEAKS</span>
          </div>
          <h2 className="text-2xl font-black text-[#FFFFFF] tracking-tight">Campaign Diagnosis Deck</h2>
        </div>

        <button
          onClick={onOpenResetModal}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-full border border-[#F87171]/60 text-[#F87171] hover:bg-[#F87171]/15 transition-all shrink-0 bg-[#2B1613] shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          ↺ RESET 2025 DATA
        </button>
      </div>

      {/* Section B: Bottleneck Flags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#2B1613] border border-[#F87171]/40 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-[#F87171] font-black text-xs uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Highest CAC Channel</span>
          </div>
          <p className="text-xs text-[#FFFFFF] leading-relaxed">
            ⚠ <strong className="text-[#F6C445]">{highestCacCampaign?.name}</strong> carries the highest CAC at{' '}
            <span className="text-[#F87171] font-bold">₹{highestCacCampaign?.cac_inr}</span> —{' '}
            <strong>{cacMultiple}×</strong> the cheapest channel ({lowestCacCampaign?.name} at ₹{lowestCacCampaign?.cac_inr}).
          </p>
        </div>

        <div className="bg-[#2B1613] border border-[#F6C445]/40 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-[#F6C445] font-black text-xs uppercase tracking-wider mb-2">
            <TrendingDown className="w-4 h-4 shrink-0" />
            <span>Show-Up Rate Deficit</span>
          </div>
          <p className="text-xs text-[#FFFFFF] leading-relaxed">
            ⚠ <strong className="text-[#F6C445]">{worstShowupCampaign?.name}</strong> has the lowest show-up rate at{' '}
            <span className="text-[#F6C445] font-bold">{worstShowupCampaign?.showup_rate}%</span> —{' '}
            <strong>{showupGap} pts</strong> below the 82% benchmark.
          </p>
        </div>

        <div className="bg-[#2B1613] border border-[#3E201B] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-[#FFFFFF] font-black text-xs uppercase tracking-wider mb-2">
            <PieChart className="w-4 h-4 text-[#F6C445] shrink-0" />
            <span>Budget Concentration</span>
          </div>
          <p className="text-xs text-[#FFFFFF] leading-relaxed">
            ⚠ Top 2 channels ({concentration.channels}) consume{' '}
            <span className="text-[#F6C445] font-bold">{concentration.spendPct}%</span> of budget but deliver only{' '}
            <span className="text-[#34D399] font-bold">{concentration.attendeesPct}%</span> of attendees.
          </p>
        </div>
      </div>

      {/* Section A: Campaign Leaderboard Table (Rounded-3xl) */}
      <div className="bg-[#2B1613] border border-[#3E201B] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#3E201B] flex items-center justify-between bg-[#1C0E0C]">
          <h3 className="text-sm font-black text-[#FFFFFF] uppercase tracking-wider">Campaign Funnel Leaderboard</h3>
          <span className="text-xs text-[#C4ABA1] font-bold">Click any header to sort</span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-[#FFFFFF]">
            <thead className="bg-[#140A09] text-[#C4ABA1] border-b border-[#3E201B] uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th onClick={() => handleSort('name')} className="py-3.5 px-5 cursor-pointer hover:text-[#FFFFFF]">
                  <div className="flex items-center gap-1">
                    Campaign <ArrowUpDown className="w-3 h-3 text-[#F6C445]" />
                  </div>
                </th>
                <th onClick={() => handleSort('spend_inr')} className="py-3.5 px-3 cursor-pointer hover:text-[#FFFFFF]">
                  <div className="flex items-center gap-1">
                    Spend (₹) <ArrowUpDown className="w-3 h-3 text-[#F6C445]" />
                  </div>
                </th>
                <th onClick={() => handleSort('attendees')} className="py-3.5 px-3 cursor-pointer hover:text-[#FFFFFF]">
                  <div className="flex items-center gap-1">
                    Attendees <ArrowUpDown className="w-3 h-3 text-[#F6C445]" />
                  </div>
                </th>
                <th onClick={() => handleSort('cac_inr')} className="py-3.5 px-3 cursor-pointer hover:text-[#FFFFFF]">
                  <div className="flex items-center gap-1">
                    CAC <ArrowUpDown className="w-3 h-3 text-[#F6C445]" />
                  </div>
                </th>
                <th onClick={() => handleSort('showup_rate')} className="py-3.5 px-3 cursor-pointer hover:text-[#FFFFFF]">
                  <div className="flex items-center gap-1">
                    Show-Up % <ArrowUpDown className="w-3 h-3 text-[#F6C445]" />
                  </div>
                </th>
                <th onClick={() => handleSort('registrations')} className="py-3.5 px-3 cursor-pointer hover:text-[#FFFFFF]">
                  <div className="flex items-center gap-1">
                    Regs <ArrowUpDown className="w-3 h-3 text-[#F6C445]" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-[#C4ABA1]">Status</th>
                <th className="py-3.5 px-3 text-[#C4ABA1]">Recommendation</th>
                <th className="py-3.5 px-5 text-right text-[#C4ABA1]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3E201B]/70">
              {sortedCampaigns.map(c => {
                const isEditing = editingId === c.id;
                const cac = c.cac_inr ?? (c.attendees > 0 ? Math.round(c.spend_inr / c.attendees) : 0);
                const showup = c.showup_rate ?? (c.confirmed > 0 ? ((c.attendees / c.confirmed) * 100).toFixed(2) : 0);

                return (
                  <tr key={c.id} className="hover:bg-[#381D19] transition-colors">
                    <td className="py-4 px-5 font-bold text-[#FFFFFF]">
                      {c.name}
                      <span className="block text-[10px] text-[#C4ABA1] font-normal">{c.channel_type}</span>
                    </td>
                    <td className="py-4 px-3 font-bold text-[#F6C445]">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editSpend}
                          onChange={e => setEditSpend(Number(e.target.value))}
                          className="w-24 bg-[#140A09] border border-[#F6C445] rounded-xl px-2.5 py-1 text-xs text-[#FFFFFF] focus:outline-none"
                        />
                      ) : (
                        `₹${c.spend_inr.toLocaleString('en-IN')}`
                      )}
                    </td>
                    <td className="py-4 px-3 font-bold text-[#FFFFFF]">{c.attendees.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-3 font-bold">
                      <span className={`px-2.5 py-1 rounded-full ${getCacBadge(cac)}`}>
                        ₹{cac}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-bold">
                      <span className={`px-2.5 py-1 rounded-full ${getShowupBadge(Number(showup))}`}>
                        {showup}%
                      </span>
                    </td>
                    <td className="py-4 px-3 text-[#C4ABA1] font-bold">{c.registrations.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-3">
                      <span className="text-[11px] text-[#C4ABA1] capitalize font-medium">{c.status}</span>
                    </td>
                    <td className="py-4 px-3">
                      {isEditing ? (
                        <select
                          value={editRecommendation}
                          onChange={e => setEditRecommendation(e.target.value as any)}
                          className="bg-[#140A09] border border-[#F6C445] rounded-xl px-2.5 py-1 text-xs text-[#FFFFFF] focus:outline-none"
                        >
                          <option value="scale">🟢 Scale</option>
                          <option value="change">🟡 Change</option>
                          <option value="stop">🔴 Stop</option>
                        </select>
                      ) : (
                        getRecommendationBadge(c.recommendation)
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEdit(c.id)}
                            disabled={saving}
                            className="p-1.5 rounded-full bg-[#34D399]/20 text-[#34D399] hover:bg-[#34D399]/30"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="p-1.5 rounded-full bg-[#F87171]/20 text-[#F87171] hover:bg-[#F87171]/30"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(c)}
                          className="flex items-center gap-1 text-[11px] font-black text-[#F6C445] hover:text-[#FFFFFF] px-3 py-1 rounded-full hover:bg-[#F6C445]/20 ml-auto transition-colors"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Collapsed Cards */}
        <div className="md:hidden divide-y divide-[#3E201B] p-4 space-y-4">
          {sortedCampaigns.map(c => {
            const cac = c.cac_inr ?? (c.attendees > 0 ? Math.round(c.spend_inr / c.attendees) : 0);
            const showup = c.showup_rate ?? (c.confirmed > 0 ? ((c.attendees / c.confirmed) * 100).toFixed(2) : 0);
            const isEditing = editingId === c.id;

            return (
              <div key={c.id} className="pt-4 first:pt-0 bg-[#1C0E0C] p-4 rounded-2xl border border-[#3E201B]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#FFFFFF]">{c.name}</h4>
                    <span className="text-[10px] text-[#C4ABA1]">{c.channel_type}</span>
                  </div>
                  {getRecommendationBadge(c.recommendation)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs my-3">
                  <div>
                    <span className="text-[#C4ABA1] block text-[10px] font-bold">Spend</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editSpend}
                        onChange={e => setEditSpend(Number(e.target.value))}
                        className="w-20 bg-[#2B1613] border border-[#F6C445] rounded-lg px-2 py-0.5 text-xs text-[#FFFFFF]"
                      />
                    ) : (
                      <span className="font-bold text-[#F6C445]">₹{c.spend_inr.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[#C4ABA1] block text-[10px] font-bold">Attendees</span>
                    <span className="font-bold text-[#FFFFFF]">{c.attendees}</span>
                  </div>
                  <div>
                    <span className="text-[#C4ABA1] block text-[10px] font-bold">CAC</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${getCacBadge(cac)}`}>
                      ₹{cac}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#C4ABA1] block text-[10px] font-bold">Show-Up</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${getShowupBadge(Number(showup))}`}>
                      {showup}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3E201B]">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(c.id)}
                        disabled={saving}
                        className="px-4 py-1 bg-[#34D399] text-[#140A09] font-black text-xs rounded-full"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="px-4 py-1 bg-[#381B16] text-[#C4ABA1] text-xs rounded-full"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(c)}
                      className="text-xs text-[#F6C445] font-black flex items-center gap-1 px-3 py-1 bg-[#F6C445]/10 rounded-full"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Spend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section C: No-Show Analysis (Rounded-3xl) */}
      <div className="bg-[#2B1613] border border-[#3E201B] p-6 lg:p-8 rounded-3xl shadow-xl">
        <div className="mb-6">
          <h3 className="text-sm font-black text-[#FFFFFF] uppercase tracking-wider">No-Show Gap By Channel</h3>
          <p className="text-xs text-[#C4ABA1]">Confirmed Registrations (Yellow) vs Admitted (White) vs Drop-off (Red)</p>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={noShowData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="0" stroke="#3E201B" vertical={false} />
              <XAxis dataKey="name" stroke="#C4ABA1" fontSize={11} interval={0} angle={-15} textAnchor="end" tickLine={false} />
              <YAxis stroke="#C4ABA1" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#140A09',
                  borderColor: '#3E201B',
                  borderRadius: '16px',
                  color: '#FFFFFF',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
              <Bar dataKey="confirmed" name="Confirmed" fill="#F6C445" radius={[6, 6, 0, 0]} />
              <Bar dataKey="attendees" name="Admitted" fill="#FFFFFF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="noShows" name="No-Show Gap" fill="#F87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
