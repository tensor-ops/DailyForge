import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { aiFoundationService } from '@/services/aiFoundationService';
import { habitService } from '@/services/habitService';
import { goalService } from '@/services/goalService';
import { analyticsService } from '@/services/analyticsService';
import { ChatMessage } from '@/types/aiFoundation';
import { ForgeInsightsDashboard } from '../components/ForgeInsightsDashboard';
import {
  Bot,
  Sparkles,
  Send,
  Flame,
  Target,
  CheckCircle2,
  Zap,
  Check,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const AIPage: React.FC = () => {
  useDocumentTitle('DailyForge — AI Coach & Insights');

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'insights';

  const { success, error, info } = useToast();

  // Context Metrics Pill State
  const [habitCount, setHabitCount] = useState(0);
  const [goalCount, setGoalCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [momentumScore, setMomentumScore] = useState(82);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_initial',
      role: 'assistant',
      agentType: 'GENERAL_COACH',
      content:
        "Welcome to Daily Forge Coach. I have direct access to your habits, calendar schedules, streaks, and Forge Lab experiments. What would you like to strategize today?",
      createdAt: new Date().toISOString(),
      suggestedQuickReplies: [
        'Why am I struggling?',
        'Plan my day',
        'Improve a habit',
        'Protect my streak',
        'Analyze my week',
        'Suggest an experiment',
        'How am I progressing?',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    'Why am I struggling?',
    'Plan my day',
    'Improve a habit',
    'Protect my streak',
    'Analyze my week',
    'Suggest an experiment',
    'How am I progressing?',
  ];

  useEffect(() => {
    // Load live context numbers for header pill
    const loadContextPill = async () => {
      try {
        const [habits, goals, analytics] = await Promise.all([
          habitService.getHabits(),
          goalService.getGoals(),
          analyticsService.getAnalyticsSummary('30d').catch(() => null),
        ]);
        setHabitCount(habits.length);
        setGoalCount(goals.goals?.length || 0);
        const maxStreak = Math.max(...habits.map((h) => h.currentStreak || 0), 0);
        setStreakCount(maxStreak);
        if (analytics?.forgeScore?.overallScore) {
          setMomentumScore(analytics.forgeScore.overallScore);
        }
      } catch (err) {
        console.error('Failed to load coach context metrics:', err);
      }
    };
    loadContextPill();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    setInputMessage('');
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await aiFoundationService.sendChatMessage(text, conversationId);
      setConversationId(res.conversationId);
      setMessages((prev) => [...prev, res.message]);
    } catch {
      error('Coach Unavailable', 'Forge Intelligence is temporarily unavailable. Please retry.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmAction = async (msgId: string) => {
    try {
      const res = await aiFoundationService.confirmAction(msgId);
      success('Action Executed! ✨', res.message);
      setMessages((prev) =>
        prev.map((m) =>
          (m.id === msgId || (m as any)._id === msgId) && m.proposedAction
            ? { ...m, proposedAction: { ...m.proposedAction, status: 'CONFIRMED' } }
            : m
        )
      );
    } catch {
      error('Action Failed', 'Could not confirm execution.');
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        (m.id === msgId || (m as any)._id === msgId) && m.proposedAction
          ? { ...m, proposedAction: { ...m.proposedAction, status: 'CANCELLED' } }
          : m
      )
    );
    info('Action Cancelled', 'No modifications made.');
  };

  const getAgentTag = (agentType?: string) => {
    switch (agentType) {
      case 'HABIT_COACH':
        return { label: 'Habit Coach', color: 'bg-primary/15 border-primary/30 text-primary' };
      case 'PLANNER_OPTIMIZER':
        return { label: 'Planner Optimizer', color: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' };
      case 'GOAL_STRATEGIST':
        return { label: 'Goal Strategist', color: 'bg-purple-500/15 border-purple-500/30 text-purple-400' };
      case 'RECOVERY_COACH':
        return { label: 'Recovery Coach', color: 'bg-amber-500/15 border-amber-500/30 text-amber-400' };
      case 'MOMENTUM_ANALYST':
        return { label: 'Momentum Analyst', color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' };
      case 'EXPERIMENT_SCIENTIST':
        return { label: 'Experiment Scientist', color: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' };
      case 'PROGRESS_NARRATOR':
        return { label: 'Progress Narrator', color: 'bg-rose-500/15 border-rose-500/30 text-rose-400' };
      default:
        return { label: 'AI Coach', color: 'bg-primary/15 border-primary/30 text-primary' };
    }
  };

  if (currentTab !== 'coach') {
    return <ForgeInsightsDashboard />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in pb-12">
      {/* Header with Real Context Pill */}
      <PageHeader
        title="AI Coach"
        description="Your personal execution strategist."
      />

      {/* Real Context Metrics Bar */}
      <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground font-semibold">
          <Bot className="h-4 w-4 text-primary shrink-0" />
          <span>Active Context:</span>
        </div>
        <div className="flex items-center gap-3 text-foreground font-mono font-bold text-[11px] flex-wrap">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            <span>{habitCount} Active Habits</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3 text-purple-400" />
            <span>{goalCount} Goals</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-amber-400" />
            <span>{streakCount}-Day Streak</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-emerald-400" />
            <span>{momentumScore} Momentum</span>
          </span>
        </div>
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-bold text-xs">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(action)}
            className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-muted border border-border text-foreground hover:text-primary transition-all text-xs font-semibold whitespace-nowrap cursor-pointer shadow-sm active:scale-[0.98]"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <Card className="p-4 sm:p-6 min-h-[500px] flex flex-col justify-between space-y-4 border border-border/80 bg-[#090F1E]">
        <div className="space-y-4 overflow-y-auto max-h-[58vh] pr-2">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const agentTag = getAgentTag(msg.agentType);

            return (
              <div
                key={msg.id || idx}
                className={cn('flex flex-col gap-1 text-xs', isUser ? 'items-end' : 'items-start')}
              >
                {!isUser && (
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={cn(
                        'text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider',
                        agentTag.color
                      )}
                    >
                      {agentTag.label}
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    'p-4 rounded-2xl max-w-[90%] sm:max-w-[80%] whitespace-pre-wrap leading-relaxed shadow-sm',
                    isUser
                      ? 'bg-primary text-white font-semibold rounded-br-none'
                      : 'bg-surface-elevated border border-border/80 text-foreground rounded-bl-none'
                  )}
                >
                  {msg.content}
                </div>

                {/* Evidence Drawer Capsule on message */}
                {!isUser && msg.evidence && (
                  <div className="p-2.5 rounded-xl bg-surface-sunken border border-border/60 max-w-[80%] text-[11px] flex items-center justify-between text-muted-foreground">
                    <span className="font-semibold">{msg.evidence.metric}</span>
                    <span className="font-mono font-bold text-emerald-400">{msg.evidence.difference}</span>
                  </div>
                )}

                {/* Action Preview Card (for write operations) */}
                {!isUser && msg.proposedAction && msg.proposedAction.status === 'PENDING' && (
                  <div className="p-4 rounded-2xl bg-surface-sunken border-2 border-primary/30 max-w-[85%] space-y-3 mt-1 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" />
                        <span>Action Proposal (Requires Confirmation)</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground">
                      {msg.proposedAction.title}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-surface-elevated border border-border/70">
                        <span className="text-[9px] text-muted-foreground block font-bold uppercase">Current</span>
                        <span className="text-muted-foreground font-mono">{msg.proposedAction.currentValue}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-elevated border border-primary/30">
                        <span className="text-[9px] text-primary block font-bold uppercase">Proposed</span>
                        <span className="text-emerald-400 font-mono font-bold">{msg.proposedAction.proposedValue}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground leading-snug">
                      {msg.proposedAction.impactDescription}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleCancelAction(msg.id || (msg as any)._id)}
                        className="px-3 py-1.5 bg-surface-elevated hover:bg-muted border border-border text-muted-foreground text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmAction(msg.id || (msg as any)._id)}
                        className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-[0.98]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Confirm & Apply</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirmed Action Badge */}
                {!isUser && msg.proposedAction && msg.proposedAction.status === 'CONFIRMED' && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 max-w-[80%]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Action Confirmed & Synchronized with Daily Forge.</span>
                  </div>
                )}

                {/* Suggested Quick Replies */}
                {!isUser && msg.suggestedQuickReplies && msg.suggestedQuickReplies.length > 0 && idx === messages.length - 1 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestedQuickReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => handleSendMessage(reply)}
                        className="px-2.5 py-1 rounded-lg bg-surface-sunken hover:bg-surface-elevated border border-border/80 text-[11px] text-muted-foreground hover:text-foreground font-semibold transition-all cursor-pointer"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface-elevated border border-border max-w-xs text-xs font-bold text-muted-foreground animate-pulse">
              <Sparkles className="h-4 w-4 text-primary animate-spin" />
              <span>Analyzing execution telemetry...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-3 border-t border-border/60"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask your execution strategist (e.g. 'Why am I missing DSA?', 'Plan tomorrow', 'Protect my streak')..."
            className="flex-1 h-11 px-4 rounded-xl bg-surface-sunken border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="h-11 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </button>
        </form>
      </Card>
    </div>
  );
};
