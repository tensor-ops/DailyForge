const AIUsage = require('../../models/AIUsage');
const aiConfig = require('../config/aiConfig');

/**
 * Record an AI request execution for token tracking, costs, and telemetry
 */
async function trackUsage(userId, {
  provider = 'local',
  model = 'default',
  requestType = 'COACH_CHAT',
  inputTokens = 0,
  outputTokens = 0,
  latencyMs = 0,
  status = 'SUCCESS',
  errorMessage = null,
  toolsInvoked = [],
}) {
  try {
    const pricing = aiConfig.pricing[model] || { input: 0.00015, output: 0.0006 };
    const costUsd =
      (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;

    return await AIUsage.create({
      userId,
      provider,
      model,
      requestType,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCostUsd: parseFloat(costUsd.toFixed(6)),
      latencyMs,
      status,
      errorMessage,
      toolsInvoked,
    });
  } catch (err) {
    console.error('Failed to log AI usage:', err.message);
    return null;
  }
}

/**
 * Get aggregate usage metrics for a user
 */
async function getUserUsageStats(userId) {
  const records = await AIUsage.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();

  const totalTokens = records.reduce((acc, r) => acc + (r.totalTokens || 0), 0);
  const totalCost = records.reduce((acc, r) => acc + (r.estimatedCostUsd || 0), 0);
  const avgLatency = records.length > 0
    ? Math.round(records.reduce((acc, r) => acc + (r.latencyMs || 0), 0) / records.length)
    : 0;

  return {
    totalRequests: records.length,
    totalTokens,
    totalEstimatedCostUsd: parseFloat(totalCost.toFixed(4)),
    averageLatencyMs: avgLatency,
    recentRequests: records.slice(0, 10).map((r) => ({
      id: r._id.toString(),
      requestType: r.requestType,
      model: r.model,
      tokens: r.totalTokens,
      latencyMs: r.latencyMs,
      status: r.status,
      createdAt: r.createdAt,
    })),
  };
}

module.exports = {
  trackUsage,
  getUserUsageStats,
};
