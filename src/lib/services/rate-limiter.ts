import { createClient as createServerClient } from '@/infrastructure/supabase/server';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  chat: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 requests per minute
  upload: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 uploads per hour
  search: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 searches per minute
  default: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalRequests: number;
}

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const supabase = await createServerClient();
  const limitConfig = config || DEFAULT_RATE_LIMITS[endpoint] || DEFAULT_RATE_LIMITS.default;
  const now = new Date();
  const windowStart = new Date(now.getTime() - limitConfig.windowMs);

  // Get or create rate limit record
  const { data: existing, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Rate limit fetch error:', fetchError);
    // Fail open - allow request if we can't check rate limit
    return {
      allowed: true,
      remaining: limitConfig.maxRequests - 1,
      resetTime: new Date(now.getTime() + limitConfig.windowMs),
      totalRequests: 1,
    };
  }

  let requestsCount = 1;

  if (existing) {
    const recordWindowStart = new Date(existing.window_start);
    
    // Check if window has reset
    if (recordWindowStart < windowStart) {
      // Reset window
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({
          requests_count: 1,
          window_start: now.toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Rate limit update error:', updateError);
      }
    } else {
      // Increment counter
      requestsCount = existing.requests_count + 1;
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ requests_count: requestsCount })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Rate limit update error:', updateError);
      }
    }
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from('rate_limits')
      .insert({
        user_id: userId,
        endpoint,
        requests_count: 1,
        window_start: now.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Rate limit insert error:', insertError);
    }
  }

  const allowed = requestsCount <= limitConfig.maxRequests;
  const remaining = Math.max(0, limitConfig.maxRequests - requestsCount);
  const resetTime = existing && new Date(existing.window_start) > windowStart
    ? new Date(new Date(existing.window_start).getTime() + limitConfig.windowMs)
    : new Date(now.getTime() + limitConfig.windowMs);

  return {
    allowed,
    remaining,
    resetTime,
    totalRequests: requestsCount,
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': (result.totalRequests + result.remaining).toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.resetTime.getTime() / 1000).toString(),
  };
}
