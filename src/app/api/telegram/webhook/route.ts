import { NextRequest } from 'next/server';
import { webhookHandler } from '@/infrastructure/telegram';

export async function POST(req: NextRequest) {
  return webhookHandler(req);
}
