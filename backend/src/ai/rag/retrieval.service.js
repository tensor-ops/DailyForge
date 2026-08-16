const KnowledgeDocument = require('../../models/KnowledgeDocument');
const KnowledgeChunk = require('../../models/KnowledgeChunk');
const AIProviderFactory = require('../providers');

const SEED_KNOWLEDGE = [
  {
    title: 'Atomic Habits & Cue-Routine-Reward Loops',
    category: 'HABIT_FORMATION',
    author: 'James Clear & Behavioral Science',
    summary: 'Core principles of habit stacking, implementation intentions, and immediate reinforcement.',
    chunks: [
      {
        title: 'The Habit Loop & Cue Selection',
        content: 'Every habit begins with a cue (time, location, preceding event, emotional state, or other people). Stacking a new routine immediately after an established anchor habit produces 2.4x higher adherence.',
        tags: ['habit_loop', 'cues', 'habit_stacking'],
      },
      {
        title: 'The Two-Day Rule',
        content: 'Missing a habit once is an accident. Missing twice is the start of a new habit. The Two-Day Rule states you should never allow two consecutive days of missed execution on your core identity habits.',
        tags: ['two_day_rule', 'recovery', 'streak_protection'],
      },
    ],
  },
  {
    title: 'Circadian Peak Windows & Chronotype Alignment',
    category: 'PLANNING_AND_TIMEBOXING',
    author: 'Dr. Matthew Walker & Chronobiology',
    summary: 'Matching cognitive demand to biological circadian rhythm windows.',
    chunks: [
      {
        title: 'Morning Cortisol & Deep Work Alignment',
        content: 'Cognitive focus and complex problem-solving capabilities peak 2–4 hours after waking. High-friction habits and deep work tasks should be scheduled within this 90-minute morning window.',
        tags: ['circadian_rhythm', 'deep_work', 'optimal_windows'],
      },
    ],
  },
  {
    title: 'N-of-1 Behavioral Experimentation',
    category: 'BEHAVIOR_CHANGE',
    author: 'Behavioral Medicine Frameworks',
    summary: 'Applying single-subject scientific trials to optimize individual lifestyle routines.',
    chunks: [
      {
        title: 'Controlled Intervention Testing',
        content: 'When altering a routine (e.g. shifting time from 9 PM to 7 AM), maintain a 7-day baseline and a 14-day trial period to evaluate true statistical differences in completion and perceived friction.',
        tags: ['experiments', 'n_of_1', 'scientific_method'],
      },
    ],
  },
];

/**
 * Seed initial coaching knowledge base if empty
 */
async function seedKnowledgeBase() {
  const count = await KnowledgeDocument.countDocuments();
  if (count > 0) return;

  for (const docData of SEED_KNOWLEDGE) {
    const doc = await KnowledgeDocument.create({
      title: docData.title,
      category: docData.category,
      authorOrSource: docData.author,
      summary: docData.summary,
      chunkCount: docData.chunks.length,
      tags: docData.chunks.flatMap((c) => c.tags),
    });

    for (const chunk of docData.chunks) {
      await KnowledgeChunk.create({
        documentId: doc._id,
        category: docData.category,
        title: chunk.title,
        content: chunk.content,
        tags: chunk.tags,
      });
    }
  }
}

/**
 * Search coaching knowledge base using keyword / tag retrieval
 */
async function searchKnowledge(queryText, category = null, limit = 3) {
  await seedKnowledgeBase();

  const filter = {};
  if (category) filter.category = category;

  if (queryText) {
    const regex = new RegExp(queryText.trim().split(' ').join('|'), 'i');
    filter.$or = [{ title: regex }, { content: regex }, { tags: regex }];
  }

  const chunks = await KnowledgeChunk.find(filter).limit(limit).lean();

  return chunks.map((c) => ({
    id: c._id.toString(),
    category: c.category,
    title: c.title,
    content: c.content,
    tags: c.tags,
  }));
}

module.exports = {
  seedKnowledgeBase,
  searchKnowledge,
};
