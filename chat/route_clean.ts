import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, generateAIResponseWithHistory, type AIResponse } from '@/lib/services';
import { ChatMessageUseCases } from '@/domain/use-cases';
import { SupabaseChatMessageRepository } from '@/infrastructure/database';
import { createClient as createServerClient } from '@/infrastructure/supabase/server';
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

async function postHandler(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
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

    if (body.history && body.history.length > 0) {
      aiResponse = await generateAIResponseWithHistory(body.message, body.history);
    } else {
      aiResponse = await generateAIResponse(body.message);
    }

    await chatMessageUseCases.saveChatMessage({
      userId,
      message: body.message,
      response: aiResponse.text,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
    });

    return NextResponse.json({
      data: {
        response: aiResponse.text,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

async function getHandler(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const history = await chatMessageUseCases.getChatHistory(userId, { limit, offset });

    return NextResponse.json({ data: history });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return postHandler(request as unknown as NextRequest);
}

export async function GET(request: Request) {
  return getHandler(request as unknown as NextRequest);
}
