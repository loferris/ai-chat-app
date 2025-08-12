export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AssistantService {
  getResponse(userMessage: string, conversationHistory?: Message[]): Promise<string>;
}
