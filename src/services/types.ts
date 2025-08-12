export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string; // Optional: track which model generated the response
  cost?: number; // Optional: track cost of the response
}

export interface AssistantService {
  getResponse(userMessage: string, conversationHistory?: Message[]): Promise<any>;
}
