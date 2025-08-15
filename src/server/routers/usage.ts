import { router, publicProcedure } from '../../server/trpc';

export const usageRouter = router({
  // Get session statistics
  getSessionStats: publicProcedure.query(async ({ ctx }) => {
    // Get today's messages with costs
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messages = await ctx.db.message.findMany({
      where: {
        createdAt: { gte: today },
        role: 'assistant', // Only count assistant messages for cost
        tokens: { not: null },
      },
      select: {
        tokens: true,
        conversation: {
          select: { model: true },
        },
      },
    });

    // Calculate cost
    const totalCost = messages.reduce((sum, msg) => {
      if (!msg.tokens) return sum;

      const costPerToken: Record<string, number> = {
        'deepseek-chat': 0.0000001,
        'anthropic/claude-3-haiku': 0.00000025,
        'anthropic/claude-3-sonnet': 0.000003,
        'anthropic/claude-3-opus': 0.000015,
      };

      const cost = msg.tokens * (costPerToken[msg.conversation.model] || 0.000001);
      return sum + cost;
    }, 0);

    // Get conversation count
    const conversationCount = await ctx.db.conversation.count({
      where: {
        createdAt: { gte: today },
      },
    });

    return {
      totalCost,
      conversationCount,
      messageCount: messages.length,
    };
  }),

  // Get usage by model
  getModelUsage: publicProcedure.query(async ({ ctx }) => {
    const messages = await ctx.db.message.groupBy({
      by: ['conversationId'],
      _count: {
        conversationId: true,
      },
      where: {
        role: 'assistant',
      },
    });

    // This is a simplified version - you might want to aggregate by model
    // For now, just return basic stats
    return {
      totalMessages: messages.length,
      // Add more detailed model usage stats as needed
    };
  }),
});
