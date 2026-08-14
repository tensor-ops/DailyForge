import { AIInsight, AIChatMessage } from '@/types/ai';

export const INITIAL_INSIGHTS: AIInsight[] = [
  {
    id: 'ins_1',
    type: 'pattern',
    headline: 'Peak Morning Consistency Detected',
    explanation: 'You are 34% more consistent with habits scheduled before 10:00 AM compared to evening routines.',
    confidence: 0.94,
    actionLabel: 'Optimize Schedule',
    timestamp: '2 hours ago',
  },
  {
    id: 'ins_2',
    type: 'recommendation',
    headline: 'Pair Reading with Post-Dinner Downtime',
    explanation: 'Your reading completion dips when pushed past 22:00. Shifting it 30 mins earlier could increase weekly consistency by 22%.',
    confidence: 0.88,
    actionLabel: 'Adjust Reminder',
    timestamp: '5 hours ago',
  },
  {
    id: 'ins_3',
    type: 'achievement',
    headline: '2-Week Streak Milestone Unlocked',
    explanation: 'You have maintained your Hydration & Fitness habits for 14 consecutive days. Neural habit formation threshold reached!',
    confidence: 0.99,
    actionLabel: 'View Badge',
    timestamp: 'Yesterday',
  },
];

export const aiService = {
  async getInsights(): Promise<AIInsight[]> {
    await new Promise((res) => setTimeout(res, 250));
    return INITIAL_INSIGHTS;
  },

  async sendMessage(message: string, _history: AIChatMessage[]): Promise<AIChatMessage> {
    await new Promise((res) => setTimeout(res, 600));
    
    let reply = "I analyzed your habit consistency. You've completed 84% of your planned routines this month, with your strongest execution in Health and Fitness.";
    
    if (message.toLowerCase().includes('reading') || message.toLowerCase().includes('fail') || message.toLowerCase().includes('struggle')) {
      reply = "Looking at your data, 'Mindful Reading' has a 78% completion rate. The primary friction is timing: you tend to mark it skipped when started after 10 PM. Try anchoring it right after dinner.";
    } else if (message.toLowerCase().includes('streak') || message.toLowerCase().includes('progress')) {
      reply = "You're on a solid 14-day streak for Morning Hydration and 12-day streak for Strength Training. Your consistency score is currently 87/100!";
    }

    return {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      sender: 'assistant',
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },
};
