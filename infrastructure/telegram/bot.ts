import { Telegraf, Context } from 'telegraf';
import { env } from '@/lib/config/env';
import { setupFileBotHandlers } from './file-bot';

let bot: Telegraf | null = null;

export function getBot(): Telegraf {
  if (!bot) {
    bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
  }
  return bot;
}

export function initBot() {
  const telegraf = getBot();

  // Basic commands
  telegraf.command('start', async (ctx: Context) => {
    await ctx.reply(
      'Welcome to Student Assistant! 📚\n\n' +
        'I can help you with:\n' +
        '/upload - Upload a new file\n' +
        '/files - Browse all files\n' +
        '/search <query> - Search files\n' +
        '/help - Show all commands\n\n' +
        `Web App: ${env.NEXT_PUBLIC_APP_URL}`
    );
  });

  telegraf.command('help', async (ctx: Context) => {
    await ctx.reply(
      '📚 Student Assistant Bot\n\n' +
        'File Commands:\n' +
        '/upload - Upload a new file\n' +
        '/files - Browse all files (web app)\n' +
        '/search <query> - Search files\n' +
        '/cancel - Cancel current upload\n' +
        '/help - Show this help\n\n' +
        'To upload a file:\n' +
        '1. Send /upload\n' +
        '2. Send your file\n' +
        '3. Select subject and semester\n\n' +
        `Web App: ${env.NEXT_PUBLIC_APP_URL}`
    );
  });

  // Setup file upload handlers
  setupFileBotHandlers(telegraf);

  return telegraf;
}
