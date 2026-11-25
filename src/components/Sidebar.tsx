import React from 'react';
import {
  RotateCcw,
  Settings
} from 'lucide-react';
import { getStoredConfig } from '../services/supabase';

export type TabType = 'dashboard' | 'diagnosis' | 'tasks' | 'chatbot';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenSettings: () => void;
  onOpenResetModal: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenResetModal,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { url } = getStoredConfig();
  const isSupabaseConfigured = Boolean(url);

  const navItems: { id: TabType; label: string }[] = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'diagnosis', label: 'DIAGNOSIS' },
    { id: 'tasks', label: 'TASK BOARD' },
    { id: 'chatbot', label: 'AI COPILOT' },
  ];

  const handleNavClick = (tab: TabType) => {
    onTabChange(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        />
      )}

      {/* Sidebar with rounded internal elements and clean borders */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#140A09] border-r border-[#381B16] flex flex-col justify-between p-4 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Top Circular Avatar & Student Info */}
          <div className="pt-6 pb-6 px-4 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#F6C445] text-[#140A09] flex items-center justify-center font-black text-3xl shadow-xl border-4 border-[#2D1612] mb-3 transition-transform hover:scale-105">
              RG
            </div>
            <h2 className="text-sm font-black text-[#FFFFFF] tracking-wider uppercase">
              Rudra Gupta
            </h2>
            <p className="text-[11px] text-[#C4ABA1] uppercase tracking-wider font-semibold mt-0.5">
              RISA APM • Bangalore '25
            </p>
          </div>

          {/* Navigation Links with Rounded Active Block */}
          <nav className="w-full flex flex-col space-y-2 mt-2">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full py-3 px-5 rounded-2xl font-black text-xs tracking-widest text-center uppercase transition-all ${
                    isActive
                      ? 'bg-[#F6C445] text-[#140A09] shadow-lg scale-[1.02]'
                      : 'text-[#FFFFFF] hover:text-[#F6C445] hover:bg-[#241310] font-bold'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Quick Action Items with rounded shapes */}
            <div className="pt-3 space-y-2">
              <button
                onClick={onOpenResetModal}
                className="w-full py-2.5 px-4 rounded-2xl text-[#F87171] hover:bg-[#281512] border border-[#F87171]/40 font-bold text-xs tracking-wider text-center uppercase transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET 2025 DATA</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="w-full py-2.5 px-4 rounded-2xl text-[#C4ABA1] hover:text-[#FFFFFF] hover:bg-[#241310] border border-[#381B16] font-bold text-xs tracking-wider text-center uppercase transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-[#F6C445]" />
                <span>SETTINGS & KEYS</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Connection Status Strip */}
        <div className="p-3 bg-[#1C0E0C] border border-[#381B16] rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isSupabaseConfigured ? 'bg-[#34D399] animate-pulse' : 'bg-[#F6C445]'
              }`}
            />
            <span className="text-[11px] font-bold text-[#C4ABA1]">
              {isSupabaseConfigured ? 'SUPABASE LIVE' : 'LOCAL MODE'}
            </span>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-[11px] text-[#F6C445] hover:underline font-black px-2 py-0.5 rounded-full bg-[#F6C445]/15"
          >
            EDIT
          </button>
        </div>
      </aside>
    </>
  );
};
