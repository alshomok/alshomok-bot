import { Telegraf, Context } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/config/env';
import { FileUseCases } from '@/domain/use-cases';
import { SupabaseFileRepository } from '@/infrastructure/database';
import { extractFileMetadata, formatMetadataConfirmation } from '@/lib/services';

// User session state
interface UserSession {
  state: 'idle' | 'waiting_subject' | 'waiting_semester' | 'confirming';
  fileId?: string;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  subject?: string;
  semester?: number;
  fileType?: string;
}

const userSessions = new Map<number, UserSession>();

function getOrCreateSession(userId: number): UserSession {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, { state: 'idle' });
  }
  return userSessions.get(userId)!;
}

function clearSession(userId: number) {
  userSessions.delete(userId);
}

export function setupFileBotHandlers(bot: Telegraf) {
  const fileRepository = new SupabaseFileRepository();
  const fileUseCases = new FileUseCases(fileRepository);

  // Create Supabase admin client for storage
  const supabaseAdmin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // /upload command
  bot.command('upload', async (ctx: Context) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    getOrCreateSession(userId);
    await ctx.reply(
      '📤 Please send me the file you want to upload.\n\n' +
        '🤖 I will automatically analyze the file name and extract:\n' +
        '• Subject\n' +
        '• Semester\n' +
        '• File type\n\n' +
        'Supported formats: PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, ZIP'
    );
  });

  // Handle file upload
  bot.on('document', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const document = ctx.message.document;
    if (!document) {
      await ctx.reply('❌ No file received. Please try again.');
      return;
    }

    // Check file size (max 50MB for Telegram, 20MB for safety)
    if (document.file_size && document.file_size > 20 * 1024 * 1024) {
      await ctx.reply('❌ File is too large. Maximum size is 20MB.');
      return;
    }

    const session = getOrCreateSession(userId);
    session.fileId = document.file_id;
    session.fileName = document.file_name || 'unnamed_file';
    session.mimeType = document.mime_type || 'application/octet-stream';

    // Try to detect file type from extension
    const extension = session.fileName.split('.').pop()?.toLowerCase();
    if (extension) {
      const typeMap: Record<string, string> = {
        pdf: 'pdf',
        doc: 'notes',
        docx: 'notes',
        txt: 'notes',
        xls: 'sheet',
        xlsx: 'sheet',
        ppt: 'notes',
        pptx: 'notes',
        zip: 'other',
      };
      session.fileType = typeMap[extension] || 'other';
    }

    await ctx.reply('⏳ Downloading file from Telegram...');

    try {
      // Get file URL from Telegram
      const fileLink = await ctx.telegram.getFileLink(document.file_id);

      // Download file
      const response = await fetch(fileLink.toString());
      if (!response.ok) {
        throw new Error('Failed to download file from Telegram');
      }

      const fileBuffer = await response.arrayBuffer();

      await ctx.reply('⏳ Uploading to storage...');

      // Upload to Supabase Storage
      const filePath = `uploads/${userId}/${Date.now()}_${session.fileName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('files')
        .upload(filePath, fileBuffer, {
          contentType: session.mimeType,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('files')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;
      const fileName = session.fileName || 'unnamed_file';
      const fileSize = document.file_size || 0;

      await ctx.reply('✅ File uploaded to storage!\n\n🤖 Analyzing file name with AI...');

      // Use Gemini AI to extract metadata from file name
      const metadata = await extractFileMetadata(fileName);

      // Save to database with AI-extracted metadata
      try {
        const file = await fileUseCases.uploadFileMetadata({
          title: fileName,
          subject: metadata.subject,
          semester: metadata.semester,
          type: metadata.type,
          fileUrl: fileUrl,
          storagePath: filePath,
          sizeBytes: fileSize,
        });

        // Success message with extracted metadata
        const metadataDisplay = formatMetadataConfirmation(metadata);

        await ctx.reply(
          `✅ File uploaded and saved successfully!\n\n` +
            `📁 ${file.title}\n\n` +
            `🤖 AI-Extracted Metadata:\n${metadataDisplay}\n\n` +
            `🔗 ${env.NEXT_PUBLIC_APP_URL}/files`,
          {
            reply_markup: {
              remove_keyboard: true,
            },
          }
        );

        clearSession(userId);
      } catch {
        console.error('Database save error');
        await ctx.reply(
          `⚠️ File uploaded to storage but failed to save metadata.\n\n` +
            `You can access the file here:\n${fileUrl}\n\n` +
            `Please try uploading again or contact support.`,
          {
            reply_markup: {
              remove_keyboard: true,
            },
          }
        );
        clearSession(userId);
      }
    } catch (_error) {
      console.error('File upload error');
      await ctx.reply(
        `❌ Error uploading file: ${_error instanceof Error ? _error.message : 'Unknown error'}\n\nPlease try again with /upload`
      );
      clearSession(userId);
    }
  });

  // Handle text messages (commands only - AI handles metadata extraction)
  bot.on('text', async (ctx: Context) => {
    const userId = ctx.from?.id;
    const text = ctx.message?.text;
    if (!userId || !text) return;

    // Only handle commands, ignore other text
    if (text.startsWith('/')) return;

    // Check if user is in upload session but sent text instead of file
    const session = getOrCreateSession(userId);
    if (session.state !== 'idle') {
      await ctx.reply(
        '❓ Please send a file document, or type /cancel to cancel the upload.\n\n' +
          '🤖 The AI will automatically extract metadata from the file name.'
      );
    }
  });

  // Handle file type detection (photos)
  bot.on('photo', async (ctx) => {
    await ctx.reply(
      '📷 I received a photo. To upload images as documents, please send them as files (attach ➜ Document ➜ Photo).\n\n' +
        'Or use /upload to start the file upload process.'
    );
  });

  // Cancel command
  bot.command('cancel', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    clearSession(userId);
    await ctx.reply('❌ Upload cancelled. Start again with /upload', {
      reply_markup: {
        remove_keyboard: true,
      },
    });
  });

  // List files command
  bot.command('files', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    await ctx.reply('📂 Opening file manager...');
    await ctx.reply(
      `You can browse and search all uploaded files at:\n${env.NEXT_PUBLIC_APP_URL}/files`
    );
  });

  // Search command
  bot.command('search', async (ctx) => {
    const userId = ctx.from?.id;
    const query = ctx.message.text.split(' ').slice(1).join(' ');

    if (!userId) return;

    if (!query) {
      await ctx.reply(
        '🔍 Please provide a search query.\n\n' +
          'Example: /search database semester 2\n' +
          'Or: /search math notes'
      );
      return;
    }

    await ctx.reply(`🔍 Searching for: "${query}"...`);

    try {
      const results = await fileUseCases.searchFilesByNaturalLanguage(query);

      if (results.length === 0) {
        await ctx.reply('❌ No files found matching your search.\n\nTry: /search database');
        return;
      }

      let message = `📁 Found ${results.length} file(s):\n\n`;

      results.slice(0, 10).forEach((file, index) => {
        message +=
          `${index + 1}. ${file.title}\n` +
          `   📚 ${file.subject || 'N/A'} | Sem ${file.semester || 'N/A'} | ${file.type || 'file'}\n` +
          `   🔗 ${file.fileUrl}\n\n`;
      });

      if (results.length > 10) {
        message += `...and ${results.length - 10} more files.\n`;
      }

      message += `\n📂 View all files: ${env.NEXT_PUBLIC_APP_URL}/files`;

      await ctx.reply(message);
    } catch {
      console.error('Search error');
      await ctx.reply('❌ Error searching files. Please try again later.');
    }
  });

  // Help command for file bot
  bot.command('help', async (ctx: Context) => {
    await ctx.reply(
      '📚 Student Assistant File Bot (AI-Powered)\n\n' +
        'Commands:\n' +
        '/upload - Upload a new file\n' +
        '/files - Browse all files (web app)\n' +
        '/search <query> - Search files\n' +
        '/cancel - Cancel current upload\n' +
        '/help - Show this help\n\n' +
        '🤖 AI Upload - Just 2 steps:\n' +
        '1. Send /upload\n' +
        '2. Send your file\n\n' +
        'The AI will automatically extract:\n' +
        '• Subject from file name\n' +
        '• Semester if mentioned\n' +
        '• Document type\n\n' +
        `Web App: ${env.NEXT_PUBLIC_APP_URL}`
    );
  });
}
