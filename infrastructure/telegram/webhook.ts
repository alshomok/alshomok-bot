import { NextRequest, NextResponse } from 'next/server';
import { getBot } from './bot';
import { env } from '@/lib/config/env';

export async function webhookHandler(req: NextRequest) {
  try {
    // Verify webhook secret
    const signature = req.headers.get('x-telegram-bot-api-secret-token');
    if (signature !== env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bot = getBot();
    const body = await req.json();

    await bot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch {
    console.error('Webhook error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
