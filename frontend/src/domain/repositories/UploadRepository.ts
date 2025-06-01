export interface UploadRepository {
  uploadFile(file: File): Promise<{ url: string; filename: string }>;
  deleteFile(filename: string): Promise<void>;
  getFileUrl(filename: string): Promise<string>;
} 