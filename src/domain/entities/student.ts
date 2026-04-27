import { z } from 'zod';

export const studentSchema = z.object({
  id: z.string().uuid(),
  telegramId: z.string().nullable(),
  email: z.string().email().nullable(),
  fullName: z.string().min(1).max(200),
  studentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Student = z.infer<typeof studentSchema>;

export const createStudentSchema = studentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateStudent = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = createStudentSchema.partial();

export type UpdateStudent = z.infer<typeof updateStudentSchema>;
