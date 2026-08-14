export interface MockGoal {
  id: string;
  title: string;
  progress: number; // 0 to 100
  target: string;
  current: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MockScheduleItem {
  id: string;
  time: string;
  title: string;
  category: 'Health' | 'Fitness' | 'Study' | 'Work' | 'Personal' | 'Finance' | 'Mindfulness' | 'Other';
  status: 'completed' | 'pending' | 'missed';
}

export interface MockAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export const mockGoals: MockGoal[] = [
  {
    id: 'g1',
    title: 'Complete 30-day DSA challenge',
    progress: 80,
    target: '30 days',
    current: '24',
    deadline: 'Aug 25',
    priority: 'high',
  },
  {
    id: 'g2',
    title: 'Build DailyForge Dashboard',
    progress: 63,
    target: '30 tasks',
    current: '19',
    deadline: 'Aug 30',
    priority: 'medium',
  },
  {
    id: 'g3',
    title: 'Read 5 books this quarter',
    progress: 40,
    target: '5 books',
    current: '2',
    deadline: 'Sep 15',
    priority: 'low',
  },
];

export const mockSchedule: MockScheduleItem[] = [
  {
    id: 's1',
    time: '09:00',
    title: 'DSA Practice',
    category: 'Study',
    status: 'completed',
  },
  {
    id: 's2',
    time: '11:30',
    title: 'Work / Project Development',
    category: 'Work',
    status: 'completed',
  },
  {
    id: 's3',
    time: '15:00',
    title: 'Productivity Research',
    category: 'Work',
    status: 'completed',
  },
  {
    id: 's4',
    time: '18:30',
    title: 'Cardio & Strength Training',
    category: 'Fitness',
    status: 'pending',
  },
  {
    id: 's5',
    time: '21:00',
    title: 'Reading Atomic Habits',
    category: 'Personal',
    status: 'pending',
  },
];

export const mockAchievements: MockAchievement[] = [
  {
    id: 'a1',
    title: '7 Day Streak',
    description: 'Forged consistency for 7 consecutive days',
    icon: '🔥',
    unlocked: true,
    unlockedAt: '2026-08-10',
  },
  {
    id: 'a2',
    title: '30 Day Consistency',
    description: 'Maintained 80%+ consistency for a full month',
    icon: '🏆',
    unlocked: true,
    unlockedAt: '2026-08-01',
  },
  {
    id: 'a3',
    title: 'Early Starter',
    description: 'Completed a habit before 08:00 AM',
    icon: '⚡',
    unlocked: true,
    unlockedAt: '2026-08-14',
  },
  {
    id: 'a4',
    title: '100 Hours Learning',
    description: 'Logged 100 hours in study and learning categories',
    icon: '📚',
    unlocked: false,
  },
  {
    id: 'a5',
    title: '90% Weekly Completion',
    description: 'Reached 90% completion rate in a single week',
    icon: '🎯',
    unlocked: false,
  },
];
