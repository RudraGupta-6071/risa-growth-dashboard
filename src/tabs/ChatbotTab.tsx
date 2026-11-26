import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Check,
  X,
  CheckCircle2,
  HelpCircle,
  Bot,
  User,
  Plus,
  ChevronRight
} from 'lucide-react';
import { Campaign, Target, Task, SuggestedTask, ChatLog } from '../types';
import { sendChatMessage } from '../services/gemini';
import { api } from '../services/supabase';

interface ChatbotTabProps {
  campaigns: Campaign[];
  targets: Target[];
  onTaskCreated: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onShowToast: (msg: string) => void;
  isFloating?: boolean;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  showThought?: boolean;
  suggestedTask?: SuggestedTask | null;
  taskStatus?: 'pending' | 'confirmed' | 'dismissed';
}

export const ChatbotTab: React.FC<ChatbotTabProps> = ({
  campaigns,
  targets,
  onTaskCreated,
  onShowToast,
  isFloating = false
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    'How do I navigate this dashboard?',
    'Why is Paid Social underperforming?',
    'Which campaign has the best CAC?',
    'How many attendees are we short of the revised goal?',
    'Create a task to cut Creator Partners budget'
  ];

  useEffect(() => {
    let sid = localStorage.getItem('risa_chat_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem('risa_chat_session_id', sid);
    }
    setSessionId(sid);

    api.getChatLogs(sid).then((logs: ChatLog[]) => {
      if (logs && logs.length > 0) {
        const loaded: MessageItem[] = logs.map((l, idx) => {
          const parsed = parseTaskBlock(l.content);
          return {
            id: `log_${idx}_${l.id || idx}`,
            role: l.role,
            content: parsed.cleanText,
            suggestedTask: parsed.task,
            taskStatus: 'pending'
          };
        });
        setMessages(loaded);
      } else {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hey! I'm your **RISA Growth Copilot**. Ask me anything about the festival numbers, channels, or how to navigate the dashboard.`,
            taskStatus: 'pending'
          }
        ]);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const parseTaskBlock = (rawText: string): { cleanText: string; task: SuggestedTask | null } => {
    const taskRegex = /```task\s*([\s\S]*?)\s*```/;
    const match = rawText.match(taskRegex);

    if (!match) {
      return { cleanText: rawText, task: null };
    }

    try {
      const taskJson = JSON.parse(match[1]);
      const cleanText = rawText.replace(taskRegex, '').trim();
      return { cleanText, task: taskJson };
    } catch (e) {
      console.warn('Failed to parse task JSON block:', e);
      return { cleanText: rawText, task: null };
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    setInput('');

    const userMsgId = 'msg_' + Date.now();
    const newMessages: MessageItem[] = [
      ...messages,
      { id: userMsgId, role: 'user', content: textToSend }
    ];
    setMessages(newMessages);
    setLoading(true);

    if (sessionId) {
      api.saveChatLog({ session_id: sessionId, role: 'user', content: textToSend });
    }

    try {
      const conversationHistory = newMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const { reply, thought } = await sendChatMessage(conversationHistory, campaigns, targets, sessionId);
      const parsed = parseTaskBlock(reply);
      const assistantMsgId = 'reply_' + Date.now();

      setMessages(prev => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: parsed.cleanText,
          thought,
          showThought: false,
          suggestedTask: parsed.task,
          taskStatus: 'pending'
        }
      ]);

      if (sessionId) {
        api.saveChatLog({ session_id: sessionId, role: 'assistant', content: reply });
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: `An error occurred while communicating with the assistant. Please try again.`,
          taskStatus: 'pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTask = async (msgId: string, task: SuggestedTask) => {
    try {
      await onTaskCreated({
        title: task.title,
        description: task.description,
        campaign_id: task.campaign_id ?? null,
        owner: task.owner || 'Growth Lead',
        priority: task.priority || 'high',
        status: 'open',
        source: 'ai_suggested'
      });

      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, taskStatus: 'confirmed' } : m))
      );

      onShowToast('Task created! Added to the Tasks tab.');
    } catch (e) {
      console.error('Failed to create task:', e);
    }
  };

  const handleDismissTask = (msgId: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, taskStatus: 'dismissed' } : m))
    );
  };

  const handleNewChat = () => {
    const newSid = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('risa_chat_session_id', newSid);
    setSessionId(newSid);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hey! I'm your **RISA Growth Copilot**. Ask me anything about the festival numbers, channels, or how to navigate the dashboard.`,
        taskStatus: 'pending'
      }
    ]);
  };

  const renderFormattedText = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-black text-[#F6C445]">{part.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  return (
    <div
      className={`flex flex-col bg-[#2B1613] overflow-hidden ${
        isFloating
          ? 'h-full w-full'
          : 'h-[calc(100vh-14rem)] min-h-[550px] border border-[#3E201B] rounded-3xl shadow-2xl'
      }`}
    >
      {/* Disclaimer Header */}
      <div className="px-3.5 py-2 bg-[#1C0E0C] border-b border-[#3E201B] flex items-center justify-between text-[11px] text-[#C4ABA1]">
        <div className="flex items-center gap-1.5 min-w-0">
          <HelpCircle className="w-3.5 h-3.5 text-[#F6C445] shrink-0" />
          <span className="truncate">
            {isFloating ? 'Live 2025 festival data' : 'Answers strictly based on live 2025 festival data. Unanswerable questions are flagged.'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[10px] text-[#34D399] font-black uppercase">● Live AI</span>
          <button
            onClick={handleNewChat}
            className="text-[10px] bg-[#2B1613] hover:bg-[#381D19] text-[#F6C445] border border-[#3E201B] px-2.5 py-0.5 rounded-full font-bold transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Compact Single-Row Suggestion Chips */}
      <div className="px-3 py-2 bg-[#221210] border-b border-[#3E201B] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            disabled={loading}
            className="text-[10px] whitespace-nowrap shrink-0 bg-[#2B1613] hover:bg-[#381D19] text-[#FFFFFF] border border-[#3E201B] hover:border-[#F6C445] px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 font-bold"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#F6C445] shrink-0" />
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#F6C445] text-[#140A09] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-[#F6C445] text-[#140A09] font-bold rounded-tr-none shadow-md'
                  : 'bg-[#1C0E0C] border border-[#3E201B] text-[#FFFFFF] rounded-tl-none shadow-md'
              }`}
            >
              {msg.thought && (
                <div className="mb-2">
                  <button
                    onClick={() =>
                      setMessages(prev =>
                        prev.map(m => (m.id === msg.id ? { ...m, showThought: !m.showThought } : m))
                      )
                    }
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#F6C445] bg-[#2B1613] hover:bg-[#381D19] border border-[#3E201B] px-2.5 py-1 rounded-full transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{msg.showThought ? 'Hide Thinking Process' : 'View Thinking Process'}</span>
                  </button>
                  {msg.showThought && (
                    <div className="mt-2 p-3 bg-[#140A09] border border-[#3E201B] rounded-2xl text-[11px] text-[#C4ABA1] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                      {msg.thought}
                    </div>
                  )}
                </div>
              )}

              <div className="whitespace-pre-line prose prose-invert prose-xs">
                {msg.role === 'assistant' ? renderFormattedText(msg.content) : msg.content}
              </div>

              {msg.suggestedTask && (
                <div className="mt-3 p-4 bg-[#2B1613] border border-[#F6C445]/60 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-[#F6C445]">
                    <span className="flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Proposed Action Item
                    </span>
                    <span className="capitalize px-2 py-0.5 bg-[#F6C445]/15 text-[#F6C445] rounded-full font-bold text-[10px]">
                      {msg.suggestedTask.priority} priority
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#FFFFFF] text-xs">
                      {msg.suggestedTask.title}
                    </h5>
                    <p className="text-[11px] text-[#C4ABA1] mt-0.5">
                      {msg.suggestedTask.description}
                    </p>
                  </div>

                  {msg.taskStatus === 'pending' ? (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3E201B]">
                      <button
                        onClick={() => handleDismissTask(msg.id)}
                        className="px-3 py-1 rounded-full bg-[#381D19] text-[#C4ABA1] hover:text-[#FFFFFF] text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3 h-3" /> Dismiss
                      </button>
                      <button
                        onClick={() => handleConfirmTask(msg.id, msg.suggestedTask!)}
                        className="px-4 py-1 rounded-full bg-[#34D399] hover:bg-[#34D399]/90 text-[#140A09] font-black text-[11px] flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Check className="w-3 h-3" /> Confirm & Add
                      </button>
                    </div>
                  ) : msg.taskStatus === 'confirmed' ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#34D399] pt-1 font-black">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Added to Tasks tab
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#C4ABA1] pt-1 italic">
                      Proposal dismissed
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#381D19] border border-[#3E201B] text-[#FFFFFF] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-[#F6C445]" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F6C445] text-[#140A09] flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#1C0E0C] border border-[#3E201B] rounded-3xl p-3 text-xs text-[#C4ABA1] flex items-center gap-2">
              <span className="font-bold">Evaluating live dataset</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-[#F6C445] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-[#F6C445] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-[#F6C445] rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar (Rounded-full) */}
      <div className="p-4 bg-[#1C0E0C] border-t border-[#3E201B]">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask anything about CAC, show-up rates, or draft a growth task..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[#2B1613] border border-[#3E201B] focus:border-[#F6C445] rounded-full px-5 py-3 text-xs text-[#FFFFFF] placeholder-[#C4ABA1]/60 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#F6C445] hover:bg-[#FDE047] text-[#140A09] p-3 rounded-full transition-colors disabled:opacity-50 shrink-0 font-bold shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
