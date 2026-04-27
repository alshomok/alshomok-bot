import { AssignmentRepository } from '@/domain/repositories/assignment-repository';
import {
  Assignment,
  CreateAssignment,
  UpdateAssignment,
  AssignmentStatus,
} from '@/domain/entities/assignment';
import { createClient as createServerClient } from '@/infrastructure/supabase/server';

export class SupabaseAssignmentRepository implements AssignmentRepository {
  async findById(id: string): Promise<Assignment | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByStudentId(studentId: string): Promise<Assignment[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: true });

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async findByStatus(studentId: string, status: AssignmentStatus): Promise<Assignment[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', status)
      .order('due_date', { ascending: true });

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async findUpcoming(studentId: string, days: number): Promise<Assignment[]> {
    const supabase = await createServerClient();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('student_id', studentId)
      .lte('due_date', futureDate.toISOString())
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true });

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async create(data: CreateAssignment): Promise<Assignment> {
    const supabase = await createServerClient();
    const { data: result, error } = await supabase
      .from('assignments')
      .insert({
        student_id: data.studentId,
        title: data.title,
        description: data.description,
        due_date: data.dueDate?.toISOString(),
        status: data.status,
        priority: data.priority,
      } as unknown as never)
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Failed to create assignment: ${error?.message}`);
    }

    return this.mapToEntity(result);
  }

  async update(id: string, data: UpdateAssignment): Promise<Assignment> {
    const supabase = await createServerClient();
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.due_date = data.dueDate?.toISOString();
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;

    const { data: result, error } = await supabase
      .from('assignments')
      .update(updateData as unknown as never)
      .eq('id', id)
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Failed to update assignment: ${error?.message}`);
    }

    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase.from('assignments').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete assignment: ${error.message}`);
    }
  }

  private mapToEntity(data: Record<string, unknown>): Assignment {
    return {
      id: data.id as string,
      studentId: data.student_id as string,
      title: data.title as string,
      description: data.description as string | null,
      dueDate: data.due_date ? new Date(data.due_date as string) : null,
      status: data.status as AssignmentStatus,
      priority: data.priority as Assignment['priority'],
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }
}
