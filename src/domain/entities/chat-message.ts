import { z } from 'zod';

export const chatMessageSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
  conversationId: z.string().uuid().nullable(),
  createdAt: z.date(),
});

export type ChatMessageEntity = z.infer<typeof chatMessageSchema>;

export const createChatMessageSchema = chatMessageSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateChatMessage = z.infer<typeof createChatMessageSchema>;

export interface ChatHistoryFilters {
  userId: string;
  conversationId?: string;
  limit?: number;
  offset?: number;
}
