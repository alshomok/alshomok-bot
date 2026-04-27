import { ChatMessageEntity, CreateChatMessage, ChatHistoryFilters } from '../entities/chat-message';

export interface ChatMessageRepository {
  findById(id: string): Promise<ChatMessageEntity | null>;
  findByUserId(filters: ChatHistoryFilters): Promise<ChatMessageEntity[]>;
  create(data: CreateChatMessage): Promise<ChatMessageEntity>;
  deleteByUserId(userId: string): Promise<void>;
}
