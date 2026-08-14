const aiService = require('../services/ai.service');
const { sendSuccess } = require('../utils/response');

async function getInsights(req, res, next) {
  try {
    const insights = await aiService.getInsights(req.user._id);
    return sendSuccess(res, insights, 'AI insights retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function generateInsights(req, res, next) {
  try {
    const insights = await aiService.generateInsights(req.user._id);
    return sendSuccess(res, insights, 'Fresh AI insights generated successfully');
  } catch (error) {
    next(error);
  }
}

async function getRecommendations(req, res, next) {
  try {
    const recommendations = await aiService.getRecommendations(req.user._id);
    return sendSuccess(res, recommendations, 'AI recommendations retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function chat(req, res, next) {
  try {
    const { message } = req.body;
    const result = await aiService.chatWithAI(req.user._id, message);
    return sendSuccess(res, result, 'AI message processed successfully');
  } catch (error) {
    next(error);
  }
}

async function getConversations(req, res, next) {
  try {
    const history = await aiService.getConversations(req.user._id);
    return sendSuccess(res, history, 'AI conversation history retrieved successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInsights,
  generateInsights,
  getRecommendations,
  chat,
  getConversations,
};
