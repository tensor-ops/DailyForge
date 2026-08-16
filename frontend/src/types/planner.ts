export type CalendarEventType =
  | 'TASK'
  | 'HABIT'
  | 'GOAL_MILESTONE'
  | 'FOCUS'
  | 'MEETING'
  | 'LEARNING'
  | 'HEALTH'
  | 'BREAK'
  | 'CUSTOM';

export type EventStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'missed'
  | 'rescheduled'
  | 'cancelled';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CalendarEvent {
  id: string;
  _id?: string;
  userId?: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:30 AM"
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  status: EventStatus;
  priority: EventPriority;
  category: string;
  color?: string;
  recurrenceRule?: 'none' | 'daily' | 'weekdays' | 'weekly';
  goalId?: any;
  goalTitle?: string;
  milestoneId?: string | null;
  taskId?: any;
  habitId?: any;
  expectedGoalContribution?: string;
  completedAt?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DayHealthScore {
  score: number;
  status: 'HEALTHY' | 'SLIGHTLY_HEAVY' | 'OVERLOADED' | 'RECOVERY_NEEDED';
  breakdown: {
    capacity: number;
    focus: number;
    balance: number;
    recovery: number;
    goalAlignment: number;
  };
}

export interface PlannerCapacity {
  availableMinutes: number;
  plannedMinutes: number;
  remainingMinutes: number;
  formattedAvailable: string;
  formattedPlanned: string;
  formattedRemaining: string;
  isOverloaded: boolean;
  status: 'BALANCED' | 'NEAR_LIMIT' | 'OVER_CAPACITY';
  focusLoad: number;
  deepWorkLoad: number;
  recoveryLoad: number;
  recommendation: {
    action: string;
    reason: string;
    eventId?: string | null;
  } | null;
}

export interface OptimalWindow {
  activity: string;
  startTime: string;
  endTime: string;
  focusProbability: number;
  reason: string;
  category: string;
}

export interface PersonalRhythm {
  peak: string;
  productive: string;
  recovery: string;
}

export interface UnscheduledInboxItem {
  id: string;
  title: string;
  type: string;
  category: string;
  durationMinutes: number;
  priority: string;
  goalTitle?: string;
}

export interface WeekAtAGlance {
  plannedHours: string;
  completedHours: string;
  focusHours: string;
  missedHours: string;
  rescheduledHours: string;
  bestDay: { name: string; executionRate: number };
  weakestDay: { name: string; executionRate: number };
  goalContributions: Array<{ goalName: string; delta: string }>;
}

export interface PlannerOverviewResponse {
  date: string;
  startDate: string;
  endDate: string;
  view: 'day' | 'week' | 'month';
  events: CalendarEvent[];
  capacity: PlannerCapacity;
  dayHealth: DayHealthScore;
  optimalWindows: OptimalWindow[];
  personalRhythm: PersonalRhythm;
  currentBlock: CalendarEvent | null;
  unscheduledInbox: UnscheduledInboxItem[];
  weekAtAGlance: WeekAtAGlance;
}

export interface AutoSchedulePreviewResponse {
  date: string;
  proposedEvents: Array<{
    title: string;
    type: CalendarEventType;
    startTime: string;
    endTime: string;
    startMinutes: number;
    endMinutes: number;
    durationMinutes: number;
    category: string;
    color: string;
    goalTitle?: string;
  }>;
  changes: Array<{ action: string; item: string }>;
  capacityBefore: string;
  capacityAfter: string;
  goalAlignmentBefore: string;
  goalAlignmentAfter: string;
}
