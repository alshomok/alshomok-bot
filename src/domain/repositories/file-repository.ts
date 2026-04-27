import { FileEntity, CreateFile, UpdateFile, FileSearchFilters } from '../entities/file';

export interface FileRepository {
  findById(id: string, userId?: string): Promise<FileEntity | null>;
  findByUserId(userId: string): Promise<FileEntity[]>;
  findAll(): Promise<FileEntity[]>;
  searchByFilters(filters: FileSearchFilters): Promise<FileEntity[]>;
  searchByTitle(query: string, userId?: string): Promise<FileEntity[]>;
  create(data: CreateFile): Promise<FileEntity>;
  update(id: string, data: UpdateFile, userId?: string): Promise<FileEntity>;
  delete(id: string, userId?: string): Promise<void>;
  getUserStorageUsage(userId: string): Promise<number>;
}
