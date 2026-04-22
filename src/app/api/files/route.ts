import { NextRequest, NextResponse } from 'next/server';
import { FileUseCases } from '@/domain/use-cases';
import { SupabaseFileRepository } from '@/infrastructure/database';
import { createFileSchema } from '@/domain/entities/file';
import { withAuthAndRateLimit, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ApiResponse } from '@/shared/types';

const fileRepository = new SupabaseFileRepository();
const fileUseCases = new FileUseCases(fileRepository);

/**
 * GET /api/files
 * List user's files with optional filtering
 * Rate limit: 30 requests per minute per user
 */
async function getHandler(req: AuthenticatedRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const subject = searchParams.get('subject');
    const semester = searchParams.get('semester');
    const type = searchParams.get('type');

    let files;

    if (query) {
      // Natural language search (user-scoped)
      files = await fileUseCases.searchFilesByNaturalLanguage(query, userId);
    } else if (subject || semester || type) {
      // Filtered search (user-scoped)
      const filters = {
        ...(subject && { subject }),
        ...(semester && { semester: parseInt(semester, 10) }),
        ...(type && { type }),
      };
      files = await fileUseCases.searchFilesByFilters(filters, userId);
    } else {
      // Get user's files only
      files = await fileUseCases.getUserFiles(userId);
    }

    // Get storage usage for this user
    const storageUsage = await fileUseCases.getUserStorageUsage(userId);

    return NextResponse.json({
      data: {
        files,
        storageUsage,
        count: files.length,
      },
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

/**
 * POST /api/files
 * Upload file metadata
 * Rate limit: 10 uploads per hour per user
 */
async function postHandler(req: AuthenticatedRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate file data
    const validatedData = createFileSchema.parse({
      ...body,
      userId, // Associate with current user
    });

    // Check storage limits (example: 100MB for free tier)
    const currentUsage = await fileUseCases.getUserStorageUsage(userId);
    const fileSize = body.sizeBytes || 0;
    const MAX_STORAGE = 100 * 1024 * 1024; // 100MB

    if (currentUsage + fileSize > MAX_STORAGE) {
      return NextResponse.json(
        {
          error: 'Storage limit exceeded',
          message: `You have used ${(currentUsage / 1024 / 1024).toFixed(2)}MB of ${(MAX_STORAGE / 1024 / 1024).toFixed(0)}MB. Upgrade to Pro for more storage.`,
        },
        { status: 413 }
      );
    }

    const file = await fileUseCases.uploadFileMetadata(validatedData);

    return NextResponse.json(
      {
        data: file,
        message: 'File uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating file:', error);
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}

// Export wrapped handlers with auth and rate limiting
export const GET = withAuthAndRateLimit(getHandler, 'search');
export const POST = withAuthAndRateLimit(postHandler, 'upload');
