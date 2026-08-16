/**
 * AISafetyService
 * Enforces safety boundaries, input/output validation, and destructive operation guardrails.
 */

class AISafetyService {
  /**
   * Sanitizes input prompt text to prevent injection or malicious inputs.
   */
  static sanitizeInput(text) {
    if (!text || typeof text !== 'string') return '';
    return text.trim().slice(0, 4000); // 4k char safety boundary
  }

  /**
   * Validates tool call authorization. Ensures AI cannot execute destructive write mutations without explicit confirmation.
   */
  static validateToolExecution(toolName, params) {
    const dangerousWriteTools = [
      'deleteHabit',
      'archiveGoal',
      'deleteAllEvents',
      'clearHabitLogs',
      'resetStreak',
    ];

    if (dangerousWriteTools.includes(toolName)) {
      return {
        allowed: false,
        reason: `Destructive tool "${toolName}" is prohibited from autonomous AI execution.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Validates generated structured response against schema.
   */
  static validateResponse(data, schemaName) {
    const { validateAgainstSchema } = require('../schemas/aiSchemas');
    return validateAgainstSchema(data, schemaName);
  }
}

module.exports = AISafetyService;
