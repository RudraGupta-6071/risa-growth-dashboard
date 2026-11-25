import React from 'react';
import {
  Sparkles,
  BarChart3,
  Stethoscope,
  CheckSquare,
  MessageSquare,
  Settings,
  GraduationCap
} from 'lucide-react';
import { getStoredConfig } from '../services/supabase';

export type TabType = 'dashboard' | 'diagnosis' | 'tasks' | 'chatbot';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onOpenSettings }) => {
  const { url } = getStoredConfig();
  const isSupabaseConfigured = Boolean(url);

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'diagnosis', label: 'Diagnosis', icon: Stethoscope },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'chatbot', label: 'Growth Copilot', icon: MessageSquare },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#170C0A]/95 backdrop-blur-md border-b border-[#4A2822]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Student Project Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F6C445] text-[#1C100E] font-black text-lg flex items-center justify-center shadow-md rotate-[-2deg] hover:rotate-0 transition-transform">
            R
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-[#FFFBF5]">
                RISA Fest '25
              </span>
              <span className="text-[10px] font-mono font-semibold bg-[#F6C445]/15 text-[#F6C445] border border-[#F6C445]/30 px-1.5 py-0.5 rounded">
                v1.2
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#BBA69D]">
              <GraduationCap className="w-3 h-3 text-[#F6C445]" />
              <span>APM Challenge • Bangalore</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Friendly Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center bg-[#241310] p-1 rounded-xl border border-[#4A2822]">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#F6C445] text-[#1C100E] shadow-sm'
                      : 'text-[#BBA69D] hover:text-[#FFFBF5] hover:bg-[#341B17]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1C100E]' : 'text-[#BBA69D]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="h-5 w-[1px] bg-[#4A2822] hidden sm:block" />

          {/* Database / Keys Button */}
          <button
            onClick={onOpenSettings}
            title={isSupabaseConfigured ? 'Supabase Live DB Connected' : 'Local Storage Mode (Click to configure Supabase)'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#4A2822] bg-[#241310] hover:bg-[#341B17] hover:border-[#F6C445]/50 text-xs text-[#FFFBF5] transition-all font-medium"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-[#34D399] ring-2 ring-[#34D399]/20' : 'bg-[#F6C445]'
              }`}
            />
            <Settings className="w-3.5 h-3.5 text-[#BBA69D]" />
            <span className="hidden md:inline text-xs">
              {isSupabaseConfigured ? 'Live DB' : 'Config'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
