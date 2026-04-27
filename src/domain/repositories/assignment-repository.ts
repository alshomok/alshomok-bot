import { Assignment, CreateAssignment, UpdateAssignment, AssignmentStatus } from '../entities/assignment';

export interface AssignmentRepository {
  findById(id: string): Promise<Assignment | null>;
  findByStudentId(studentId: string): Promise<Assignment[]>;
  findByStatus(studentId: string, status: AssignmentStatus): Promise<Assignment[]>;
  findUpcoming(studentId: string, days: number): Promise<Assignment[]>;
  create(data: CreateAssignment): Promise<Assignment>;
  update(id: string, data: UpdateAssignment): Promise<Assignment>;
  delete(id: string): Promise<void>;
}
