export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledStart?: string; // YYYY-MM-DD
  scheduledEnd?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  goalId?: string;
  habitId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  scheduledStart?: string;
  scheduledEnd?: string;
  estimatedMinutes?: number;
  goalId?: string;
  habitId?: string;
}
