/**
 * File Upload Types
 * 
 * TypeScript interfaces for file upload system
 */

export type UploadCategory = 'hero' | 'background' | 'projects' | 'blog' | 'about' | 'general';

export interface FileUploadRequest {
  file: File;
  category: UploadCategory;
  filename?: string;
}

export interface FileUploadResponse {
  success: boolean;
  file?: {
    filename: string;
    path: string;
    url: string;
    size: number;
    mimeType: string;
    category: UploadCategory;
  };
  error?: string;
  validationErrors?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FileStorageConfig {
  basePath: string;
  maxFileSize: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  maxFilesPerCategory: number;
  maxTotalSize: number;
  maxTotalFiles: number;
}

export interface FileInfo {
  filename: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  category: UploadCategory;
  uploadedAt: string;
}

export interface StorageStats {
  totalSize: number;
  totalFiles: number;
  categoryStats: Record<UploadCategory, {
    size: number;
    count: number;
  }>;
}

