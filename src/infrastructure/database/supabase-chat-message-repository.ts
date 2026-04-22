import { ChatMessageRepository } from '@/domain/repositories/chat-message-repository';
import { ChatMessageEntity, CreateChatMessage, ChatHistoryFilters } from '@/domain/entities/chat-message';
import { createServerClient } from '@/infrastructure/supabase';

export class SupabaseChatMessageRepository implements ChatMessageRepository {
  async findById(id: string): Promise<ChatMessageEntity | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByUserId(filters: ChatHistoryFilters): Promise<ChatMessageEntity[]> {
    const supabase = await createServerClient();
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', filters.userId)
      .order('created_at', { ascending: true });

    if (filters.conversationId) {
      query = query.eq('conversation_id', filters.conversationId);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async create(data: CreateChatMessage): Promise<ChatMessageEntity> {
    const supabase = await createServerClient();
    const { data: result, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: data.userId,
        role: data.role,
        content: data.content,
        conversation_id: data.conversationId,
      })
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Failed to create chat message: ${error?.message}`);
    }

    return this.mapToEntity(result);
  }

  async deleteByUserId(userId: string): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete chat messages: ${error.message}`);
    }
  }

  private mapToEntity(data: Record<string, unknown>): ChatMessageEntity {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      role: data.role as 'user' | 'assistant',
      content: data.content as string,
      conversationId: data.conversation_id as string | null,
      createdAt: new Date(data.created_at as string),
    };
  }
}
