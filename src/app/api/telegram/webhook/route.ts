import { webhookHandler } from '@/infrastructure/telegram';

export async function POST(request: Request) {
  return webhookHandler(request as any);
}
