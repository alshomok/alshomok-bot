import { NextRequest } from 'next/server';
import { webhookHandler } from '@/infrastructure/telegram';

export async function POST(request: Request) {
  return webhookHandler(request as unknown as NextRequest);
}
