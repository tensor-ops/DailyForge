/**
 * Abstract Base Class for AI Providers in DailyForge
 */

class AIProvider {
  constructor(config = {}) {
    this.name = 'base';
    this.config = config;
  }

  /**
   * Generates free-form textual response.
   * @param {Array<{role: string, content: string}>} messages
   * @param {Object} options
   * @returns {Promise<{content: string, usage: {inputTokens: number, outputTokens: number}}>}
   */
  async generate(messages, options = {}) {
    throw new Error('Method generate() must be implemented by concrete AI provider.');
  }

  /**
   * Generates structured JSON matching a predefined schema.
   * @param {Array<{role: string, content: string}>} messages
   * @param {Object} jsonSchema
   * @param {Object} options
   * @returns {Promise<{data: Object, raw: string, usage: {inputTokens: number, outputTokens: number}}>}
   */
  async generateStructured(messages, jsonSchema, options = {}) {
    throw new Error('Method generateStructured() must be implemented by concrete AI provider.');
  }

  /**
   * Streams response chunk by chunk.
   * @param {Array<{role: string, content: string}>} messages
   * @param {Function} onChunk (chunk: string) => void
   * @param {Object} options
   */
  async stream(messages, onChunk, options = {}) {
    throw new Error('Method stream() must be implemented by concrete AI provider.');
  }

  /**
   * Generates vector embedding for input text.
   * @param {string} text
   * @returns {Promise<Array<number>>}
   */
  async embed(text) {
    throw new Error('Method embed() must be implemented by concrete AI provider.');
  }

  /**
   * Checks content safety / moderation.
   * @param {string} text
   * @returns {Promise<{safe: boolean, flaggedCategories: string[]}>}
   */
  async moderate(text) {
    return { safe: true, flaggedCategories: [] };
  }

  /**
   * Invokes LLM with authorized tool calling.
   * @param {Array<{role: string, content: string}>} messages
   * @param {Array<Object>} tools
   * @param {Function} toolExecutor
   */
  async callTools(messages, tools, toolExecutor) {
    throw new Error('Method callTools() must be implemented by concrete AI provider.');
  }
}

module.exports = AIProvider;
