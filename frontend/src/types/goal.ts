export type GoalCategory =
  | 'Career'
  | 'Education'
  | 'Health'
  | 'Finance'
  | 'Personal'
  | 'Fitness'
  | 'Relationships'
  | 'Projects'
  | 'Other';

export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';

export type GoalStatus =
  | 'ON_TRACK'
  | 'AHEAD'
  | 'AT_RISK'
  | 'BEHIND'
  | 'COMPLETED'
  | 'PAUSED'
  | 'OVERDUE';

export type GoalTargetType =
  | 'percentage'
  | 'numeric'
  | 'count'
  | 'completion'
  | 'milestone_based'
  | 'custom';

export interface GoalMilestone {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number; // 0-100
  weight: number;
  dueDate?: string | null;
  completedAt?: string | null;
}

export interface GoalProgressHistory {
  date: string;
  progress: number;
  source: 'manual' | 'milestone' | 'habit' | 'task' | 'system';
  recordedAt?: string;
}

export interface GoalActivity {
  _id?: string;
  activityType:
    | 'CREATED'
    | 'PROGRESS_UPDATED'
    | 'MILESTONE_COMPLETED'
    | 'MILESTONE_ADDED'
    | 'HABIT_LINKED'
    | 'HABIT_UNLINKED'
    | 'TASK_LINKED'
    | 'TASK_COMPLETED'
    | 'STATUS_CHANGED'
    | 'PAUSED'
    | 'RESUMED'
    | 'ARCHIVED';
  title: string;
  description?: string;
  createdAt: string;
}

export interface GoalTrajectoryPoint {
  step: string;
  actual: number;
  expected: number;
  target: number;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  targetType: GoalTargetType;
  currentValue: number;
  targetValue: number;
  unit: string;
  startDate?: string;
  targetDate?: string | null;
  deadline?: string | null;
  progress: number; // 0-100
  velocity: number; // e.g. +6
  expectedCompletionDate?: string | null;
  habits: any[]; // Populated Habit objects or IDs
  tasks: any[]; // Populated Task objects or IDs
  milestones: GoalMilestone[];
  progressHistory?: GoalProgressHistory[];
  activities?: GoalActivity[];
  trajectory?: GoalTrajectoryPoint[];
  isArchived: boolean;
  archivedAt?: string | null;
  completedAt?: string | null;
  pausedAt?: string | null;
  emoji?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalOverviewSummary {
  activeGoals: number;
  averageProgress: number;
  onTrackCount: number;
  atRiskCount: number;
}

export interface GoalsResponse {
  goals: Goal[];
  summary: GoalOverviewSummary;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  category?: GoalCategory;
  priority?: GoalPriority;
  targetType?: GoalTargetType;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  startDate?: string;
  targetDate?: string;
  deadline?: string;
  habits?: string[];
  tasks?: string[];
  milestones?: Array<{
    title: string;
    description?: string;
    weight?: number;
    dueDate?: string;
  }>;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  status?: GoalStatus;
  progress?: number;
  currentValue?: number;
}
