import { z } from 'zod';

export const fileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  title: z.string().min(1).max(300),
  subject: z.string().nullable(),
  semester: z.number().int().min(1).max(10).nullable(),
  type: z.string().nullable(),
  fileUrl: z.string().url(),
  storagePath: z.string().nullable(),
  sizeBytes: z.number().nullable(),
  createdAt: z.date(),
});

export type FileEntity = z.infer<typeof fileSchema>;

export const createFileSchema = fileSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateFile = z.infer<typeof createFileSchema>;

export const updateFileSchema = createFileSchema.partial();

export type UpdateFile = z.infer<typeof updateFileSchema>;

export interface FileSearchFilters {
  userId?: string;
  subject?: string;
  semester?: number;
  type?: string;
  keywords?: string[];
}
