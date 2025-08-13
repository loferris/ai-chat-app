import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const conversationsRouter = createTRPCRouter({
    // Get all conversations with message preview
    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.conversation.findMany({
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 1, // Just first message for preview
                },
                _count: {
                    select: { messages: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }),

    // Get single conversation with all messages
    getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
        const conversation = await ctx.db.conversation.findUnique({
            where: { id: input.id },
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

        return conversation;
    }),

    // Create new conversation
    create: publicProcedure
    .input(z.object({
        title: z.string().optional(),
                    model: z.string(),
                    systemPrompt: z.string().optional(),
                    temperature: z.number().optional(),
                    maxTokens: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.conversation.create({
            data: {
                title: input.title || 'New Conversation',
                model: input.model,
                systemPrompt: input.systemPrompt,
                temperature: input.temperature,
                maxTokens: input.maxTokens,
            },
            include: {
                messages: true,
            },
        });
    }),

    // Update conversation
    update: publicProcedure
    .input(z.object({
        id: z.string(),
                    title: z.string().optional(),
                    model: z.string().optional(),
                    systemPrompt: z.string().optional(),
                    temperature: z.number().optional(),
                    maxTokens: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;

        return ctx.db.conversation.update({
            where: { id },
            data: {
                ...updateData,
                updatedAt: new Date(),
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }),

    // Delete conversation
    delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
        // Messages will be cascade deleted due to onDelete: Cascade in schema
        return ctx.db.conversation.delete({
            where: { id: input.id },
        });
    }),
});
