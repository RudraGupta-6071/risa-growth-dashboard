import React, { useState } from 'react';
import { Bot, X, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import { Campaign, Target, Task, DailyMetric } from '../types';
import { ChatbotTab } from '../tabs/ChatbotTab';

interface FloatingCopilotProps {
  campaigns: Campaign[];
  targets: Target[];
  dailyMetrics?: DailyMetric[];
  onTaskCreated: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onShowToast: (msg: string) => void;
  hidden?: boolean;
}

export const FloatingCopilot: React.FC<FloatingCopilotProps> = ({
  campaigns,
  targets,
  dailyMetrics = [],
  onTaskCreated,
  onShowToast,
  hidden = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (hidden) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Expandable Floating Chat Window */}
      {isOpen && (
        <div
          className={`flex flex-col bg-[#2B1613] border-2 border-[#F6C445]/60 rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
            isExpanded
              ? 'w-[92vw] sm:w-[680px] h-[82vh] max-h-[760px]'
              : 'w-[92vw] sm:w-[410px] h-[540px] max-h-[75vh]'
          }`}
        >
          {/* Floating Window Title Bar */}
          <div className="px-4 py-3 bg-[#140A09] border-b border-[#3E201B] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F6C445] text-[#140A09] flex items-center justify-center font-black shadow">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-[#FFFFFF] uppercase tracking-wider flex items-center gap-2">
                  <span>RISA AI Copilot</span>
                  <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                </div>
                <div className="text-[10px] text-[#C4ABA1] font-semibold">
                  Ask metrics, navigation & tasks
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="p-2 rounded-full text-[#C4ABA1] hover:text-[#F6C445] hover:bg-[#2B1613] transition-colors"
                title={isExpanded ? 'Compact view' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-[#C4ABA1] hover:text-[#FFFFFF] hover:bg-[#2B1613] transition-colors"
                title="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Copilot Content */}
          <div className="flex-1 min-h-0">
            <ChatbotTab
              campaigns={campaigns}
              targets={targets}
              dailyMetrics={dailyMetrics}
              onTaskCreated={onTaskCreated}
              onShowToast={onShowToast}
              isFloating={true}
            />
          </div>
        </div>
      )}

      {/* Floating Launcher Pill Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="group flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#F6C445] hover:bg-[#FFD15C] text-[#140A09] font-black text-xs uppercase tracking-wider shadow-2xl border-2 border-[#140A09] transition-all duration-200 hover:scale-105 cursor-pointer"
        title={isOpen ? 'Minimize AI Copilot' : 'Open AI Copilot'}
      >
        <div className="relative">
          {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#34D399] border-2 border-[#F6C445]" />
          )}
        </div>
        <span>{isOpen ? 'Close Copilot' : 'Ask AI Copilot'}</span>
      </button>
    </div>
  );
};
