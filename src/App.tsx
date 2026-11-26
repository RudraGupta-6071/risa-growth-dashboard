import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { SettingsModal } from './components/SettingsModal';
import { FloatingCopilot } from './components/FloatingCopilot';
import { DashboardTab } from './tabs/DashboardTab';
import { DiagnosisTab } from './tabs/DiagnosisTab';
import { TasksTab } from './tabs/TasksTab';
import { ChatbotTab } from './tabs/ChatbotTab';
import { Campaign, Target, DailyMetric, Task } from './types';
import { api } from './services/supabase';
import { Search, ChevronRight, Menu, Download, Presentation } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile sidebar state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modals & Toast State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Set page title
  useEffect(() => {
    document.title = "RISA Festival '25 — Growth Dashboard";
  }, []);

  // Fetch all data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cData, tData, dData, taskData] = await Promise.all([
        api.getCampaigns(),
        api.getTargets(),
        api.getDailyMetrics(),
        api.getTasks(),
      ]);
      setCampaigns(cData);
      setTargets(tData);
      setDailyMetrics(dData);
      setTasks(taskData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Data load error:', err);
      setError(err?.message || 'Failed to load data from Supabase/storage');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update a campaign spend/recommendation (Live recompute across app)
  const handleUpdateCampaign = async (id: number, updates: Partial<Campaign>) => {
    try {
      const updatedCampaigns = await api.updateCampaign(id, updates);
      setCampaigns(updatedCampaigns);
      setLastUpdated(new Date());
      setToastMessage('Campaign updated — metrics recomputed live!');
    } catch (err: any) {
      console.error('Update campaign error:', err);
      setToastMessage('Failed to update campaign');
    }
  };

  // Reset to original data (Feature 1)
  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      const [resetC, resetT] = await Promise.all([
        api.resetCampaigns(),
        api.resetTargets()
      ]);
      setCampaigns(resetC);
      setTargets(resetT);
      setLastUpdated(new Date());
      setIsResetModalOpen(false);
      setToastMessage('Data & constraints reset to original 2025 values.');
    } catch (err: any) {
      console.error('Reset error:', err);
      setToastMessage('Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };

  // Update target constraints (Budget / Attendee Goal)
  const handleUpdateTarget = async (metric: string, revisedGoal: number) => {
    try {
      const updated = await api.updateTarget(metric, revisedGoal);
      setTargets(updated);
      setLastUpdated(new Date());
      setToastMessage('Constraint updated — dashboard & Copilot synced!');
    } catch (err: any) {
      console.error('Update target error:', err);
      setToastMessage('Failed to update constraint');
    }
  };

  // Apply budget reallocation between two campaigns
  const handleApplyReallocation = async (
    fromId: number,
    fromNewSpend: number,
    fromNewAttendees: number,
    toId: number,
    toNewSpend: number,
    toNewAttendees: number
  ) => {
    try {
      await api.updateCampaign(fromId, { spend_inr: fromNewSpend, attendees: fromNewAttendees, recommendation: 'stop' });
      const updated = await api.updateCampaign(toId, { spend_inr: toNewSpend, attendees: toNewAttendees, recommendation: 'scale' });
      setCampaigns(updated);
      setLastUpdated(new Date());
      setToastMessage('Budget reallocation applied live!');
    } catch (err: any) {
      console.error('Reallocation error:', err);
      setToastMessage('Failed to apply reallocation');
    }
  };

  // Create Task
  const handleCreateTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const created = await api.createTask(task);
      setTasks(prev => [created, ...prev]);
      setToastMessage('Task added successfully!');
    } catch (err: any) {
      console.error('Create task error:', err);
      setToastMessage('Failed to add task');
    }
  };

  // Update Task
  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const updatedTasks = await api.updateTask(id, updates);
      setTasks(updatedTasks);
    } catch (err: any) {
      console.error('Update task error:', err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: number) => {
    try {
      const remainingTasks = await api.deleteTask(id);
      setTasks(remainingTasks);
      setToastMessage('Task removed');
    } catch (err: any) {
      console.error('Delete task error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#241310] text-[#FFFFFF] flex selection:bg-[#F6C445] selection:text-[#140A09]">
      {/* Template Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Search Bar with rounded-full pill design */}
        <div className="pt-6 pb-4 px-6 lg:px-10 border-b border-[#381B16] bg-[#1C0E0C]">
          <div className="flex items-center justify-between gap-4">
            {/* Search Input with pill container & bottom line */}
            <div className="flex-1 max-w-xl">
              <div className="flex items-center gap-3 px-4 py-2 bg-[#281613] rounded-full border border-[#3E201B] focus-within:border-[#F6C445] transition-colors">
                <Search className="w-4 h-4 text-[#F6C445] shrink-0" />
                <input
                  type="text"
                  placeholder="SEARCH CAMPAIGNS, FUNNEL METRICS, TASKS..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold tracking-wider text-[#FFFFFF] placeholder-[#C4ABA1]/60 focus:outline-none uppercase"
                />
              </div>
            </div>

            {/* Download PPTX Button */}
            <a
              href={`${import.meta.env.BASE_URL}RISA_3_Slide_Strategy_Deck.pptx`}
              download="RISA_3_Slide_Strategy_Deck.pptx"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#F6C445] hover:bg-[#FFD15C] text-[#140A09] text-xs font-black rounded-full shadow-lg transition-transform hover:scale-105 uppercase tracking-wider shrink-0 cursor-pointer"
              title="Download 3-Slide Strategy Presentation (.pptx)"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Download 3-Slide Deck (.pptx)</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-full bg-[#381B16] text-[#F6C445]"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Breadcrumbs with rounded badge */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] font-extrabold uppercase tracking-wider text-[#FFFFFF]">
            <span className="px-2.5 py-1 bg-[#281613] text-[#F6C445] rounded-full border border-[#3E201B]">
              RISA FESTIVAL 2025
            </span>
            <span className="px-2.5 py-1 bg-[#34D399]/15 text-[#34D399] rounded-full border border-[#34D399]/30">
              EVENT DAY: 20 APR 2025
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#F6C445]" />
            <span className="text-[#C4ABA1]">
              {activeTab === 'dashboard' && 'ATTENDEE GROWTH & FUNNEL DASHBOARD'}
              {activeTab === 'diagnosis' && 'CAMPAIGN LEADERBOARD & CAC DIAGNOSIS'}
              {activeTab === 'tasks' && 'OPERATIONAL EXECUTION CHECKLIST'}
              {activeTab === 'chatbot' && 'LIVE AI COPILOT & DATA EXPLORER'}
            </span>
          </div>
        </div>

        {/* Content Tabs */}
        <main className="p-6 lg:p-10 flex-1">
          {activeTab === 'dashboard' && (
            <DashboardTab
              campaigns={campaigns}
              targets={targets}
              dailyMetrics={dailyMetrics}
              loading={loading}
              error={error}
              lastUpdated={lastUpdated}
              onRefresh={loadData}
              onUpdateTarget={handleUpdateTarget}
              onApplyReallocation={handleApplyReallocation}
            />
          )}

          {activeTab === 'diagnosis' && (
            <DiagnosisTab
              campaigns={campaigns}
              onUpdateCampaign={handleUpdateCampaign}
              onOpenResetModal={() => setIsResetModalOpen(true)}
              loading={loading}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksTab
              tasks={tasks}
              campaigns={campaigns}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              loading={loading}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'chatbot' && (
            <ChatbotTab
              campaigns={campaigns}
              targets={targets}
              onTaskCreated={handleCreateTask}
              onShowToast={msg => setToastMessage(msg)}
            />
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        loading={isResetting}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigChanged={loadData}
      />

      {/* Expandable Floating AI Copilot across all tabs */}
      <FloatingCopilot
        campaigns={campaigns}
        targets={targets}
        onTaskCreated={handleCreateTask}
        onShowToast={msg => setToastMessage(msg)}
        hidden={activeTab === 'chatbot'}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
