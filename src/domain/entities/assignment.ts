import { z } from 'zod';

export const assignmentStatusSchema = z.enum(['pending', 'in_progress', 'completed']);
export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;

export const assignmentPrioritySchema = z.enum(['low', 'medium', 'high']);
export type AssignmentPriority = z.infer<typeof assignmentPrioritySchema>;

export const assignmentSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).nullable(),
  dueDate: z.date().nullable(),
  status: assignmentStatusSchema,
  priority: assignmentPrioritySchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Assignment = z.infer<typeof assignmentSchema>;

export const createAssignmentSchema = assignmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateAssignment = z.infer<typeof createAssignmentSchema>;

export const updateAssignmentSchema = createAssignmentSchema.partial().omit({ studentId: true });

export type UpdateAssignment = z.infer<typeof updateAssignmentSchema>;
