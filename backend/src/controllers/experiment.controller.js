const experimentService = require('../services/experiment.service');
const { sendSuccess, sendError } = require('../utils/response');

async function getOverview(req, res, next) {
  try {
    const data = await experimentService.getLabOverview(req.user._id);
    return sendSuccess(res, data, 'Forge Lab overview retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getExperimentById(req, res, next) {
  try {
    const data = await experimentService.getExperimentDetail(req.user._id, req.params.id);
    if (!data) return sendError(res, 'Experiment not found', 404);
    return sendSuccess(res, data, 'Experiment detail retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const exp = await experimentService.createExperiment(req.user._id, req.body);
    return sendSuccess(res, exp, 'Experiment started successfully');
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const exp = await experimentService.updateStatus(
      req.user._id,
      req.params.id,
      req.body.status
    );
    if (!exp) return sendError(res, 'Experiment not found', 404);
    return sendSuccess(res, exp, 'Experiment status updated');
  } catch (error) {
    next(error);
  }
}

async function applyResult(req, res, next) {
  try {
    const exp = await experimentService.applyResult(req.user._id, req.params.id);
    if (!exp) return sendError(res, 'Experiment not found', 404);
    return sendSuccess(res, exp, 'Experiment result applied to habit and planner');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  getExperimentById,
  create,
  updateStatus,
  applyResult,
};
