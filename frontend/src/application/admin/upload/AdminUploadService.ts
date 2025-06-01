import { UploadRepository } from '@/domain/repositories/UploadRepository';

export class AdminUploadService {
  constructor(private readonly repo: UploadRepository) {}

  uploadFile(file: File) {
    return this.repo.uploadFile(file);
  }

  deleteFile(filename: string) {
    return this.repo.deleteFile(filename);
  }

  getFileUrl(filename: string) {
    return this.repo.getFileUrl(filename);
  }
} 