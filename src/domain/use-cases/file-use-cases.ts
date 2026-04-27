import { FileRepository } from '../repositories/file-repository';
import { FileEntity, CreateFile, UpdateFile, FileSearchFilters } from '../entities/file';
import { parseNaturalLanguageQuery } from '@/lib/utils';

export class FileUseCases {
  constructor(private readonly fileRepository: FileRepository) {}

  async getFileById(id: string, userId?: string): Promise<FileEntity | null> {
    return this.fileRepository.findById(id, userId);
  }

  async getUserFiles(userId: string): Promise<FileEntity[]> {
    return this.fileRepository.findByUserId(userId);
  }

  async getAllFiles(): Promise<FileEntity[]> {
    return this.fileRepository.findAll();
  }

  async searchFilesByNaturalLanguage(query: string, userId?: string): Promise<FileEntity[]> {
    const parsed = parseNaturalLanguageQuery(query);
    const filters: FileSearchFilters = {
      ...(userId && { userId }),
    };

    if (parsed.subject) filters.subject = parsed.subject;
    if (parsed.semester) filters.semester = parsed.semester;
    if (parsed.type) filters.type = parsed.type;
    if (parsed.keywords && parsed.keywords.length > 0) filters.keywords = parsed.keywords;

    return this.fileRepository.searchByFilters(filters);
  }

  async searchFilesByFilters(filters: FileSearchFilters, userId?: string): Promise<FileEntity[]> {
    const scopedFilters = {
      ...filters,
      ...(userId && { userId }),
    };
    return this.fileRepository.searchByFilters(scopedFilters);
  }

  async searchFilesByTitle(query: string, userId?: string): Promise<FileEntity[]> {
    return this.fileRepository.searchByTitle(query, userId);
  }

  async uploadFileMetadata(data: CreateFile): Promise<FileEntity> {
    return this.fileRepository.create(data);
  }

  async updateFile(id: string, data: UpdateFile, userId?: string): Promise<FileEntity> {
    const existingFile = await this.fileRepository.findById(id, userId);
    if (!existingFile) {
      throw new Error('File not found');
    }

    // Verify ownership if userId provided
    if (userId && existingFile.userId !== userId) {
      throw new Error('Access denied: You do not own this file');
    }

    return this.fileRepository.update(id, data, userId);
  }

  async deleteFile(id: string, userId?: string): Promise<void> {
    const existingFile = await this.fileRepository.findById(id, userId);
    if (!existingFile) {
      throw new Error('File not found');
    }

    // Verify ownership if userId provided
    if (userId && existingFile.userId !== userId) {
      throw new Error('Access denied: You do not own this file');
    }

    return this.fileRepository.delete(id, userId);
  }

  async getUserStorageUsage(userId: string): Promise<number> {
    return this.fileRepository.getUserStorageUsage(userId);
  }
}
