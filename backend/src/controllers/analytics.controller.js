const analyticsService = require('../services/analytics.service');
const { sendSuccess } = require('../utils/response');

async function getOverview(req, res, next) {
  try {
    const timeRange = req.query.range || req.query.timeRange || '30d';
    const analytics = await analyticsService.getAnalyticsOverview(req.user._id, timeRange);
    return sendSuccess(res, analytics, 'Analytics overview retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getCompletionTrend(req, res, next) {
  try {
    const timeRange = req.query.range || '30d';
    const analytics = await analyticsService.getAnalyticsOverview(req.user._id, timeRange);
    return sendSuccess(res, { dailyTrends: analytics.dailyTrends }, 'Completion trends retrieved');
  } catch (error) {
    next(error);
  }
}

async function getCategoryPerformance(req, res, next) {
  try {
    const timeRange = req.query.range || '30d';
    const analytics = await analyticsService.getAnalyticsOverview(req.user._id, timeRange);
    return sendSuccess(res, { categoryBreakdown: analytics.categoryBreakdown }, 'Category performance retrieved');
  } catch (error) {
    next(error);
  }
}

async function getConsistency(req, res, next) {
  try {
    const analytics = await analyticsService.getAnalyticsOverview(req.user._id, '30d');
    return sendSuccess(
      res,
      {
        score: analytics.consistencyScore,
        label: analytics.consistencyScore >= 80 ? 'Excellent' : analytics.consistencyScore >= 60 ? 'Good' : 'Needs Focus',
        trend: 'up',
      },
      'Consistency score retrieved'
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  getCompletionTrend,
  getCategoryPerformance,
  getConsistency,
};
