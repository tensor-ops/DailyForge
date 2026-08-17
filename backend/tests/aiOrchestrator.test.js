const ForgeAIOrchestrator = require('../src/ai/orchestrator/ForgeAIOrchestrator');
const IntentRouter = require('../src/ai/agents/IntentRouter');
const mongoose = require('mongoose');

const ContextBuilder = require('../src/ai/context/ContextBuilder');
const aiMemoryService = require('../src/ai/memory/aiMemory.service');
const aiUsageService = require('../src/ai/observability/aiUsage.service');
const HabitCoach = require('../src/ai/agents/HabitCoach');

describe('AI Multi-Agent Fleet & Intent Router Tests', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    jest.spyOn(ContextBuilder, 'buildFullPersonalContext').mockResolvedValue({
      user: { name: 'AI Tester' },
      habits: [],
      goals: [],
    });
    jest.spyOn(aiMemoryService, 'getUserMemories').mockResolvedValue([]);
    jest.spyOn(aiUsageService, 'trackUsage').mockResolvedValue({});
    jest.spyOn(HabitCoach, 'handle').mockResolvedValue({
      agentName: 'HabitCoach',
      content: 'Focus on small atomic daily consistency.',
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('ROUTER: IntentRouter correctly routes habit recovery prompts', () => {
    const route = IntentRouter.route('I missed my workout three days in a row, help me reset.');
    expect(route.agentType).toBe('RECOVERY_COACH');
  });

  test('ROUTER: IntentRouter routes schedule optimization prompts', () => {
    const route = IntentRouter.route('Please optimize my morning study schedule.');
    expect(route.agentType).toBe('PLANNER_OPTIMIZER');
  });

  test('ROUTER: IntentRouter routes roadmap strategy prompts', () => {
    const route = IntentRouter.route('How can I break down my goal into milestones?');
    expect(route.agentType).toBe('GOAL_STRATEGIST');
  });

  test('ORCHESTRATOR: ForgeAIOrchestrator runs workflow safely with timeout protection', async () => {
    const result = await ForgeAIOrchestrator.runWorkflow(userId, 'Give me habit advice');
    expect(result.success).toBe(true);
    expect(result.response).toBeDefined();
    expect(result.workflowSteps.length).toBeGreaterThan(0);
  });
});
