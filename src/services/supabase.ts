import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Campaign, Target, DailyMetric, Task, ChatLog } from '../types';
import { INITIAL_CAMPAIGNS, INITIAL_TARGETS, INITIAL_DAILY_METRICS, INITIAL_TASKS } from './seedData';

// Local storage keys
const STORAGE_KEY_CAMPAIGNS = 'risa_campaigns_v1';
const STORAGE_KEY_TARGETS = 'risa_targets_v1';
const STORAGE_KEY_DAILY = 'risa_daily_v1';
const STORAGE_KEY_TASKS = 'risa_tasks_v1';
const STORAGE_KEY_CHAT = 'risa_chat_logs_v1';

const DEFAULT_SUPABASE_URL = 'https://kuqntcxcvallojirzndx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_hE8jDhcfD-MKLbwSG1akQQ_0cUZvyha';

export type StorageMode = 'supabase' | 'local';

export interface StorageStatus {
  mode: StorageMode;
  lastError: string | null;
}

let currentStorageStatus: StorageStatus = { mode: 'local', lastError: null };
const statusListeners = new Set<(status: StorageStatus) => void>();

const setStorageStatus = (mode: StorageMode, lastError: string | null = null) => {
  currentStorageStatus = { mode, lastError };
  statusListeners.forEach(fn => fn(currentStorageStatus));
};

export const getStorageStatus = (): StorageStatus => currentStorageStatus;

export const subscribeStorageStatus = (fn: (status: StorageStatus) => void): (() => void) => {
  statusListeners.add(fn);
  fn(currentStorageStatus);
  return () => {
    statusListeners.delete(fn);
  };
};

export const getStoredConfig = () => {
  const url = localStorage.getItem('VITE_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const geminiKey = localStorage.getItem('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '';
  return { url, anonKey, geminiKey };
};

export const saveStoredConfig = (url: string, anonKey: string, geminiKey?: string) => {
  if (url) localStorage.setItem('VITE_SUPABASE_URL', url.trim());
  else localStorage.removeItem('VITE_SUPABASE_URL');

  if (anonKey) localStorage.setItem('VITE_SUPABASE_ANON_KEY', anonKey.trim());
  else localStorage.removeItem('VITE_SUPABASE_ANON_KEY');

  if (geminiKey !== undefined) {
    if (geminiKey) localStorage.setItem('GEMINI_API_KEY', geminiKey.trim());
    else localStorage.removeItem('GEMINI_API_KEY');
  }
};

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey } = getStoredConfig();
  if (url && anonKey) {
    try {
      if (!supabaseClient) {
        supabaseClient = createClient(url, anonKey);
      }
      return supabaseClient;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
};

export const resetSupabaseClient = () => {
  supabaseClient = null;
};

// Local storage helpers
const getLocal = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setLocal = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

const recomputeCampaignDerived = (c: Campaign): Campaign => {
  const spend = Math.max(0, Math.round(Number(c.spend_inr) || 0));
  const attendees = Math.max(0, Math.round(Number(c.attendees) || 0));
  const cac = attendees > 0 ? Math.round(spend / attendees) : 0;
  const showup = c.confirmed > 0 ? Number(((attendees / c.confirmed) * 100).toFixed(2)) : 0;
  const noShows = c.channel_type === 'walk_in' ? 0 : Math.max(0, c.confirmed - attendees);
  return {
    ...c,
    spend_inr: spend,
    attendees,
    noshow_count: noShows,
    cac_inr: cac,
    showup_rate: showup,
  };
};

const sanitizeCampaignUpdates = (updates: Partial<Campaign>): Partial<Campaign> => {
  const sanitized: Partial<Campaign> = {};
  if (updates.spend_inr !== undefined) {
    sanitized.spend_inr = Math.max(0, Math.round(Number(updates.spend_inr) || 0));
  }
  if (updates.attendees !== undefined) {
    sanitized.attendees = Math.max(0, Math.round(Number(updates.attendees) || 0));
  }
  if (updates.status !== undefined && ['active', 'paused', 'stopped'].includes(updates.status)) {
    sanitized.status = updates.status;
  }
  if (updates.recommendation !== undefined && ['scale', 'change', 'stop'].includes(updates.recommendation)) {
    sanitized.recommendation = updates.recommendation;
  }
  return sanitized;
};

export const api = {
  // Test connection to Supabase
  async testSupabaseConnection(): Promise<{ success: boolean; message: string; rows?: number }> {
    const client = getSupabaseClient();
    if (!client) {
      setStorageStatus('local', 'No Supabase credentials configured');
      return { success: false, message: 'No Supabase credentials configured (running in local storage mode).' };
    }
    try {
      const { data, error } = await client.from('campaigns').select('id', { count: 'exact' });
      if (error) {
        setStorageStatus('local', error.message);
        return { success: false, message: `Supabase error: ${error.message}` };
      }
      setStorageStatus('supabase', null);
      return { success: true, message: `Connected to Supabase! Found ${data?.length ?? 0} campaign rows.`, rows: data?.length };
    } catch (err: any) {
      setStorageStatus('local', err.message || 'Network connection failed');
      return { success: false, message: err.message || 'Network connection failed' };
    }
  },

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('campaigns')
          .select('*')
          .order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped = data.map((c: any) => recomputeCampaignDerived(c));
          setLocal(STORAGE_KEY_CAMPAIGNS, mapped);
          setStorageStatus('supabase', null);
          return mapped;
        }
        if (error) {
          setStorageStatus('local', error.message);
        }
      } catch (err: any) {
        console.warn('Falling back to local campaigns storage:', err);
        setStorageStatus('local', err?.message || 'Supabase unreachable');
      }
    } else {
      setStorageStatus('local', null);
    }
    const local = getLocal<Campaign[]>(STORAGE_KEY_CAMPAIGNS, INITIAL_CAMPAIGNS);
    return local.map(recomputeCampaignDerived);
  },

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<{ campaigns: Campaign[]; persistedTo: StorageMode }> {
    const safeUpdates = sanitizeCampaignUpdates(updates);
    const client = getSupabaseClient();
    if (client) {
      try {
        const payload: any = { ...safeUpdates, updated_at: new Date().toISOString() };
        const { error } = await client.from('campaigns').update(payload).eq('id', id);
        if (!error) {
          const refreshed = await this.getCampaigns();
          setStorageStatus('supabase', null);
          return { campaigns: refreshed, persistedTo: 'supabase' };
        }
        setStorageStatus('local', error.message);
      } catch (err: any) {
        console.warn('Supabase update failed, updating local:', err);
        setStorageStatus('local', err?.message || 'Supabase update failed');
      }
    } else {
      setStorageStatus('local', null);
    }
    const local = getLocal<Campaign[]>(STORAGE_KEY_CAMPAIGNS, INITIAL_CAMPAIGNS);
    const updated = local.map(c => (c.id === id ? recomputeCampaignDerived({ ...c, ...safeUpdates }) : c));
    setLocal(STORAGE_KEY_CAMPAIGNS, updated);
    return { campaigns: updated, persistedTo: 'local' };
  },

  async resetCampaigns(): Promise<{ campaigns: Campaign[]; persistedTo: StorageMode }> {
    const client = getSupabaseClient();
    const resetLocal = INITIAL_CAMPAIGNS.map(recomputeCampaignDerived);
    setLocal(STORAGE_KEY_CAMPAIGNS, resetLocal);

    if (client) {
      try {
        const results = await Promise.all(
          INITIAL_CAMPAIGNS.map(initial =>
            client
              .from('campaigns')
              .update({
                spend_inr: initial.spend_original,
                attendees: initial.attendees_original,
                status: initial.status,
                recommendation: initial.recommendation,
                updated_at: new Date().toISOString(),
              })
              .eq('id', initial.id)
          )
        );
        const firstErr = results.find(r => r.error)?.error;
        if (!firstErr) {
          const refreshed = await this.getCampaigns();
          setStorageStatus('supabase', null);
          return { campaigns: refreshed, persistedTo: 'supabase' };
        }
        setStorageStatus('local', firstErr.message);
      } catch (err: any) {
        console.warn('Supabase reset failed, resetting local:', err);
        setStorageStatus('local', err?.message || 'Supabase reset failed');
      }
    } else {
      setStorageStatus('local', null);
    }
    return { campaigns: resetLocal, persistedTo: 'local' };
  },

  // Targets
  async getTargets(): Promise<Target[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('targets').select('*').order('id', { ascending: true });
        if (!error && data && data.length > 0) {
          setLocal(STORAGE_KEY_TARGETS, data);
          setStorageStatus('supabase', null);
          return data;
        }
      } catch (err) {
        console.warn('Targets query error:', err);
      }
    }
    return getLocal<Target[]>(STORAGE_KEY_TARGETS, INITIAL_TARGETS);
  },

  async updateTarget(metric: string, revised_goal: number): Promise<{ targets: Target[]; persistedTo: StorageMode }> {
    const safeGoal = Math.max(1, Math.round(Number(revised_goal) || 1));
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('targets').update({ revised_goal: safeGoal }).eq('metric', metric);
        if (!error) {
          const refreshed = await this.getTargets();
          setStorageStatus('supabase', null);
          return { targets: refreshed, persistedTo: 'supabase' };
        }
        setStorageStatus('local', error.message);
      } catch (err: any) {
        console.warn('Supabase target update failed, updating local:', err);
        setStorageStatus('local', err?.message || 'Target update failed');
      }
    }
    const local = getLocal<Target[]>(STORAGE_KEY_TARGETS, INITIAL_TARGETS);
    const updated = local.map(t => (t.metric === metric ? { ...t, revised_goal: safeGoal } : t));
    setLocal(STORAGE_KEY_TARGETS, updated);
    return { targets: updated, persistedTo: 'local' };
  },

  async resetTargets(): Promise<{ targets: Target[]; persistedTo: StorageMode }> {
    setLocal(STORAGE_KEY_TARGETS, INITIAL_TARGETS);
    const client = getSupabaseClient();
    if (client) {
      try {
        const results = await Promise.all(
          INITIAL_TARGETS.map(t =>
            client.from('targets').update({ revised_goal: t.revised_goal }).eq('metric', t.metric)
          )
        );
        const firstErr = results.find(r => r.error)?.error;
        if (!firstErr) {
          const refreshed = await this.getTargets();
          setStorageStatus('supabase', null);
          return { targets: refreshed, persistedTo: 'supabase' };
        }
        setStorageStatus('local', firstErr.message);
      } catch (err: any) {
        console.warn('Supabase targets reset failed, resetting local:', err);
        setStorageStatus('local', err?.message || 'Targets reset failed');
      }
    }
    return { targets: INITIAL_TARGETS, persistedTo: 'local' };
  },

  // Daily Metrics (Read-only historical records)
  async getDailyMetrics(): Promise<DailyMetric[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('daily_metrics').select('*').order('metric_date', { ascending: true });
        if (!error && data && data.length > 0) {
          setLocal(STORAGE_KEY_DAILY, data);
          return data;
        }
      } catch (err) {
        console.warn('Daily metrics query error:', err);
      }
    }
    return getLocal<DailyMetric[]>(STORAGE_KEY_DAILY, INITIAL_DAILY_METRICS);
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('tasks')
          .select('*, campaigns(name)')
          .order('id', { ascending: false });
        if (!error && data) {
          const mapped = data.map((t: any) => ({
            ...t,
            campaign_name: t.campaigns?.name || (t.campaign_id ? `Campaign #${t.campaign_id}` : undefined)
          }));
          setLocal(STORAGE_KEY_TASKS, mapped);
          setStorageStatus('supabase', null);
          return mapped;
        }
      } catch (err) {
        console.warn('Tasks query error:', err);
      }
    }
    const campaigns = await this.getCampaigns();
    const local = getLocal<Task[]>(STORAGE_KEY_TASKS, INITIAL_TASKS);
    return local.map(t => {
      const match = campaigns.find(c => c.id === t.campaign_id);
      return {
        ...t,
        campaign_name: match ? match.name : t.campaign_name
      };
    });
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<{ task: Task; persistedTo: StorageMode }> {
    const title = (task.title || '').trim();
    if (!title) throw new Error('Task title is required');

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('tasks')
          .insert([{
            title,
            description: task.description || null,
            campaign_id: task.campaign_id || null,
            owner: task.owner || null,
            due_date: task.due_date || null,
            priority: task.priority || 'medium',
            status: task.status || 'open',
            source: task.source || 'manual'
          }])
          .select('*, campaigns(name)')
          .single();
        if (!error && data) {
          const created: Task = {
            ...data,
            campaign_name: data.campaigns?.name
          };
          setStorageStatus('supabase', null);
          return { task: created, persistedTo: 'supabase' };
        }
        if (error) setStorageStatus('local', error.message);
      } catch (err: any) {
        console.warn('Supabase task insert failed, saving locally:', err);
        setStorageStatus('local', err?.message || 'Task insert failed');
      }
    }
    const local = getLocal<Task[]>(STORAGE_KEY_TASKS, INITIAL_TASKS);
    const newId = local.length > 0 ? Math.max(...local.map(t => t.id)) + 1 : 1;
    const newTask: Task = {
      ...task,
      title,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setLocal(STORAGE_KEY_TASKS, [newTask, ...local]);
    return { task: newTask, persistedTo: 'local' };
  },

  async updateTask(id: number, updates: Partial<Task>): Promise<{ tasks: Task[]; persistedTo: StorageMode }> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const payload: any = { ...updates, updated_at: new Date().toISOString() };
        delete payload.campaign_name;
        const { error } = await client
          .from('tasks')
          .update(payload)
          .eq('id', id);
        if (!error) {
          const refreshed = await this.getTasks();
          setStorageStatus('supabase', null);
          return { tasks: refreshed, persistedTo: 'supabase' };
        }
        setStorageStatus('local', error.message);
      } catch (err: any) {
        console.warn('Supabase task update failed:', err);
        setStorageStatus('local', err?.message || 'Task update failed');
      }
    }
    const local = getLocal<Task[]>(STORAGE_KEY_TASKS, INITIAL_TASKS);
    const updated = local.map(t => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
    setLocal(STORAGE_KEY_TASKS, updated);
    return { tasks: updated, persistedTo: 'local' };
  },

  async deleteTask(id: number): Promise<{ tasks: Task[]; persistedTo: StorageMode }> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('tasks').delete().eq('id', id);
        if (!error) {
          const refreshed = await this.getTasks();
          setStorageStatus('supabase', null);
          return { tasks: refreshed, persistedTo: 'supabase' };
        }
        setStorageStatus('local', error.message);
      } catch (err: any) {
        console.warn('Supabase task delete failed:', err);
        setStorageStatus('local', err?.message || 'Task delete failed');
      }
    }
    const local = getLocal<Task[]>(STORAGE_KEY_TASKS, INITIAL_TASKS);
    const filtered = local.filter(t => t.id !== id);
    setLocal(STORAGE_KEY_TASKS, filtered);
    return { tasks: filtered, persistedTo: 'local' };
  },

  // Chat Logs
  async getChatLogs(sessionId: string): Promise<ChatLog[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('chat_logs')
          .select('*')
          .eq('session_id', sessionId)
          .order('id', { ascending: true })
          .limit(50);
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Chat logs query error:', err);
      }
    }
    const all = getLocal<ChatLog[]>(STORAGE_KEY_CHAT, []);
    return all.filter(c => c.session_id === sessionId);
  },

  async saveChatLog(log: ChatLog): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('chat_logs').insert([{
          session_id: log.session_id,
          role: log.role,
          content: log.content,
          created_at: new Date().toISOString()
        }]);
      } catch (err) {
        console.warn('Supabase chat log error:', err);
      }
    }
    const all = getLocal<ChatLog[]>(STORAGE_KEY_CHAT, []);
    setLocal(STORAGE_KEY_CHAT, [...all, { ...log, created_at: new Date().toISOString() }]);
  }
};
