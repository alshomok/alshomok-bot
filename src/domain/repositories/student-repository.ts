import { Student, CreateStudent, UpdateStudent } from '../entities/student';

export interface StudentRepository {
  findById(id: string): Promise<Student | null>;
  findByTelegramId(telegramId: string): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  findAll(): Promise<Student[]>;
  create(data: CreateStudent): Promise<Student>;
  update(id: string, data: UpdateStudent): Promise<Student>;
  delete(id: string): Promise<void>;
}
