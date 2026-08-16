const PersonalContextEngine = require('../context/PersonalContextEngine');
const ContextBuilder = require('../context/ContextBuilder');
const IntentRouter = require('../agents/IntentRouter');
const aiToolsService = require('../tools/aiTools.service');
const aiMemoryService = require('../memory/aiMemory.service');
const AISafetyService = require('../safety/aiSafety.service');
const aiUsageService = require('../observability/aiUsage.service');

// Shared Agent Fleet
const HabitCoach = require('../agents/HabitCoach');
const PlannerOptimizer = require('../agents/PlannerOptimizer');
const GoalStrategist = require('../agents/GoalStrategist');
const MomentumAnalyst = require('../agents/MomentumAnalyst');
const RecoveryCoach = require('../agents/RecoveryCoach');
const ProgressNarrator = require('../agents/ProgressNarrator');
const ExperimentScientist = require('../agents/ExperimentScientist');

class ForgeAIOrchestrator {
  /**
   * Executes a multi-step agent workflow with loop protection and step-by-step progress logging.
   */
  static async runWorkflow(userId, userPrompt) {
    const startTime = Date.now();
    const maxExecutionTimeMs = 10000;
    const workflowSteps = [];

    // Loop & Timeout Guard
    const checkTimeout = () => {
      if (Date.now() - startTime > maxExecutionTimeMs) {
        throw new Error('Agent workflow execution exceeded safety timeout (10s).');
      }
    };

    // Step 1: Detect Intent & Route Agent
    workflowSteps.push({ step: 'INTENT_DETECTION', status: 'Detecting execution intent...' });
    const route = IntentRouter.route(userPrompt);
    checkTimeout();

    // Step 2: Retrieve Grounded Domain Context
    workflowSteps.push({ step: 'CONTEXT_RETRIEVAL', status: 'Retrieving personal context and habit history...' });
    let targetedContext;
    if (route.primaryEntity) {
      targetedContext = await ContextBuilder.buildHabitContext(userId, route.primaryEntity);
    } else {
      targetedContext = await ContextBuilder.buildFullPersonalContext(userId);
    }
    checkTimeout();

    // Step 3: Check Active AI Memories
    workflowSteps.push({ step: 'MEMORY_LOOKUP', status: 'Checking user preferences and analytical memories...' });
    const memories = await aiMemoryService.getUserMemories(userId);
    checkTimeout();

    // Step 4: Execute Agent Reasoning
    workflowSteps.push({ step: 'AGENT_REASONING', status: `Consulting ${route.agentType} engine...` });
    let agentResult;
    switch (route.agentType) {
      case 'RECOVERY_COACH':
        agentResult = await RecoveryCoach.handle(userId, userPrompt, route.primaryEntity);
        break;
      case 'PLANNER_OPTIMIZER':
        agentResult = await PlannerOptimizer.handle(userId, userPrompt);
        break;
      case 'GOAL_STRATEGIST':
        agentResult = await GoalStrategist.handle(userId, userPrompt, route.primaryEntity);
        break;
      case 'MOMENTUM_ANALYST':
        agentResult = await MomentumAnalyst.handle(userId, userPrompt);
        break;
      case 'PROGRESS_NARRATOR':
        agentResult = await ProgressNarrator.handle(userId, userPrompt);
        break;
      case 'EXPERIMENT_SCIENTIST':
        agentResult = await ExperimentScientist.handle(userId, userPrompt, route.primaryEntity);
        break;
      case 'HABIT_COACH':
      default:
        agentResult = await HabitCoach.handle(userId, userPrompt, route.primaryEntity);
        break;
    }
    checkTimeout();

    // Step 5: Validate Output Safety
    workflowSteps.push({ step: 'SAFETY_VALIDATION', status: 'Verifying action proposal guardrails...' });
    if (agentResult.proposedAction) {
      const safetyCheck = AISafetyService.validateToolExecution(
        agentResult.proposedAction.actionType,
        agentResult.proposedAction.payload
      );
      if (!safetyCheck.allowed) {
        agentResult.proposedAction = null;
      }
    }

    // Step 6: Log Telemetry
    await aiUsageService.trackUsage(userId, {
      provider: 'local',
      model: 'forge-orchestrator-v2',
      requestType: 'COACH_CHAT',
      inputTokens: userPrompt.length / 4,
      outputTokens: agentResult.content.length / 4,
      latencyMs: Date.now() - startTime,
      status: 'SUCCESS',
    });

    return {
      success: true,
      agentType: route.agentType,
      workflowSteps,
      response: agentResult,
      latencyMs: Date.now() - startTime,
    };
  }
}

module.exports = ForgeAIOrchestrator;
