/**
 * File Size Limits Configuration
 * 
 * Size limits for file uploads by category
 */

import { UploadCategory } from '../types';

export const FILE_SIZE_LIMITS: Record<UploadCategory, number> = {
  hero: 2 * 1024 * 1024,        // 2MB
  background: 3 * 1024 * 1024,   // 3MB
  projects: 10 * 1024 * 1024,   // 10MB
  blog: 5 * 1024 * 1024,        // 5MB
  about: 2 * 1024 * 1024,       // 2MB
  general: 5 * 1024 * 1024      // 5MB
};

export const FILE_COUNT_LIMITS: Record<UploadCategory, number> = {
  hero: 1,
  background: 1,
  projects: 50,
  blog: 200,
  about: 5,
  general: 100
};

export const TOTAL_STORAGE_LIMIT = 500 * 1024 * 1024; // 500MB
export const TOTAL_FILE_COUNT_LIMIT = 1000;

export function getFileSizeLimit(category: UploadCategory): number {
  return FILE_SIZE_LIMITS[category];
}

export function getFileCountLimit(category: UploadCategory): number {
  return FILE_COUNT_LIMITS[category];
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

