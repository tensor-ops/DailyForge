import { Habit, CreateHabitInput } from '@/types/habit';

export const INITIAL_MOCK_HABITS: Habit[] = [
  {
    id: 'h_1',
    userId: 'usr_01_demo',
    name: 'Morning Hydration & Electrolytes',
    description: 'Drink 500ml water with lemon and pinch of sea salt',
    category: 'Health',
    icon: '💧',
    frequency: 'daily',
    targetValue: 500,
    unit: 'ml',
    reminderTime: '07:30',
    startDate: '2025-01-15',
    color: '#38bdf8',
    isArchived: false,
    currentStreak: 14,
    longestStreak: 21,
    totalCompletions: 42,
    completionRate: 92,
    completedToday: true,
    history: {},
    createdAt: '2025-01-15T07:00:00Z',
    updatedAt: '2025-02-14T07:35:00Z',
  },
  {
    id: 'h_2',
    userId: 'usr_01_demo',
    name: 'Deep Work Session (DSA / System Design)',
    description: '45 mins uninterrupted coding & algorithms practice',
    category: 'Study',
    icon: '🧠',
    frequency: 'weekdays',
    targetValue: 45,
    unit: 'mins',
    reminderTime: '09:00',
    startDate: '2025-01-20',
    color: '#818cf8',
    isArchived: false,
    currentStreak: 8,
    longestStreak: 15,
    totalCompletions: 26,
    completionRate: 85,
    completedToday: false,
    history: {},
    createdAt: '2025-01-20T09:00:00Z',
    updatedAt: '2025-02-13T09:45:00Z',
  },
  {
    id: 'h_3',
    userId: 'usr_01_demo',
    name: 'Strength Training & Core',
    description: 'Push/Pull/Legs rotation with compound lifts',
    category: 'Fitness',
    icon: '⚡',
    frequency: 'daily',
    targetValue: 45,
    unit: 'mins',
    reminderTime: '17:30',
    startDate: '2025-01-10',
    color: '#f43f5e',
    isArchived: false,
    currentStreak: 12,
    longestStreak: 18,
    totalCompletions: 34,
    completionRate: 88,
    completedToday: true,
    history: {},
    createdAt: '2025-01-10T17:00:00Z',
    updatedAt: '2025-02-14T18:15:00Z',
  },
  {
    id: 'h_4',
    userId: 'usr_01_demo',
    name: 'Mindful Reading (20 Pages)',
    description: 'Read non-fiction or tech architecture literature',
    category: 'Personal',
    icon: '📖',
    frequency: 'daily',
    targetValue: 20,
    unit: 'pages',
    reminderTime: '21:30',
    startDate: '2025-01-12',
    color: '#a855f7',
    isArchived: false,
    currentStreak: 5,
    longestStreak: 12,
    totalCompletions: 29,
    completionRate: 78,
    completedToday: false,
    history: {},
    createdAt: '2025-01-12T21:00:00Z',
    updatedAt: '2025-02-13T22:00:00Z',
  },
  {
    id: 'h_5',
    userId: 'usr_01_demo',
    name: 'Evening Reflection & Journaling',
    description: 'Note down 3 key wins and tomorrow priority list',
    category: 'Mindfulness',
    icon: '✨',
    frequency: 'daily',
    targetValue: 10,
    unit: 'mins',
    reminderTime: '22:15',
    startDate: '2025-01-25',
    color: '#10b981',
    isArchived: false,
    currentStreak: 10,
    longestStreak: 10,
    totalCompletions: 19,
    completionRate: 90,
    completedToday: false,
    history: {},
    createdAt: '2025-01-25T22:00:00Z',
    updatedAt: '2025-02-13T22:30:00Z',
  },
];

const HABITS_STORAGE_KEY = 'ai_habit_items';

function getStoredHabits(): Habit[] {
  const data = localStorage.getItem(HABITS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_HABITS));
    return INITIAL_MOCK_HABITS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MOCK_HABITS;
  }
}

function saveStoredHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
}

export const habitService = {
  async getHabits(): Promise<Habit[]> {
    await new Promise((res) => setTimeout(res, 200));
    return getStoredHabits();
  },

  async getHabitById(id: string): Promise<Habit | null> {
    await new Promise((res) => setTimeout(res, 150));
    const habits = getStoredHabits();
    return habits.find((h) => h.id === id) || null;
  },

  async createHabit(input: CreateHabitInput): Promise<Habit> {
    await new Promise((res) => setTimeout(res, 300));
    const habits = getStoredHabits();
    const newHabit: Habit = {
      ...input,
      id: 'h_' + Math.random().toString(36).substring(2, 9),
      userId: 'usr_01_demo',
      isArchived: false,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      completionRate: 0,
      completedToday: false,
      history: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newHabit, ...habits];
    saveStoredHabits(updated);
    return newHabit;
  },

  async toggleComplete(id: string): Promise<Habit> {
    await new Promise((res) => setTimeout(res, 150));
    const habits = getStoredHabits();
    const habit = habits.find((h) => h.id === id);
    if (!habit) throw new Error('Habit not found');

    const willBeCompleted = !habit.completedToday;
    const newStreak = willBeCompleted
      ? habit.currentStreak + 1
      : Math.max(0, habit.currentStreak - 1);
    const newTotal = willBeCompleted
      ? habit.totalCompletions + 1
      : Math.max(0, habit.totalCompletions - 1);

    const updatedHabit: Habit = {
      ...habit,
      completedToday: willBeCompleted,
      currentStreak: newStreak,
      longestStreak: Math.max(habit.longestStreak, newStreak),
      totalCompletions: newTotal,
      completionRate: Math.min(100, Math.round((newTotal / (newTotal + 4)) * 100)),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = habits.map((h) => (h.id === id ? updatedHabit : h));
    saveStoredHabits(updatedList);
    return updatedHabit;
  },

  async deleteHabit(id: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 200));
    const habits = getStoredHabits();
    const updated = habits.filter((h) => h.id !== id);
    saveStoredHabits(updated);
  },
};
