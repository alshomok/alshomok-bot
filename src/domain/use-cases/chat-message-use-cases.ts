import { ChatMessageRepository } from '../repositories/chat-message-repository';
import { ChatMessageEntity, ChatHistoryFilters } from '../entities/chat-message';

export class ChatMessageUseCases {
  constructor(private readonly chatMessageRepository: ChatMessageRepository) {}

  async getChatHistory(filters: ChatHistoryFilters): Promise<ChatMessageEntity[]> {
    return this.chatMessageRepository.findByUserId(filters);
  }

  async saveUserMessage(userId: string, content: string, conversationId?: string): Promise<ChatMessageEntity> {
    return this.chatMessageRepository.create({
      userId,
      role: 'user',
      content,
      conversationId: conversationId || null,
    });
  }

  async saveAssistantMessage(userId: string, content: string, conversationId?: string): Promise<ChatMessageEntity> {
    return this.chatMessageRepository.create({
      userId,
      role: 'assistant',
      content,
      conversationId: conversationId || null,
    });
  }

  async saveConversation(
    userId: string,
    userMessage: string,
    assistantResponse: string,
    conversationId?: string
  ): Promise<{ userMessage: ChatMessageEntity; assistantMessage: ChatMessageEntity }> {
    const userMsg = await this.saveUserMessage(userId, userMessage, conversationId);
    const assistantMsg = await this.saveAssistantMessage(userId, assistantResponse, conversationId);

    return {
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    };
  }

  async clearChatHistory(userId: string): Promise<void> {
    return this.chatMessageRepository.deleteByUserId(userId);
  }
}
