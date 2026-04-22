import { FileRepository } from '@/domain/repositories/file-repository';
import { FileEntity, CreateFile, UpdateFile, FileSearchFilters } from '@/domain/entities/file';
import { createServerClient } from '@/infrastructure/supabase';

export class SupabaseFileRepository implements FileRepository {
  async findById(id: string, userId?: string): Promise<FileEntity | null> {
    const supabase = await createServerClient();
    let query = supabase
      .from('files')
      .select('*')
      .eq('id', id);

    // If userId provided, scope to that user's files
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByUserId(userId: string): Promise<FileEntity[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async findAll(): Promise<FileEntity[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async searchByFilters(filters: FileSearchFilters): Promise<FileEntity[]> {
    const supabase = await createServerClient();
    let query = supabase.from('files').select('*');

    // Always filter by user_id if provided for data isolation
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }

    if (filters.semester) {
      query = query.eq('semester', filters.semester);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.keywords && filters.keywords.length > 0) {
      filters.keywords.forEach((keyword) => {
        query = query.ilike('title', `%${keyword}%`);
      });
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async searchByTitle(query: string, userId?: string): Promise<FileEntity[]> {
    const supabase = await createServerClient();
    let dbQuery = supabase
      .from('files')
      .select('*')
      .ilike('title', `%${query}%`);

    if (userId) {
      dbQuery = dbQuery.eq('user_id', userId);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async create(data: CreateFile): Promise<FileEntity> {
    const supabase = await createServerClient();
    const { data: result, error } = await supabase
      .from('files')
      .insert({
        user_id: data.userId,
        title: data.title,
        subject: data.subject,
        semester: data.semester,
        type: data.type,
        file_url: data.fileUrl,
        storage_path: data.storagePath,
        size_bytes: data.sizeBytes,
      })
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Failed to create file: ${error?.message}`);
    }

    return this.mapToEntity(result);
  }

  async update(id: string, data: UpdateFile, userId?: string): Promise<FileEntity> {
    const supabase = await createServerClient();
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.semester !== undefined) updateData.semester = data.semester;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.fileUrl !== undefined) updateData.file_url = data.fileUrl;
    if (data.storagePath !== undefined) updateData.storage_path = data.storagePath;
    if (data.sizeBytes !== undefined) updateData.size_bytes = data.sizeBytes;

    let query = supabase
      .from('files')
      .update(updateData)
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: result, error } = await query.select().single();

    if (error || !result) {
      throw new Error(`Failed to update file: ${error?.message}`);
    }

    return this.mapToEntity(result);
  }

  async delete(id: string, userId?: string): Promise<void> {
    const supabase = await createServerClient();
    let query = supabase.from('files').delete().eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getUserStorageUsage(userId: string): Promise<number> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('files')
      .select('size_bytes')
      .eq('user_id', userId);

    if (error || !data) return 0;

    return data.reduce((total, file) => total + (file.size_bytes || 0), 0);
  }

  private mapToEntity(data: Record<string, unknown>): FileEntity {
    return {
      id: data.id as string,
      userId: data.user_id as string | null,
      title: data.title as string,
      subject: data.subject as string | null,
      semester: data.semester as number | null,
      type: data.type as string | null,
      fileUrl: data.file_url as string,
      storagePath: data.storage_path as string | null,
      sizeBytes: data.size_bytes as number | null,
      createdAt: new Date(data.created_at as string),
    };
  }
}
