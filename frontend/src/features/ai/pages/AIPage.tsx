import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { aiService } from '@/services/aiService';
import { AIInsight, AIChatMessage } from '@/types/ai';
import { Bot, Sparkles, Send } from 'lucide-react';

export const AIPage: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
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
    const loadInsights = async () => {
      const res = await aiService.getInsights();
      setInsights(res);
    };
    loadInsights();
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Habit Coach 🤖"
        description="Your personal behavioral intelligence system analyzing consistency, energy cycles, and habit loops."
        badge={
          <Badge variant="ai" size="md">
            <Sparkles className="h-3 w-3 mr-1" /> Neural Engine Active
          </Badge>
        }
      />

      {/* AI INSIGHTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((item) => (
          <Card
            key={item.id}
            variant="ai"
            className="p-5 flex flex-col justify-between space-y-4 bg-card/80"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant={item.type === 'pattern' ? 'ai' : item.type === 'recommendation' ? 'info' : 'success'}
                  size="sm"
                >
                  {item.type.toUpperCase()}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {Math.round(item.confidence * 100)}% Confidence
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {item.headline}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.explanation}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
              <span>{item.timestamp}</span>
              {item.actionLabel && (
                <button className="text-ai font-semibold hover:underline flex items-center gap-1">
                  {item.actionLabel} &rarr;
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* AI CHAT INTERFACE */}
      <Card className="p-0 bg-card border-border overflow-hidden flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-ai/15 text-ai flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Habit Coach Assistant
                <span className="h-2 w-2 rounded-full bg-success inline-block" />
              </h3>
              <p className="text-xs text-muted-foreground">
                Trained on behavioral science & habit data
              </p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-surface-sunken/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-card border border-border text-foreground rounded-bl-none shadow-sm'
                }`}
              >
                <p>{msg.content}</p>
              </div>
              <span className="text-[10px] text-muted-foreground px-2 pt-1">
                {msg.timestamp}
              </span>

              {/* Suggested Prompts if assistant */}
              {msg.suggestedPrompts && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-xs px-2.5 py-1 rounded-full border border-ai/30 bg-ai/5 text-ai hover:bg-ai/15 transition-colors"
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
              <Sparkles className="h-3.5 w-3.5 text-ai animate-spin" />
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
          className="p-3 bg-surface border-t border-border flex items-center gap-2"
        >
          <Input
            placeholder="Ask your habit coach about habits, timing, motivation..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="ai"
            size="md"
            disabled={!inputMessage.trim() || isTyping}
            rightIcon={<Send className="h-4 w-4" />}
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
