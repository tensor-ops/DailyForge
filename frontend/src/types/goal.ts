export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  targetValue: number;
  deadline: string | null;
  habits: string[]; // habit IDs
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'failed';
  milestones: GoalMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  label: string;
  targetPercent: number;
  achievedAt: string | null;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  targetValue?: number;
  deadline?: string;
  habits?: string[];
  milestones?: GoalMilestone[];
}

export interface ParsedHabit {
  name: string;
  description: string;
  category: string;
  icon: string;
  frequency: string;
  customDays: number[];
  targetValue: number;
  unit: string;
  reminderTime: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  color: string;
  startDate: string;
}

export interface GoalPlan {
  goalName: string;
  goalDescription: string;
  emoji: string;
  suggestedDeadlineDays: number;
  habits: GoalPlanHabit[];
}

export interface GoalPlanHabit {
  name: string;
  description: string;
  category: string;
  icon: string;
  frequency: string;
  targetValue: number;
  unit: string;
  timeOfDay: string;
  color: string;
  rationale: string;
}
