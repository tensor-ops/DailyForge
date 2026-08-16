const AIProvider = require('./AIProvider');

class GeminiProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'gemini';
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
  }

  async generate(messages, options = {}) {
    const model = options.model || this.config.models?.fast || 'gemini-1.5-flash';
    if (!this.apiKey) {
      throw new Error('Gemini API key missing. Configure GEMINI_API_KEY or use local provider.');
    }

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Gemini request failed (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usage = {
      inputTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
    };

    return { content, usage, model };
  }

  async generateStructured(messages, jsonSchema, options = {}) {
    const model = options.model || this.config.models?.fast || 'gemini-1.5-flash';
    if (!this.apiKey) {
      throw new Error('Gemini API key missing.');
    }

    const promptMessages = [
      ...messages,
      {
        role: 'user',
        content: `IMPORTANT: Respond ONLY with a valid JSON object matching this schema:\n${JSON.stringify(
          jsonSchema,
          null,
          2
        )}`,
      },
    ];

    const contents = promptMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Gemini structured generation failed (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { raw };
    }

    const usage = {
      inputTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
    };

    return { data: parsed, raw, usage, model };
  }

  async embed(text) {
    if (!this.apiKey) return new Array(768).fill(0);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] },
      }),
    });

    if (!res.ok) return new Array(768).fill(0);
    const data = await res.json();
    return data.embedding?.values || new Array(768).fill(0);
  }
}

module.exports = GeminiProvider;
