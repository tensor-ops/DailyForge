const AIProvider = require('./AIProvider');

class OpenAIProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'openai';
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
  }

  async generate(messages, options = {}) {
    const model = options.model || this.config.models?.fast || 'gpt-4o-mini';
    const temperature = options.temperature ?? this.config.temperature ?? 0.3;

    if (!this.apiKey) {
      throw new Error('OpenAI API key missing. Configure OPENAI_API_KEY or use local provider.');
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: options.maxTokens || this.config.maxTokens || 2048,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenAI request failed (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const usage = {
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
    };

    return { content, usage, model };
  }

  async generateStructured(messages, jsonSchema, options = {}) {
    const model = options.model || this.config.models?.fast || 'gpt-4o-mini';
    const temperature = options.temperature ?? 0.2;

    if (!this.apiKey) {
      throw new Error('OpenAI API key missing.');
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenAI structured generation failed (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { raw };
    }

    const usage = {
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
    };

    return { data: parsed, raw, usage, model };
  }

  async embed(text) {
    if (!this.apiKey) return new Array(1536).fill(0);

    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.models?.embedding || 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!res.ok) {
      return new Array(1536).fill(0);
    }

    const data = await res.json();
    return data.data?.[0]?.embedding || new Array(1536).fill(0);
  }
}

module.exports = OpenAIProvider;
