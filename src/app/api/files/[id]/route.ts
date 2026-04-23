import { NextRequest, NextResponse } from 'next/server';
import { FileUseCases } from '@/domain/use-cases';
import { SupabaseFileRepository } from '@/infrastructure/database';
import { updateFileSchema } from '@/domain/entities/file';
import { ApiResponse } from '@/shared/types';

const fileRepository = new SupabaseFileRepository();
const fileUseCases = new FileUseCases(fileRepository);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const file = await fileUseCases.getFileById(params.id);

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ data: file });
  } catch {
    console.error('Error fetching file');
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await req.json();
    const validatedData = updateFileSchema.parse(body);

    const file = await fileUseCases.updateFile(params.id, validatedData);
    return NextResponse.json({ data: file });
  } catch {
    console.error('Error updating file');
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    await fileUseCases.deleteFile(params.id);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch {
    console.error('Error deleting file');
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
