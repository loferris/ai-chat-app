import { AssistantService, Message } from './types';
import { MockAssistant } from './mockAssistant';

export class OpenRouterAssistant implements AssistantService {
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private apiKey: string;
  private siteName: string;
  private modelUsage: Record<string, number> = {};

  constructor(config: { apiKey: string; siteName?: string }) {
    this.apiKey = config.apiKey;
    this.siteName = config.siteName || this.getDefaultSiteName();
  }

  async getResponse(
    userMessage: string,
    conversationHistory: Message[] = [],
  ): Promise<{ response: string; model: string; cost: number }> {
    try {
      // Model selection with weighted distribution
      const model = this.selectModel();

      const messages = this.buildMessagesArray(userMessage, conversationHistory);
      const response = await this.fetchResponse(messages, model);
      const cost = this.estimateCost(response, model);

      // Track model usage
      this.modelUsage[model] = (this.modelUsage[model] || 0) + 1;

      return {
        response,
        model,
        cost,
      };
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return {
        response: 'Sorry, I encountered an error. Please try again.',
        model: 'error',
        cost: 0,
      };
    }
  }

  getModelUsageStats() {
    const total = Object.values(this.modelUsage).reduce((sum, count) => sum + count, 0);
    return Object.entries(this.modelUsage).map(([model, count]) => ({
      model,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }

  private selectModel(): string {
    // Weighted model selection (60% DeepSeek, 40% Claude)
    const random = Math.random();
    return random < 0.6 ? 'deepseek-chat' : 'anthropic/claude-3-haiku';
  }

  private async fetchResponse(messages: Message[], model: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getRequestHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private estimateCost(response: string, modelUsed: string): number {
    const tokens = Math.ceil(response.length / 4); // ~4 chars/token

    const costPerToken =
      {
        'deepseek-chat': 0.0000001, // $0.10 per 1M tokens
        'anthropic/claude-3-haiku': 0.00000025, // $0.25 per 1M tokens
        'anthropic/claude-3-sonnet': 0.000003,
        'anthropic/claude-3-opus': 0.000015,
      }[modelUsed] || 0.000001;

    return tokens * costPerToken;
  }

  private getRequestHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': this.getRefererUrl(),
      'X-Title': this.siteName,
    };
  }

  private getRefererUrl() {
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  }

  private getDefaultSiteName(): string {
    if (typeof import.meta !== 'undefined' && import.meta.env.SITE_NAME) {
      return import.meta.env.SITE_NAME;
    }
    if (typeof window !== 'undefined' && window.location.hostname) {
      return window.location.hostname;
    }
    return 'My Chat App';
  }

  private buildMessagesArray(userMessage: string, conversationHistory: Message[]) {
    return [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];
  }
}

export function createAssistant(config: {
  type: 'mock' | 'openrouter';
  apiKey?: string;
  siteName?: string;
}): AssistantService {
  switch (config.type) {
    case 'openrouter':
      if (!config.apiKey) {
        // Try to get from environment
        const envKey =
          typeof import.meta !== 'undefined'
            ? import.meta.env.OPENROUTER_API_KEY
            : process.env.OPENROUTER_API_KEY;

        if (!envKey) throw new Error('OpenRouter API key is required');
        return new OpenRouterAssistant({ apiKey: envKey, siteName: config.siteName });
      }
      return new OpenRouterAssistant(config);

    case 'mock':
    default:
      return new MockAssistant();
  }
}
