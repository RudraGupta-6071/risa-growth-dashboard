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
  const cac = c.attendees > 0 ? Math.round(c.spend_inr / c.attendees) : 0;
  const showup = c.confirmed > 0 ? Number(((c.attendees / c.confirmed) * 100).toFixed(2)) : 0;
  return {
    ...c,
    cac_inr: cac,
    showup_rate: showup,
  };
};

export const api = {
  // Test connection to Supabase
  async testSupabaseConnection(): Promise<{ success: boolean; message: string; rows?: number }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'No Supabase credentials configured (running in local storage mode).' };
    }
    try {
      const { data, error } = await client.from('campaigns').select('id', { count: 'exact' });
      if (error) {
        return { success: false, message: `Supabase error: ${error.message}` };
      }
      return { success: true, message: `Connected to Supabase! Found ${data?.length ?? 0} campaign rows.`, rows: data?.length };
    } catch (err: any) {
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
          return data.map((c: any) => ({
            ...c,
            cac_inr: c.cac_inr ?? (c.attendees > 0 ? Math.round(c.spend_inr / c.attendees) : 0),
            showup_rate: c.showup_rate ?? (c.confirmed > 0 ? Number(((c.attendees / c.confirmed) * 100).toFixed(2)) : 0),
          }));
        }
      } catch (err) {
        console.warn('Falling back to local campaigns storage:', err);
      }
    }
    const local = getLocal<Campaign[]>(STORAGE_KEY_CAMPAIGNS, INITIAL_CAMPAIGNS);
    return local.map(recomputeCampaignDerived);
  },

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const payload: any = { ...updates, updated_at: new Date().toISOString() };
        delete payload.cac_inr; // Generated in postgres
        delete payload.showup_rate;
        const { error } = await client.from('campaigns').update(payload).eq('id', id);
        if (!error) {
          return this.getCampaigns();
        }
      } catch (err) {
        console.warn('Supabase update failed, updating local:', err);
      }
    }
    const local = getLocal<Campaign[]>(STORAGE_KEY_CAMPAIGNS, INITIAL_CAMPAIGNS);
    const updated = local.map(c => (c.id === id ? recomputeCampaignDerived({ ...c, ...updates }) : c));
    setLocal(STORAGE_KEY_CAMPAIGNS, updated);
    return updated;
  },

  async resetCampaigns(): Promise<Campaign[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const current = await this.getCampaigns();
        for (const c of current) {
          await client.from('campaigns').update({
            spend_inr: c.spend_original,
            attendees: c.attendees_original,
            updated_at: new Date().toISOString()
          }).eq('id', c.id);
        }
        return this.getCampaigns();
      } catch (err) {
        console.warn('Supabase reset failed, resetting local:', err);
      }
    }
    const reset = INITIAL_CAMPAIGNS.map(recomputeCampaignDerived);
    setLocal(STORAGE_KEY_CAMPAIGNS, reset);
    return reset;
  },

  // Targets
  async getTargets(): Promise<Target[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('targets').select('*').order('id', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Targets query error:', err);
      }
    }
    return getLocal<Target[]>(STORAGE_KEY_TARGETS, INITIAL_TARGETS);
  },

  // Daily Metrics
  async getDailyMetrics(): Promise<DailyMetric[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('daily_metrics').select('*').order('metric_date', { ascending: true });
        if (!error && data && data.length > 0) return data;
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
          return data.map((t: any) => ({
            ...t,
            campaign_name: t.campaigns?.name || (t.campaign_id ? `Campaign #${t.campaign_id}` : undefined)
          }));
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

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('tasks')
          .insert([{
            title: task.title,
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
          return {
            ...data,
            campaign_name: data.campaigns?.name
          };
        }
      } catch (err) {
        console.warn('Supabase task insert failed, saving locally:', err);
      }
    }
    const local = getLocal<Task[]>(STORAGE_KEY_TASKS, INITIAL_TASKS);
    const newId = local.length > 0 ? Math.max(...local.map(t => t.id)) + 1 : 1;
    const newTask: Task = {
      ...task,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setLocal(STORAGE_KEY_TASKS, [newTask, ...local]);
    return newTask;
  },

  async updateTask(id: number, updates: Partial<Task>): Promise<Task[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client
          .from('tasks')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        if (!error) return this.getTasks();
      } catch (err) {
        console.warn('Supabase task update failed:', err);
      }
    }
    const local = getLocal<Task[]>(STORAGE_KEY_TASKS, INITIAL_TASKS);
    const updated = local.map(t => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
    setLocal(STORAGE_KEY_TASKS, updated);
    return updated;
  },

  async deleteTask(id: number): Promise<Task[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('tasks').delete().eq('id', id);
        if (!error) return this.getTasks();
      } catch (err) {
        console.warn('Supabase task delete failed:', err);
      }
    }
    const local = getLocal<Task[]>(STORAGE_KEY_TASKS, INITIAL_TASKS);
    const filtered = local.filter(t => t.id !== id);
    setLocal(STORAGE_KEY_TASKS, filtered);
    return filtered;
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
