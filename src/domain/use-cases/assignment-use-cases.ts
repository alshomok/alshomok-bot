import { AssignmentRepository } from '../repositories/assignment-repository';
import { Assignment, CreateAssignment, UpdateAssignment, AssignmentStatus } from '../entities/assignment';

export class AssignmentUseCases {
  constructor(private readonly assignmentRepository: AssignmentRepository) {}

  async getAssignmentById(id: string): Promise<Assignment | null> {
    return this.assignmentRepository.findById(id);
  }

  async getStudentAssignments(studentId: string): Promise<Assignment[]> {
    return this.assignmentRepository.findByStudentId(studentId);
  }

  async getAssignmentsByStatus(studentId: string, status: AssignmentStatus): Promise<Assignment[]> {
    return this.assignmentRepository.findByStatus(studentId, status);
  }

  async getUpcomingAssignments(studentId: string, days: number = 7): Promise<Assignment[]> {
    return this.assignmentRepository.findUpcoming(studentId, days);
  }

  async createAssignment(data: CreateAssignment): Promise<Assignment> {
    return this.assignmentRepository.create(data);
  }

  async updateAssignment(id: string, data: UpdateAssignment): Promise<Assignment> {
    const existingAssignment = await this.assignmentRepository.findById(id);
    if (!existingAssignment) {
      throw new Error('Assignment not found');
    }

    return this.assignmentRepository.update(id, data);
  }

  async completeAssignment(id: string): Promise<Assignment> {
    return this.updateAssignment(id, { status: 'completed' });
  }

  async deleteAssignment(id: string): Promise<void> {
    const existingAssignment = await this.assignmentRepository.findById(id);
    if (!existingAssignment) {
      throw new Error('Assignment not found');
    }

    return this.assignmentRepository.delete(id);
  }
}
