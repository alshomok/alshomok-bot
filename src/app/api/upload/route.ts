import { NextRequest, NextResponse } from 'next/server';
import { FileUseCases } from '@/domain/use-cases';
import { SupabaseFileRepository } from '@/infrastructure/database';
import { createFileSchema, type CreateFile } from '@/domain/entities/file';
import { ApiResponse } from '@/shared/types';

const fileRepository = new SupabaseFileRepository();
const fileUseCases = new FileUseCases(fileRepository);

interface UploadRequest {
  title: string;
  subject?: string;
  semester?: number;
  type?: string;
  fileUrl: string;
}

/**
 * POST /api/upload
 * Upload file metadata to database
 * 
 * Body:
 * - title: string (required)
 * - subject: string (optional)
 * - semester: number (optional)
 * - type: string (optional)
 * - fileUrl: string (required)
 */
export async function POST(request: Request): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body: UploadRequest = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.fileUrl || typeof body.fileUrl !== 'string') {
      return NextResponse.json(
        { error: 'fileUrl is required and must be a string' },
        { status: 400 }
      );
    }

    // Prepare data for validation
    const fileData: CreateFile = {
      title: body.title,
      subject: body.subject || null,
      semester: body.semester || null,
      type: body.type || null,
      fileUrl: body.fileUrl,
    };

    // Validate with Zod schema
    const validatedData = createFileSchema.parse(fileData);

    // Save to database
    const file = await fileUseCases.uploadFileMetadata(validatedData);

    return NextResponse.json({
      data: file,
      message: 'File uploaded successfully',
    }, { status: 201 });
  } catch {
    console.error('Upload API error');
    return NextResponse.json(
      { error: 'Failed to upload file metadata' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Returns upload endpoint information
 */
export async function GET(): Promise<NextResponse<ApiResponse<unknown>>> {
  return NextResponse.json({
    data: {
      endpoint: '/api/upload',
      method: 'POST',
      description: 'Upload file metadata to database',
      requiredFields: ['title', 'fileUrl'],
      optionalFields: ['subject', 'semester', 'type'],
    },
  });
}

/**
 * PATCH /api/upload
 * Bulk upload multiple files
 */
export async function PATCH(request: Request): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await request.json();
    const { files } = body;

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Files array is required' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const validatedData = createFileSchema.parse(file);
        const savedFile = await fileUseCases.uploadFileMetadata(validatedData);
        results.push(savedFile);
      } catch (err) {
        errors.push({
          file: file.title || 'unknown',
          error: err instanceof Error ? err.message : 'Validation failed',
        });
      }
    }

    return NextResponse.json({
      data: {
        uploaded: results,
        failed: errors,
        total: files.length,
        success: results.length,
      },
      message: `Uploaded ${results.length} of ${files.length} files`,
    }, { status: results.length > 0 ? 200 : 400 });
  } catch {
    console.error('Bulk upload API error');
    return NextResponse.json(
      { error: 'Failed to process bulk upload' },
      { status: 500 }
    );
  }
}
