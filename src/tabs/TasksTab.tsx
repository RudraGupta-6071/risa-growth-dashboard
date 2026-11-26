import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Edit2,
  X,
  Sparkles,
  User,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Task, Campaign } from '../types';

interface TasksTabProps {
  tasks: Task[];
  campaigns: Campaign[];
  onCreateTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
  loading: boolean;
  searchQuery?: string;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  campaigns,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  loading,
  searchQuery = ''
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCampaignId, setNewCampaignId] = useState<string>('');
  const [newOwner, setNewOwner] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newStatus, setNewStatus] = useState<'open' | 'in_progress' | 'done'>('open');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editStatus, setEditStatus] = useState<'open' | 'in_progress' | 'done'>('open');
  const [editOwner, setEditOwner] = useState('');

  const q = searchQuery.trim().toLowerCase();
  const filteredTasks = q
    ? tasks.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.owner || '').toLowerCase().includes(q) ||
          (t.campaign_name || '').toLowerCase().includes(q)
      )
    : tasks;

  const totalTasks = tasks.length;
  const openTasks = tasks.filter(t => t.status !== 'done').length;
  const highPriorityOpen = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      await onCreateTask({
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        campaign_id: newCampaignId ? Number(newCampaignId) : null,
        owner: newOwner.trim() || 'Growth Lead',
        due_date: newDueDate || null,
        priority: newPriority,
        status: newStatus,
        source: 'manual'
      });

      setNewTitle('');
      setNewDescription('');
      setNewCampaignId('');
      setNewOwner('');
      setNewDueDate('');
      setNewPriority('medium');
      setNewStatus('open');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (t: Task) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditPriority(t.priority);
    setEditStatus(t.status);
    setEditOwner(t.owner || '');
  };

  const saveEdit = async (id: number) => {
    await onUpdateTask(id, {
      title: editTitle,
      priority: editPriority,
      status: editStatus,
      owner: editOwner || null
    });
    setEditingId(null);
  };

  const toggleDone = async (task: Task) => {
    const nextStatus = task.status === 'done' ? 'open' : 'done';
    await onUpdateTask(task.id, { status: nextStatus });
  };

  const getPriorityBadge = (p: string) => {
    if (p === 'high') {
      return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30">HIGH</span>;
    }
    if (p === 'medium') {
      return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#F6C445]/15 text-[#F6C445] border border-[#F6C445]/30">MEDIUM</span>;
    }
    return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#C4ABA1]/15 text-[#C4ABA1] border border-[#C4ABA1]/30">LOW</span>;
  };

  const getStatusBadge = (s: string) => {
    if (s === 'done') {
      return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#34D399] text-[#140A09]">DONE</span>;
    }
    if (s === 'in_progress') {
      return <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#F6C445] text-[#140A09]">IN PROGRESS</span>;
    }
    return <span className="px-3 py-1 rounded-full text-[10px] font-black border border-[#C4ABA1] text-[#FFFFFF]">OPEN</span>;
  };

  const getSourceBadge = (src: string) => {
    if (src === 'ai_suggested') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-[#F6C445]/20 text-[#F6C445] border border-[#F6C445]/40">
          <Sparkles className="w-2.5 h-2.5" /> AI COPILOT
        </span>
      );
    }
    return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#381B16] text-[#C4ABA1]">MANUAL</span>;
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="pb-4 border-b border-[#381B16]">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-[#F6C445] tracking-widest mb-1">
          <span>OPERATIONS</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#C4ABA1]">EXECUTION CHECKLIST & INITIATIVES</span>
        </div>
        <h2 className="text-2xl font-black text-[#FFFFFF] tracking-tight">Growth Task Board</h2>
      </div>

      {/* Stats Row (Rounded-3xl) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#2B1613] border border-[#3E201B] rounded-3xl p-6 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-[#C4ABA1] uppercase tracking-wider font-bold">Total Tasks</span>
            <div className="text-3xl font-black text-[#FFFFFF] mt-1">{totalTasks}</div>
          </div>
          <div className="p-3 bg-[#F6C445] text-[#140A09] rounded-2xl shadow">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#2B1613] border border-[#3E201B] rounded-3xl p-6 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-[#C4ABA1] uppercase tracking-wider font-bold">Open Tasks</span>
            <div className="text-3xl font-black text-[#F6C445] mt-1">{openTasks}</div>
          </div>
          <div className="p-3 bg-[#F6C445]/20 text-[#F6C445] rounded-2xl border border-[#F6C445]/40">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#2B1613] border border-[#3E201B] rounded-3xl p-6 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-[#C4ABA1] uppercase tracking-wider font-bold">High Priority</span>
            <div className="text-3xl font-black text-[#F87171] mt-1">{highPriorityOpen}</div>
          </div>
          <div className="p-3 bg-[#F87171]/20 text-[#F87171] rounded-2xl border border-[#F87171]/40">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Task Board Table (Rounded-3xl) */}
      <div className="bg-[#2B1613] border border-[#3E201B] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#3E201B] flex items-center justify-between bg-[#1C0E0C]">
          <h3 className="text-sm font-black text-[#FFFFFF] uppercase tracking-wider">Active Initiatives</h3>
          <span className="text-xs text-[#C4ABA1] font-bold">{tasks.length} tasks registered</span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-[#C4ABA1]">
            <CheckSquare className="w-10 h-10 text-[#3E201B] mx-auto mb-3" />
            <p className="text-sm">No tasks yet. Add one below or ask the AI Copilot.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#FFFFFF]">
              <thead className="bg-[#140A09] text-[#C4ABA1] border-b border-[#3E201B] uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-5">Initiative</th>
                  <th className="py-3.5 px-3">Channel</th>
                  <th className="py-3.5 px-3">Owner</th>
                  <th className="py-3.5 px-3">Target Date</th>
                  <th className="py-3.5 px-3">Priority</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Source</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3E201B]/70">
                {filteredTasks.map(t => {
                  const isEditing = editingId === t.id;
                  const isDone = t.status === 'done';

                  return (
                    <tr key={t.id} className={`hover:bg-[#381D19] transition-colors ${isDone ? 'opacity-60 bg-[#1C0E0C]/40' : ''}`}>
                      <td className="py-4 px-5 max-w-xs">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full bg-[#140A09] border border-[#F6C445] rounded-xl px-2.5 py-1 text-xs text-[#FFFFFF]"
                          />
                        ) : (
                          <div>
                            <span className={`font-bold ${isDone ? 'line-through text-[#C4ABA1]' : 'text-[#FFFFFF]'}`}>
                              {t.title}
                            </span>
                            {t.description && (
                              <p className="text-[11px] text-[#C4ABA1] line-clamp-1 mt-0.5">{t.description}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-3 text-[#C4ABA1] font-bold">{t.campaign_name || 'General / Ops'}</td>
                      <td className="py-4 px-3">
                        <span className="flex items-center gap-1 text-[#FFFFFF] font-bold">
                          <User className="w-3.5 h-3.5 text-[#F6C445]" /> {t.owner || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-[#C4ABA1] font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {t.due_date || 'No date'}
                        </span>
                      </td>
                      <td className="py-4 px-3">{getPriorityBadge(t.priority)}</td>
                      <td className="py-4 px-3">{getStatusBadge(t.status)}</td>
                      <td className="py-4 px-3">{getSourceBadge(t.source)}</td>
                      <td className="py-4 px-5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => saveEdit(t.id)}
                              className="p-1.5 rounded-full bg-[#34D399]/20 text-[#34D399] hover:bg-[#34D399]/30"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-full bg-[#F87171]/20 text-[#F87171] hover:bg-[#F87171]/30"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleDone(t)}
                              title={isDone ? 'Mark as Open' : 'Mark as Done'}
                              className={`p-2 rounded-full transition-colors ${
                                isDone ? 'bg-[#34D399]/20 text-[#34D399]' : 'hover:bg-[#381D19] text-[#C4ABA1] hover:text-[#34D399]'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => startEdit(t)}
                              title="Edit task"
                              className="p-2 rounded-full hover:bg-[#381D19] text-[#C4ABA1] hover:text-[#FFFFFF]"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTask(t.id)}
                              title="Delete task"
                              className="p-2 rounded-full hover:bg-[#F87171]/20 text-[#C4ABA1] hover:text-[#F87171]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Task Form (Rounded-3xl) */}
      <div className="bg-[#2B1613] border border-[#3E201B] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-[#F6C445] text-[#140A09] rounded-xl font-black">
            <Plus className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-[#FFFFFF] uppercase tracking-wider">Add Growth Initiative</h3>
        </div>

        <form onSubmit={handleAddTask} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#C4ABA1] mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Launch WhatsApp reminder sequence at T-3"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-[#1C0E0C] border border-[#3E201B] rounded-2xl px-4 py-2.5 text-xs text-[#FFFFFF] placeholder-[#C4ABA1]/50 focus:outline-none focus:border-[#F6C445]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#C4ABA1] mb-1">Channel / Campaign</label>
              <select
                value={newCampaignId}
                onChange={e => setNewCampaignId(e.target.value)}
                className="w-full bg-[#1C0E0C] border border-[#3E201B] rounded-2xl px-4 py-2.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#F6C445]"
              >
                <option value="">General / Ops</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.channel_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#C4ABA1] mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Expected +146 attendees by lowering no-shows"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              className="w-full bg-[#1C0E0C] border border-[#3E201B] rounded-2xl px-4 py-2.5 text-xs text-[#FFFFFF] placeholder-[#C4ABA1]/50 focus:outline-none focus:border-[#F6C445]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#C4ABA1] mb-1">Owner</label>
              <input
                type="text"
                placeholder="Growth Lead"
                value={newOwner}
                onChange={e => setNewOwner(e.target.value)}
                className="w-full bg-[#1C0E0C] border border-[#3E201B] rounded-2xl px-4 py-2 text-xs text-[#FFFFFF] placeholder-[#C4ABA1]/50 focus:outline-none focus:border-[#F6C445]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#C4ABA1] mb-1">Due Date</label>
              <input
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="w-full bg-[#1C0E0C] border border-[#3E201B] rounded-2xl px-4 py-2 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#F6C445]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#C4ABA1] mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as any)}
                className="w-full bg-[#1C0E0C] border border-[#3E201B] rounded-2xl px-4 py-2 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#F6C445]"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#C4ABA1] mb-1">Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as any)}
                className="w-full bg-[#1C0E0C] border border-[#3E201B] rounded-2xl px-4 py-2 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#F6C445]"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || !newTitle.trim()}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#F6C445] hover:bg-[#FDE047] text-[#140A09] rounded-full text-xs font-black transition-colors disabled:opacity-50 shadow-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              ADD TASK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
