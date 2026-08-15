const analyticsService = require('../services/analytics.service');
const behaviorAnalyticsService = require('../services/behaviorAnalytics.service');
const EnergyLog = require('../models/EnergyLog');
const HabitMiss = require('../models/HabitMiss');
const Experiment = require('../models/Experiment');
const { formatDate } = require('../utils/dates');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ConflictError } = require('../utils/errors');

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

// Behavioral Intelligence Core Metrics
async function getBehaviorOverview(req, res, next) {
  try {
    const range = req.query.range || '30d';
    const behaviorData = await behaviorAnalyticsService.getBehaviorAnalytics(req.user._id, range);
    return sendSuccess(res, behaviorData, 'Behavior intelligence metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
}

// Log energy check-in
async function createEnergyLog(req, res, next) {
  try {
    const { energy, focus, mood } = req.body;
    const dateStr = req.body.date || formatDate(new Date());

    const log = await EnergyLog.findOneAndUpdate(
      { userId: req.user._id, date: dateStr },
      { energy, focus, mood },
      { new: true, upsert: true }
    );

    return sendSuccess(res, log, 'Daily energy log registered successfully');
  } catch (error) {
    next(error);
  }
}

// Log habit miss skip reason
async function createHabitMiss(req, res, next) {
  try {
    const { habitId, reason, notes } = req.body;
    const dateStr = req.body.date || formatDate(new Date());

    const miss = await HabitMiss.findOneAndUpdate(
      { habitId, date: dateStr },
      { userId: req.user._id, reason, notes },
      { new: true, upsert: true }
    );

    return sendSuccess(res, miss, 'Habit miss reason registered successfully');
  } catch (error) {
    next(error);
  }
}

// Experiment Framework CRUD
async function getExperiments(req, res, next) {
  try {
    const list = await Experiment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, list, 'Experiments retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function createExperiment(req, res, next) {
  try {
    const { name, hypothesis, durationDays, baselineMetric, targetValue } = req.body;
    const startDate = formatDate(new Date());
    
    const end = new Date();
    end.setDate(end.getDate() + (durationDays || 14));
    const endDate = formatDate(end);

    const exp = await Experiment.create({
      userId: req.user._id,
      name,
      hypothesis,
      durationDays: durationDays || 14,
      startDate,
      endDate,
      baselineMetric,
      targetValue,
    });

    return sendSuccess(res, exp, 'Experiment started successfully');
  } catch (error) {
    next(error);
  }
}

async function updateExperiment(req, res, next) {
  try {
    const { status, result, currentValue } = req.body;
    const exp = await Experiment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status, result, currentValue },
      { new: true }
    );
    if (!exp) {
      throw new NotFoundError('Experiment not found');
    }
    return sendSuccess(res, exp, 'Experiment updated successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  getCompletionTrend,
  getCategoryPerformance,
  getConsistency,
  getBehaviorOverview,
  createEnergyLog,
  createHabitMiss,
  getExperiments,
  createExperiment,
  updateExperiment,
};
