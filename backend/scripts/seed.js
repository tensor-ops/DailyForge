const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/User');
const Habit = require('../src/models/Habit');
const HabitCompletion = require('../src/models/HabitCompletion');
const AIInsight = require('../src/models/AIInsight');
const AIConversation = require('../src/models/AIConversation');
const { calculateHabitStats } = require('../src/services/streak.service');
const { getPastDateStr } = require('../src/utils/dates');

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(config.mongoUri);

    console.log('Clearing existing seed data...');
    await User.deleteMany({});
    await Habit.deleteMany({});
    await HabitCompletion.deleteMany({});
    await AIInsight.deleteMany({});
    await AIConversation.deleteMany({});

    console.log('Creating demo user...');
    const demoUser = new User({
      name: 'Demo Architect',
      email: 'demo@aihabittracker.com',
      passwordHash: 'Password123!', // Pre-save hook hashes password
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timezone: 'Asia/Kolkata',
      preferences: {
        theme: 'dark',
        emailNotifications: true,
        dailyReminderTime: '08:00',
        aiInsightsEnabled: true,
        weeklyReportEnabled: true,
      },
    });
    await demoUser.save();
    const userId = demoUser._id;

    console.log('Creating demo habits...');
    const habitsData = [
      {
        name: 'Read 20 Pages',
        description: 'Read technical books or personal growth literature daily',
        category: 'Study',
        icon: 'book',
        frequency: 'daily',
        targetValue: 20,
        unit: 'pages',
        reminderTime: '21:00',
        startDate: getPastDateStr(30),
        color: '#6366f1',
      },
      {
        name: 'Morning Workout',
        description: '30-minute cardio & strength routine',
        category: 'Fitness',
        icon: 'dumbell',
        frequency: 'weekdays',
        targetValue: 30,
        unit: 'mins',
        reminderTime: '07:00',
        startDate: getPastDateStr(30),
        color: '#10b981',
      },
      {
        name: '10-Min Mindfulness',
        description: 'Guided breathwork or silent meditation',
        category: 'Mindfulness',
        icon: 'brain',
        frequency: 'daily',
        targetValue: 10,
        unit: 'mins',
        reminderTime: '08:00',
        startDate: getPastDateStr(25),
        color: '#8b5cf6',
      },
      {
        name: 'Daily Expense Logging',
        description: 'Log all personal expenses before sleep',
        category: 'Finance',
        icon: 'dollar-sign',
        frequency: 'daily',
        targetValue: 1,
        unit: 'log',
        reminderTime: '22:00',
        startDate: getPastDateStr(20),
        color: '#f59e0b',
      },
    ];

    const createdHabits = [];
    for (const hData of habitsData) {
      const habit = await Habit.create({ ...hData, userId });
      createdHabits.push(habit);
    }

    console.log('Generating past completion history (30-day realistic patterns)...');
    for (const habit of createdHabits) {
      // Simulate high completion for Read & Mindfulness, moderate for Workout
      let completionRatio = 0.85;
      if (habit.category === 'Fitness') completionRatio = 0.7;

      for (let i = 29; i >= 0; i--) {
        const dateStr = getPastDateStr(i);
        if (Math.random() < completionRatio) {
          try {
            await HabitCompletion.create({
              habitId: habit._id,
              userId,
              date: dateStr,
              completedAt: new Date(),
            });
          } catch (e) {
            // ignore duplicate safety
          }
        }
      }

      // Update cached stats on Habit model
      const stats = await calculateHabitStats(habit._id, userId, habit.startDate);
      habit.currentStreak = stats.currentStreak;
      habit.longestStreak = stats.longestStreak;
      habit.totalCompletions = stats.totalCompletions;
      habit.completionRate = stats.completionRate;
      await habit.save();
    }

    console.log('Seeding initial AI insights & conversation history...');
    await AIInsight.create([
      {
        userId,
        type: 'achievement',
        headline: '30-Day Milestone Reached!',
        explanation: 'Your reading habit consistency has reached 85%. You are in the top 5% of consistent readers this month.',
        confidence: 0.95,
        actionLabel: 'View Reading Stats',
      },
      {
        userId,
        type: 'pattern',
        headline: 'Morning Energy Pattern Detected',
        explanation: 'Your fitness completions double when logged before 9:00 AM compared to evening attempts.',
        confidence: 0.89,
        actionLabel: 'Adjust Alarm',
      },
    ]);

    await AIConversation.create({
      userId,
      messages: [
        {
          sender: 'user',
          content: 'How can I maintain my reading streak when traveling?',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          sender: 'assistant',
          content: 'Switch to audiobooks or lower your target to 5 pages on travel days to keep the streak active without overwhelming your schedule!',
          timestamp: new Date(Date.now() - 3500000),
          suggestedPrompts: ['How to set up travel habits?', 'What is habit scaling?'],
        },
      ],
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n--- DEMO USER CREDENTIALS ---');
    console.log('Email: demo@aihabittracker.com');
    console.log('Password: Password123!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
