const Recommendation = require('../models/Recommendation');
const ActivityEvent = require('../models/ActivityEvent');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

async function getRecommendations(req, res, next) {
  try {
    const list = await Recommendation.find({ userId: req.user._id, status: 'pending' }).sort({ createdAt: -1 });
    
    // If no recommendations exist in database, return mock seed recommendations
    if (list.length === 0) {
      const mockRec = {
        id: 'mock-rec-1',
        type: 'scheduling',
        title: 'Move Reading → 8:30 PM',
        description: 'Postpone reading block to optimize success likelihood.',
        reason: 'Higher historical completion in late evening.',
        confidence: 0.88,
        status: 'pending',
      };
      return sendSuccess(res, [mockRec], 'Mock recommendations retrieved successfully');
    }

    return sendSuccess(res, list, 'Recommendations retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function acceptRecommendation(req, res, next) {
  try {
    const recId = req.params.id;
    let rec = null;

    if (recId.startsWith('mock-rec')) {
      // Mock acceptance
      rec = { id: recId, status: 'accepted', respondedAt: new Date() };
    } else {
      rec = await Recommendation.findOneAndUpdate(
        { _id: recId, userId: req.user._id },
        { status: 'accepted', respondedAt: new Date() },
        { new: true }
      );
      if (!rec) throw new NotFoundError('Recommendation not found');
    }

    // Log acceptance event
    await ActivityEvent.create({
      userId: req.user._id,
      eventType: 'recommendation_accepted',
      entityType: 'Recommendation',
      entityId: recId.startsWith('mock-rec') ? null : recId,
      metadata: { recommendationId: recId },
    });

    return sendSuccess(res, rec, 'Recommendation accepted successfully');
  } catch (error) {
    next(error);
  }
}

async function rejectRecommendation(req, res, next) {
  try {
    const recId = req.params.id;
    let rec = null;

    if (recId.startsWith('mock-rec')) {
      rec = { id: recId, status: 'rejected', respondedAt: new Date() };
    } else {
      rec = await Recommendation.findOneAndUpdate(
        { _id: recId, userId: req.user._id },
        { status: 'rejected', respondedAt: new Date() },
        { new: true }
      );
      if (!rec) throw new NotFoundError('Recommendation not found');
    }

    // Log rejection event
    await ActivityEvent.create({
      userId: req.user._id,
      eventType: 'recommendation_rejected',
      entityType: 'Recommendation',
      entityId: recId.startsWith('mock-rec') ? null : recId,
      metadata: { recommendationId: recId },
    });

    return sendSuccess(res, rec, 'Recommendation rejected successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecommendations,
  acceptRecommendation,
  rejectRecommendation,
};
