import { logger } from '../utils/logger';
import { DEMO_CONFIG } from '../config/demo';

export interface AssistantResponse {
  response: string;
  model: string;
  cost: number;
}

export interface AssistantConfig {
  apiKey?: string;
  siteName?: string;
}

export interface Assistant {
  getResponse(userMessage: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<AssistantResponse>;
  getModelUsageStats(): Array<{ model: string; count: number; percentage: number }>;
}

export class OpenRouterAssistant implements Assistant {
  private apiKey: string;
  private siteName: string;
  private modelUsage: Map<string, number> = new Map();

  constructor(config: { apiKey: string; siteName: string }) {
    this.apiKey = config.apiKey;
    this.siteName = config.siteName;
  }

  async getResponse(
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<AssistantResponse> {
    try {
      if (!userMessage || userMessage.trim() === '') {
        throw new Error('User message cannot be empty');
      }

      const messages = this.buildMessagesArray(userMessage, conversationHistory);
      const model = this.selectModel();
      
      const response = await this.fetchResponse(messages, model);
      
      if (!response || response.trim() === '') {
        throw new Error('Assistant response is empty');
      }

      const cost = this.estimateCost(response, model);
      this.recordModelUsage(model);

      return {
        response,
        model,
        cost,
      };
    } catch (error) {
      console.error('Error in OpenRouterAssistant.getResponse:', error);
      
      // Return a fallback response instead of throwing
      return {
        response: 'Sorry, I encountered an error. Please try again.',
        model: 'error',
        cost: 0,
      };
    }
  }

  getModelUsageStats(): Array<{ model: string; count: number; percentage: number }> {
    try {
      const totalUsage = Array.from(this.modelUsage.values()).reduce((sum, count) => sum + count, 0);
      
      if (totalUsage === 0) {
        return [];
      }

      return Array.from(this.modelUsage.entries()).map(([model, count]) => ({
        model,
        count,
        percentage: (count / totalUsage) * 100,
      }));
    } catch (error) {
      console.error('Error getting model usage stats:', error);
      return [];
    }
  }

  private buildMessagesArray(
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    try {
      return [
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: userMessage },
      ];
    } catch (error) {
      console.error('Error building messages array:', error);
      return [{ role: 'user' as const, content: userMessage }];
    }
  }

  private selectModel(): string {
    try {
      // Simple model selection logic
      const models = ['deepseek-chat', 'anthropic/claude-3-haiku'];
      const randomIndex = Math.floor(Math.random() * models.length);
      return models[randomIndex];
    } catch (error) {
      console.error('Error selecting model:', error);
      return 'deepseek-chat'; // Fallback model
    }
  }

  private async fetchResponse(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    model: string
  ): Promise<string> {
    try {
      if (typeof window !== 'undefined') {
        // Client-side fallback
        return 'This is a client-side fallback response. Please use the server-side API.';
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.getDefaultSiteName(),
            'X-Title': this.siteName,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Don't include potentially sensitive error details in logs
          console.error(`OpenRouter API error: ${response.status}`);
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          throw new Error('Invalid response format from OpenRouter API');
        }

        return data.choices[0].message.content;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout: The AI response took too long. Please try again.');
        }
        
        throw error;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.assistantRequest(model, 0, 0, duration, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private estimateCost(response: string, model: string): number {
    try {
      const tokens = Math.ceil(response.length / 4); // Rough token estimation
      const costPerToken: Record<string, number> = {
        'deepseek-chat': 0.0000001,
        'anthropic/claude-3-haiku': 0.00000025,
        'anthropic/claude-3-sonnet': 0.000003,
        'anthropic/claude-3-opus': 0.000015,
      };

      return tokens * (costPerToken[model] || 0.000001);
    } catch (error) {
      console.error('Error estimating cost:', error);
      return 0;
    }
  }

  private recordModelUsage(model: string): void {
    try {
      const currentCount = this.modelUsage.get(model) || 0;
      this.modelUsage.set(model, currentCount + 1);
    } catch (error) {
      console.error('Error recording model usage:', error);
    }
  }

  private getDefaultSiteName(): string {
    try {
      if (typeof window !== 'undefined' && window.location.hostname) {
        return window.location.hostname;
      }
      return 'localhost';
    } catch (error) {
      console.error('Error getting default site name:', error);
      return 'localhost';
    }
  }
}

export function createAssistant(config: AssistantConfig): Assistant {
  try {
    // Force mock assistant in demo mode
    if (DEMO_CONFIG.FORCE_MOCK_ASSISTANT || DEMO_CONFIG.IS_DEMO) {
      logger.info('Using mock assistant for demo mode');
      return new MockAssistant();
    }

    if (config.apiKey) {
      // Validate API key format (basic check)
      if (!config.apiKey.startsWith('sk-or-v1-')) {
        console.error('Invalid API key format provided');
        return new MockAssistant();
      }
      return new OpenRouterAssistant({ 
        apiKey: config.apiKey, 
        siteName: config.siteName || 'chat-app' 
      });
    }

    // Try to get from environment
    const envKey = process.env.OPENROUTER_API_KEY;

    if (!envKey) {
      // Only log in development to avoid production log spam
      if (process.env.NODE_ENV === 'development') {
        console.warn('No OpenRouter API key provided, using mock assistant');
      }
      return new MockAssistant();
    }

    // Validate environment API key format
    if (!envKey.startsWith('sk-or-v1-')) {
      console.error('Invalid API key format in environment variable');
      return new MockAssistant();
    }

    return new OpenRouterAssistant({ 
      apiKey: envKey, 
      siteName: config.siteName || 'chat-app' 
    });
  } catch (error) {
    // Don't log the full error object which might contain sensitive data
    console.error('Error creating assistant service');
    return new MockAssistant();
  }
}

// Mock assistant for testing and fallback
class MockAssistant implements Assistant {
  private getSmartMockResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Demo-specific responses
    if (message.includes('demo') || message.includes('showcase')) {
      return `🎉 Welcome to the chat app demo! This is a fully functional chat interface with mock AI responses. 

Key features you can try:
• Send messages and get intelligent responses
• Create and manage multiple conversations  
• Export your chats to Markdown or JSON
• Experience the beautiful, responsive UI

This demo uses a smart mock assistant that provides contextual responses. In the full version, you'd connect your OpenRouter API key to chat with real AI models like Claude, GPT-4, and more!`;
    }
    
    if (message.includes('export') || message.includes('download')) {
      return `📄 The export feature lets you download your conversations in multiple formats:

• **Markdown**: Perfect for documentation or sharing
• **JSON**: Great for data analysis or backup
• **Obsidian**: Compatible with Obsidian note-taking

Try clicking the export button to see it in action! Your conversations will be formatted beautifully with timestamps, metadata, and proper structure.`;
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `👋 Hello! I'm the demo assistant for this chat application. I can help you explore the features and capabilities of this platform.

Feel free to ask me about the app's functionality, technical details, or just have a casual conversation! What would you like to know? 😊`;
    }
    
    // Default intelligent response
    const responses = [
      `That's an interesting question! 🤔 In a real deployment, this would be answered by advanced AI models like Claude or GPT-4. This demo shows how seamlessly the chat interface works with any AI backend.`,
      
      `Great point! 💡 This mock assistant demonstrates the responsive chat interface. With a real API key, you'd get sophisticated AI responses from models like Anthropic's Claude, OpenAI's GPT-4, or other providers through OpenRouter.`,
      
      `I appreciate your message! 😊 This demo showcases the chat app's clean interface and smooth user experience. The real version connects to powerful AI models for genuinely helpful conversations.`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async getResponse(userMessage: string): Promise<AssistantResponse> {
    // Simulate realistic response time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    return {
      response: this.getSmartMockResponse(userMessage),
      model: 'demo-assistant-v1',
      cost: 0.001,
    };
  }

  getModelUsageStats(): Array<{ model: string; count: number; percentage: number }> {
    return [
      { model: 'mock', count: 1, percentage: 100 },
    ];
  }
}
