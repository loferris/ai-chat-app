export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  cost?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  model?: string;
}

export interface AssistantResponse {
  response: string;
  model: string;
  cost: number;
}

export interface AssistantService {
  getResponse(
    userMessage: string,
    conversationHistory?: Message[],
  ): Promise<string | AssistantResponse>;
  getModelUsageStats?: () => Array<{ model: string; count: number; percentage: number }>;
}

export type ModelType = 'claude' | 'deepseek' | 'qwen' | 'mock';
