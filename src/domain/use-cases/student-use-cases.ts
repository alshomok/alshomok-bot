import { StudentRepository } from '../repositories/student-repository';
import { Student, CreateStudent, UpdateStudent } from '../entities/student';

export class StudentUseCases {
  constructor(private readonly studentRepository: StudentRepository) {}

  async getStudentById(id: string): Promise<Student | null> {
    return this.studentRepository.findById(id);
  }

  async getStudentByTelegramId(telegramId: string): Promise<Student | null> {
    return this.studentRepository.findByTelegramId(telegramId);
  }

  async getAllStudents(): Promise<Student[]> {
    return this.studentRepository.findAll();
  }

  async registerStudent(data: CreateStudent): Promise<Student> {
    // Check if student with same email exists
    if (data.email) {
      const existingStudent = await this.studentRepository.findByEmail(data.email);
      if (existingStudent) {
        throw new Error('Student with this email already exists');
      }
    }

    return this.studentRepository.create(data);
  }

  async updateStudent(id: string, data: UpdateStudent): Promise<Student> {
    const existingStudent = await this.studentRepository.findById(id);
    if (!existingStudent) {
      throw new Error('Student not found');
    }

    return this.studentRepository.update(id, data);
  }

  async deleteStudent(id: string): Promise<void> {
    const existingStudent = await this.studentRepository.findById(id);
    if (!existingStudent) {
      throw new Error('Student not found');
    }

    return this.studentRepository.delete(id);
  }
}
