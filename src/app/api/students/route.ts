import { NextResponse } from 'next/server';
import { StudentUseCases } from '@/domain/use-cases';
import { SupabaseStudentRepository } from '@/infrastructure/database';
import { createStudentSchema } from '@/domain/entities/student';
import { ApiResponse } from '@/shared/types';

const studentRepository = new SupabaseStudentRepository();
const studentUseCases = new StudentUseCases(studentRepository);

export async function GET(): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const students = await studentUseCases.getAllStudents();
    return NextResponse.json({ data: students });
  } catch {
    console.error('Error fetching students');
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await request.json();
    const validatedData = createStudentSchema.parse(body);

    const student = await studentUseCases.registerStudent(validatedData);
    return NextResponse.json({ data: student }, { status: 201 });
  } catch {
    console.error('Error creating student');
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
