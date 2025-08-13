import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

// OpenRouter API integration (server-side)
class OpenRouterService {
    private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
        private apiKey: string;
        private siteName: string;

        constructor() {
            this.apiKey = process.env.OPENROUTER_API_KEY!;
            this.siteName = process.env.VITE_SITE_NAME || 'TeddyBox Chat';

            if (!this.apiKey) {
                throw new Error('OPENROUTER_API_KEY environment variable is required');
            }
        }

        async getResponse(messages: any[], model: string): Promise<{
            response: string;
            model: string;
            cost: number;
        }> {
            try {
                const response = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'X-Title': this.siteName,
                    },
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
                const content = data.choices[0].message.content;
                const cost = this.estimateCost(content, model);

                return {
                    response: content,
                    model,
                    cost,
                };
            } catch (error) {
                console.error('OpenRouter API error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to get response from AI service',
                    cause: error,
                });
            }
        }

        private estimateCost(response: string, modelUsed: string): number {
            const tokens = Math.ceil(response.length / 4); // ~4 chars/token

            const costPerToken: Record<string, number> = {
                'deepseek-chat': 0.0000001, // $0.10 per 1M tokens
                'anthropic/claude-3-haiku': 0.00000025, // $0.25 per 1M tokens
                'anthropic/claude-3-sonnet': 0.000003,
                'anthropic/claude-3-opus': 0.000015,
            };

            return tokens * (costPerToken[modelUsed] || 0.000001);
        }

        selectModel(): string {
            // Weighted model selection (60% DeepSeek, 40% Claude)
            const random = Math.random();
            return random < 0.6 ? 'deepseek-chat' : 'anthropic/claude-3-haiku';
        }
}

// Initialize service
const openRouterService = new OpenRouterService();

export const chatRouter = createTRPCRouter({
    // Send message and get AI response
    sendMessage: publicProcedure
    .input(z.object({
        conversationId: z.string(),
                    message: z.string(),
                    model: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        try {
            // 1. Verify conversation exists
            const conversation = await ctx.db.conversation.findUnique({
                where: { id: input.conversationId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                    },
                },
            });

            if (!conversation) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Conversation not found',
                });
            }

            // 2. Save user message
            const userMessage = await ctx.db.message.create({
                data: {
                    conversationId: input.conversationId,
                    role: 'user',
                    content: input.message,
                },
            });

            // 3. Build messages array for API
            const messages = [
                ...conversation.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                {
                    role: 'user',
              content: input.message,
                },
            ];

            // 4. Get AI response
            const selectedModel = input.model || openRouterService.selectModel();
            const aiResponse = await openRouterService.getResponse(messages, selectedModel);

            // 5. Save assistant message
            const assistantMessage = await ctx.db.message.create({
                data: {
                    conversationId: input.conversationId,
                    role: 'assistant',
                    content: aiResponse.response,
                    tokens: Math.ceil(aiResponse.response.length / 4),
                },
            });

            // 6. Update conversation title if it's the first exchange
            if (conversation.messages.length === 0) {
                const title = input.message.substring(0, 50) + (input.message.length > 50 ? '...' : '');
                await ctx.db.conversation.update({
                    where: { id: input.conversationId },
                    data: {
                        title,
                        model: selectedModel,
                        updatedAt: new Date(),
                    },
                });
            } else {
                // Just update timestamp
                await ctx.db.conversation.update({
                    where: { id: input.conversationId },
                    data: { updatedAt: new Date() },
                });
            }

            return {
                userMessage,
              assistantMessage,
              cost: aiResponse.cost,
              model: selectedModel,
            };

        } catch (error) {
            console.error('Chat error:', error);

            // Save error message if we can
            try {
                await ctx.db.message.create({
                    data: {
                        conversationId: input.conversationId,
                        role: 'assistant',
                        content: 'Sorry, I encountered an error. Please try again.',
                    },
                });
            } catch (dbError) {
                console.error('Failed to save error message:', dbError);
            }

            if (error instanceof TRPCError) {
                throw error;
            }

            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to process chat message',
            });
        }
    }),

    // Get available models
    getModels: publicProcedure.query(() => {
        return [
            { id: 'deepseek-chat', name: 'DeepSeek Chat', costPer1M: 0.10 },
            { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', costPer1M: 0.25 },
            { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', costPer1M: 3.00 },
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', costPer1M: 15.00 },
        ];
    }),
});
