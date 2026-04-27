import { NextResponse } from 'next/server';
import { AssignmentUseCases } from '@/domain/use-cases';
import { SupabaseAssignmentRepository } from '@/infrastructure/database';
import { createAssignmentSchema, assignmentStatusSchema } from '@/domain/entities/assignment';
import { ApiResponse } from '@/shared/types';

const assignmentRepository = new SupabaseAssignmentRepository();
const assignmentUseCases = new AssignmentUseCases(assignmentRepository);

export async function GET(request: Request): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    let assignments;
    if (status) {
      const validatedStatus = assignmentStatusSchema.parse(status);
      assignments = await assignmentUseCases.getAssignmentsByStatus(studentId, validatedStatus);
    } else {
      assignments = await assignmentUseCases.getStudentAssignments(studentId);
    }

    return NextResponse.json({ data: assignments });
  } catch {
    console.error('Error fetching assignments');
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await request.json();
    const validatedData = createAssignmentSchema.parse(body);

    const assignment = await assignmentUseCases.createAssignment(validatedData);
    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch {
    console.error('Error creating assignment');
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
