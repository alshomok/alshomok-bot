import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, generateAIResponseWithHistory, type AIResponse } from '@/lib/services';
import { ChatMessageUseCases } from '@/domain/use-cases';
import { SupabaseChatMessageRepository } from '@/infrastructure/database';
import { createClient as createServerClient } from '@/infrastructure/supabase/server';
import { ApiResponse } from '@/shared/types';

const chatMessageRepository = new SupabaseChatMessageRepository();
const chatMessageUseCases = new ChatMessageUseCases(chatMessageRepository);

interface ChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'model'; parts: string }>;
}

/**
 * POST /api/chat
 * Handles AI chat requests with authentication and rate limiting
 * Rate limit: 20 requests per minute per user
 */
async function postHandler(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Auth check
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;
    const body: ChatRequest = await req.json();

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    let aiResponse: AIResponse;

    // If history exists, use conversation mode
    if (body.history && body.history.length > 0) {
      aiResponse = await generateAIResponseWithHistory(body.message, body.history);
    } else {
      // Single message mode
      aiResponse = await generateAIResponse(body.message);
    }

    if (aiResponse.error) {
      return NextResponse.json(
        { error: aiResponse.error },
        { status: 500 }
      );
    }

    // Save conversation to database
    try {
      await chatMessageUseCases.saveConversation(
        userId,
        body.message,
        aiResponse.text
      );
    } catch {
      console.error('Failed to save chat message');
      // Don't fail the request if saving fails
    }

    return NextResponse.json({
      data: {
        response: aiResponse.text,
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
async function getHandler(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Auth check
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;
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

// Export handlers with inline auth - use standard Request type for Next.js App Router
export async function POST(request: Request) {
  return postHandler(request as unknown as NextRequest);
}

export async function GET(request: Request) {
  return getHandler(request as unknown as NextRequest);
}
