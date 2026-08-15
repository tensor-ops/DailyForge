import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { aiService } from '@/services/aiService';
import { analyticsService } from '@/services/analyticsService';
import { AIChatMessage } from '@/types/ai';
import { Bot, Sparkles, Send } from 'lucide-react';
import { ForgeInsightsDashboard } from '../components/ForgeInsightsDashboard';

export const AIPage: React.FC = () => {
  useDocumentTitle('DailyForge — AI Coach');
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const [behaviorData, setBehaviorData] = useState<any>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      content:
        'Hello Alex! I am your AI Habit Coach. I analyze your daily completion patterns, time-of-day momentum, and habit friction points. What would you like to explore today?',
      timestamp: 'Just now',
      suggestedPrompts: [
        'Why is my reading habit inconsistent?',
        'How can I optimize my morning routine?',
        'What is my strongest behavioral streak?',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBehavior = async () => {
      try {
        const res = await analyticsService.getBehaviorAnalytics('30d');
        setBehaviorData(res);
      } catch (err) {
        console.error(err);
      }
    };
    loadBehavior();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim()) return;

    const userMsg: AIChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await aiService.sendMessage(messageText, messages);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // 1. Conditionally render the ForgeInsights Dashboard if tab is not coach
  if (currentTab !== 'coach') {
    return <ForgeInsightsDashboard behaviorData={behaviorData} />;
  }

  // 2. Otherwise render the Coach Chat Interface
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in">
      <PageHeader
        title="AI Habit Coach"
        description="Your personal behavioral intelligence system analyzing consistency, energy cycles, and habit loops."
        actions={
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Neural Engine Active
          </span>
        }
      />

      {/* AI CHAT INTERFACE */}
      <Card className="p-0 bg-card border-border overflow-hidden flex flex-col h-[520px] rounded-[14px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-border/80 bg-[#101622] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Habit Coach Assistant
                <span className="h-2 w-2 rounded-full bg-success inline-block" />
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Trained on behavioral science & habit data
              </p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#080C14]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs font-semibold leading-relaxed text-left ${
                  msg.sender === 'user'
                    ? 'bg-primary text-slate-100 rounded-br-none'
                    : 'bg-[#101622] border border-[#1D293D] text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <p>{msg.content}</p>
              </div>
              <span className="text-[10px] text-muted-foreground px-2 pt-1 font-semibold">
                {msg.timestamp}
              </span>

              {/* Suggested Prompts if assistant */}
              {msg.suggestedPrompts && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[10px] px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 transition-colors font-bold cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" />
              <span>AI Coach is analyzing habit patterns...</span>
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
          className="p-3 bg-[#101622] border-t border-border flex items-center gap-2"
        >
          <Input
            placeholder="Ask your habit coach about habits, timing, motivation..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </Card>
    </div>
  );
};
