import { StudentRepository } from '@/domain/repositories/student-repository';
import { Student, CreateStudent, UpdateStudent } from '@/domain/entities/student';
import { createClient as createServerClient } from '@/infrastructure/supabase/server';

export class SupabaseStudentRepository implements StudentRepository {
  async findById(id: string): Promise<Student | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByTelegramId(telegramId: string): Promise<Student | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByEmail(email: string): Promise<Student | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findAll(): Promise<Student[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase.from('students').select('*');

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async create(data: CreateStudent): Promise<Student> {
    const supabase = await createServerClient();
    const { data: result, error } = await supabase
      .from('students')
      .insert({
        telegram_id: data.telegramId,
        email: data.email,
        full_name: data.fullName,
        student_id: data.studentId,
      } as unknown as never)
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Failed to create student: ${error?.message}`);
    }

    return this.mapToEntity(result);
  }

  async update(id: string, data: UpdateStudent): Promise<Student> {
    const supabase = await createServerClient();
    const updateData: Record<string, unknown> = {};

    if (data.telegramId !== undefined) updateData.telegram_id = data.telegramId;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.studentId !== undefined) updateData.student_id = data.studentId;

    const { data: result, error } = await supabase
      .from('students')
      .update(updateData as unknown as never)
      .eq('id', id)
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Failed to update student: ${error?.message}`);
    }

    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase.from('students').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }

  private mapToEntity(data: Record<string, unknown>): Student {
    return {
      id: data.id as string,
      telegramId: data.telegram_id as string | null,
      email: data.email as string | null,
      fullName: data.full_name as string,
      studentId: data.student_id as string | null,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }
}
