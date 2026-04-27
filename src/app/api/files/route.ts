import { NextRequest, NextResponse } from 'next/server';
import { FileUseCases } from '@/domain/use-cases';
import { SupabaseFileRepository } from '@/infrastructure/database';
import { createFileSchema } from '@/domain/entities/file';
import { createClient as createServerClient } from '@/infrastructure/supabase/server';
import { ApiResponse } from '@/shared/types';

const fileRepository = new SupabaseFileRepository();
const fileUseCases = new FileUseCases(fileRepository);

/**
 * GET /api/files
 * List user's files with optional filtering
 * Rate limit: 30 requests per minute per user
 */
async function getHandler(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Auth check
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;

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
  } catch {
    console.error('Error fetching files');
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

/**
 * POST /api/files
 * Upload file metadata
 * Rate limit: 10 uploads per hour per user
 */
async function postHandler(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Auth check
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;

    const body = await req.json();

    // Validate file data - ensure all required fields
    const validatedData = createFileSchema.parse({
      userId,
      title: body.title,
      subject: body.subject || null,
      semester: body.semester || null,
      type: body.type || null,
      fileUrl: body.fileUrl,
      storagePath: body.storagePath || null,
      sizeBytes: body.sizeBytes || null,
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
  } catch {
    console.error('Error creating file');
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}

// Export handlers - use standard Request type for Next.js App Router
export async function GET(request: Request) {
  return getHandler(request as unknown as NextRequest);
}

export async function POST(request: Request) {
  return postHandler(request as unknown as NextRequest);
}
