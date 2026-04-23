import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/infrastructure/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/services/rate-limiter';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string | null;
  };
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<(req: NextRequest) => Promise<NextResponse>> {
  return async (req: NextRequest) => {
    const supabase = await createServerClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access this resource' },
        { status: 401 }
      );
    }

    const authReq = req as AuthenticatedRequest;
    authReq.user = {
      id: user.id,
      email: user.email ?? null,
    };

    return handler(authReq);
  };
}

export async function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  endpoint: string,
  userId?: string
): Promise<(req: NextRequest) => Promise<NextResponse>> {
  return async (req: NextRequest) => {
    // Get user ID from auth header or request
    const authUserId = userId || req.headers.get('x-user-id');
    
    if (!authUserId) {
      return NextResponse.json(
        { error: 'Rate limit check failed', message: 'User identification required' },
        { status: 400 }
      );
    }

    const rateLimitResult = await checkRateLimit(authUserId, endpoint);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again after ${rateLimitResult.resetTime.toISOString()}`,
          resetTime: rateLimitResult.resetTime.toISOString(),
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const response = await handler(req);
    
    // Add rate limit headers to successful response
    const headers = getRateLimitHeaders(rateLimitResult);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

export async function withAuthAndRateLimit(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  endpoint: string
): Promise<(req: NextRequest) => Promise<NextResponse>> {
  return async (req: NextRequest) => {
    // First check auth
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access this resource' },
        { status: 401 }
      );
    }

    // Then check rate limit
    const rateLimitResult = await checkRateLimit(user.id, endpoint);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again after ${rateLimitResult.resetTime.toISOString()}`,
          resetTime: rateLimitResult.resetTime.toISOString(),
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Create authenticated request
    const authReq = req as AuthenticatedRequest;
    authReq.user = {
      id: user.id,
      email: user.email ?? null,
    };

    // Call handler
    const response = await handler(authReq);
    
    // Add rate limit headers
    const headers = getRateLimitHeaders(rateLimitResult);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}
