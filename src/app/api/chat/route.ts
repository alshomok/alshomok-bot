import { NextResponse } from 'next/server';
import { generateAIResponse, generateAIResponseWithHistory, type AIResponse } from '@/lib/services';
import { ChatMessageUseCases } from '@/domain/use-cases';
import { SupabaseChatMessageRepository } from '@/infrastructure/database';
import { withAuthAndRateLimit, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ApiResponse } from '@/shared/types';

const chatMessageRepository = new SupabaseChatMessageRepository();
const chatMessageUseCases = new ChatMessageUseCases(chatMessageRepository);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

/**
 * POST /api/chat
 * Handles AI chat requests with authentication and rate limiting
 * Rate limit: 20 requests per minute per user
 */
async function postHandler(req: AuthenticatedRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChatRequest = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    let response: AIResponse;

    // If history exists, use conversation mode
    if (history && history.length > 0) {
      const formattedHistory = history.map((msg) => ({
        role: (msg.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        parts: msg.content,
      }));

      response = await generateAIResponseWithHistory(message, formattedHistory);
    } else {
      // Single message mode
      response = await generateAIResponse(message);
    }

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    // Save conversation to database
    try {
      await chatMessageUseCases.saveConversation(
        userId,
        message,
        response.text
      );
    } catch {
      console.error('Failed to save chat message');
      // Don't fail the request if saving fails
    }

    return NextResponse.json({
      data: {
        response: response.text,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    console.error('Chat API error');
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat
 * Fetch chat history for logged-in user
 * Rate limit: 30 requests per minute per user
 */
async function getHandler(req: AuthenticatedRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const messages = await chatMessageUseCases.getChatHistory({
      userId,
      limit,
      offset,
    });

    return NextResponse.json({
      data: {
        messages,
        count: messages.length,
      },
    });
  } catch {
    console.error('Chat history fetch error');
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

// Export wrapped handlers with auth and rate limiting
export const POST = withAuthAndRateLimit(postHandler, 'chat');
export const GET = withAuthAndRateLimit(getHandler, 'search');

