const AIMemory = require('../../models/AIMemory');
const AIMemoryEvent = require('../../models/AIMemoryEvent');

/**
 * Get active memories for a user, optionally filtered by type (FACT, ANALYTIC, EPISODIC)
 */
async function getUserMemories(userId, type = null) {
  const query = {
    userId,
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  };

  if (type) query.type = type;

  return AIMemory.find(query).sort({ confidence: -1, updatedAt: -1 }).lean();
}

/**
 * Store or update a memory item
 */
async function remember(userId, { type, key, value, confidence = 0.85, source = 'BEHAVIOR_OBSERVATION', tags = [], expiresAt = null }) {
  let memory = await AIMemory.findOne({ userId, key, type, isActive: true });

  if (memory) {
    memory.value = value;
    memory.confidence = Math.min(1.0, memory.confidence + 0.05); // Reinforce confidence
    memory.source = source;
    if (tags.length > 0) memory.tags = Array.from(new Set([...memory.tags, ...tags]));
    if (expiresAt) memory.expiresAt = expiresAt;
    await memory.save();

    await AIMemoryEvent.create({
      userId,
      memoryId: memory._id,
      eventType: 'REINFORCED',
      context: 'Memory reinforced via observation',
    });

    return memory;
  }

  memory = await AIMemory.create({
    userId,
    type,
    key,
    value,
    confidence,
    source,
    tags,
    expiresAt,
    isActive: true,
  });

  await AIMemoryEvent.create({
    userId,
    memoryId: memory._id,
    eventType: 'CREATED',
    context: 'Initial memory creation',
  });

  return memory;
}

/**
 * Invalidate / delete a memory item
 */
async function forget(userId, memoryId) {
  const memory = await AIMemory.findOneAndUpdate(
    { _id: memoryId, userId },
    { isActive: false },
    { new: true }
  );

  if (memory) {
    await AIMemoryEvent.create({
      userId,
      memoryId: memory._id,
      eventType: 'INVALIDATED',
      context: 'Explicit user deletion or invalidation',
    });
  }

  return memory;
}

/**
 * Extract memories formatted for LLM context injection
 */
async function getMemoryContextForLLM(userId) {
  const memories = await getUserMemories(userId);
  const facts = memories.filter((m) => m.type === 'FACT');
  const analytics = memories.filter((m) => m.type === 'ANALYTIC');
  const episodic = memories.filter((m) => m.type === 'EPISODIC');

  return {
    facts: facts.map((m) => `${m.key}: ${typeof m.value === 'object' ? JSON.stringify(m.value) : m.value}`),
    analyticPatterns: analytics.map((m) => `${m.key}: ${typeof m.value === 'object' ? JSON.stringify(m.value) : m.value}`),
    episodicHighlights: episodic.map((m) => `${m.key}: ${typeof m.value === 'object' ? JSON.stringify(m.value) : m.value}`),
  };
}

module.exports = {
  getUserMemories,
  remember,
  forget,
  getMemoryContextForLLM,
};
