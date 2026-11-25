import React, { useState, useEffect } from 'react';
import { Database, Key, CheckCircle2, AlertCircle, X, ExternalLink, RefreshCw } from 'lucide-react';
import { getStoredConfig, saveStoredConfig, resetSupabaseClient, api } from '../services/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onConfigChanged }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [testStatus, setTestStatus] = useState<{ testing: boolean; message?: string; success?: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredConfig();
      setSupabaseUrl(config.url);
      setSupabaseAnonKey(config.anonKey);
      setGeminiKey(config.geminiKey);
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredConfig(supabaseUrl, supabaseAnonKey, geminiKey);
    resetSupabaseClient();
    onConfigChanged();
    onClose();
  };

  const handleTestConnection = async () => {
    saveStoredConfig(supabaseUrl, supabaseAnonKey, geminiKey);
    resetSupabaseClient();
    setTestStatus({ testing: true });
    const res = await api.testSupabaseConnection();
    setTestStatus({ testing: false, success: res.success, message: res.message });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#2B1613] border border-[#3E201B] rounded-3xl w-full max-w-lg p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F6C445] text-[#140A09] rounded-2xl font-black shadow">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#FFFFFF]">Database & AI Settings</h3>
              <p className="text-xs text-[#C4ABA1]">Configure Supabase project & Google AI Studio key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#C4ABA1] hover:text-[#FFFFFF] p-2 rounded-full hover:bg-[#381D19]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#C4ABA1] mb-1">
              Supabase Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="text"
              placeholder="https://kuqntcxcvallojirzndx.supabase.co"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              className="w-full bg-[#1C0E0C] border border-[#3E201B] rounded-2xl px-4 py-2.5 text-xs text-[#FFFFFF] placeholder-[#C4ABA1]/50 focus:outline-none focus:border-[#F6C445]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#C4ABA1] mb-1">
              Supabase Anon Public Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              placeholder="sb_publishable_... or eyJhbGci..."
              value={supabaseAnonKey}
              onChange={e => setSupabaseAnonKey(e.target.value)}
              className="w-full bg-[#1C0E0C] border border-[#3E201B] rounded-2xl px-4 py-2.5 text-xs text-[#FFFFFF] placeholder-[#C4ABA1]/50 focus:outline-none focus:border-[#F6C445]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#C4ABA1] flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-[#F6C445]" /> Google AI Studio Key (GEMINI_API_KEY)
              </label>
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#F6C445] hover:underline flex items-center gap-0.5 font-bold"
              >
                Get Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              className="w-full bg-[#1C0E0C] border border-[#3E201B] rounded-2xl px-4 py-2.5 text-xs text-[#FFFFFF] placeholder-[#C4ABA1]/50 focus:outline-none focus:border-[#F6C445]"
            />
            <p className="text-[11px] text-[#C4ABA1] mt-1">
              Optional: If omitted, the Copilot uses its built-in rule engine. If provided, calls Gemini 1.5 Flash directly!
            </p>
          </div>

          {testStatus && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border font-bold ${
                testStatus.success
                  ? 'bg-[#34D399]/15 border-[#34D399]/40 text-[#34D399]'
                  : testStatus.testing
                  ? 'bg-[#F6C445]/15 border-[#F6C445]/40 text-[#F6C445]'
                  : 'bg-[#F87171]/15 border-[#F87171]/40 text-[#F87171]'
              }`}
            >
              {testStatus.testing ? (
                <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />
              ) : testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{testStatus.testing ? 'Testing connection to Supabase...' : testStatus.message}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 mt-7 pt-5 border-t border-[#3E201B]">
          <button
            type="button"
            onClick={handleTestConnection}
            className="px-4 py-2.5 text-xs font-bold text-[#FFFFFF] bg-[#381D19] hover:bg-[#4E2822] rounded-full transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#F6C445]" /> Test Connection
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#C4ABA1] hover:text-[#FFFFFF] rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-black bg-[#F6C445] hover:bg-[#FDE047] text-[#140A09] rounded-full transition-colors shadow-lg"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
