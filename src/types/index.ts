export interface Campaign {
  id: number;
  name: string;
  channel_type: string;
  spend_inr: number;
  spend_original: number;
  impressions: number;
  clicks: number;
  reg_starts: number;
  registrations: number;
  confirmed: number;
  attendees: number;
  attendees_original: number;
  cancel_count: number;
  noshow_count: number;
  cac_inr?: number;
  showup_rate?: number;
  status: 'active' | 'paused' | 'stopped';
  recommendation: 'scale' | 'change' | 'stop';
  updated_at?: string;
}

export interface Target {
  id: number;
  metric: string;
  base_value: number;
  stretch_value: number;
  revised_goal: number;
  unit: string;
}

export interface DailyMetric {
  id: number;
  metric_date: string;
  registrations: number;
  confirmed: number;
  admitted: number;
  spend_inr: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  campaign_id?: number | null;
  owner?: string | null;
  due_date?: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'done';
  source: 'manual' | 'ai_suggested';
  created_at?: string;
  updated_at?: string;
  campaign_name?: string;
}

export interface ChatLog {
  id?: number;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface SuggestedTask {
  title: string;
  description: string;
  owner?: string;
  priority: 'high' | 'medium' | 'low';
  campaign_id?: number | null;
}
