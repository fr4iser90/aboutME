/**
 * File Storage Service
 * 
 * Handles file storage operations and storage limit checking
 */

import fs from 'fs';
import path from 'path';
import { UploadCategory, FileInfo, StorageStats } from '../types';
import { getFileCountLimit, TOTAL_STORAGE_LIMIT, TOTAL_FILE_COUNT_LIMIT } from '../utils/fileSizeLimits';
import { generateUniqueFilename } from '../utils/filenameSanitizer';

export class FileStorage {
  private basePath: string;
  
  constructor(basePath: string) {
    this.basePath = basePath;
    this.ensureDirectories();
  }
  
  /**
   * Ensure all category directories exist
   */
  private ensureDirectories(): void {
    const categories: UploadCategory[] = ['hero', 'background', 'projects', 'blog', 'about', 'general'];
    
    for (const category of categories) {
      const dirPath = path.join(this.basePath, category);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
  }
  
  /**
   * Get storage statistics
   */
  getStorageStats(): StorageStats {
    const stats: StorageStats = {
      totalSize: 0,
      totalFiles: 0,
      categoryStats: {
        hero: { size: 0, count: 0 },
        background: { size: 0, count: 0 },
        projects: { size: 0, count: 0 },
        blog: { size: 0, count: 0 },
        about: { size: 0, count: 0 },
        general: { size: 0, count: 0 }
      }
    };
    
    const categories: UploadCategory[] = ['hero', 'background', 'projects', 'blog', 'about', 'general'];
    
    for (const category of categories) {
      const categoryPath = path.join(this.basePath, category);
      if (!fs.existsSync(categoryPath)) {
        continue;
      }
      
      const files = fs.readdirSync(categoryPath);
      let categorySize = 0;
      let categoryCount = 0;
      
      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        try {
          const fileStats = fs.statSync(filePath);
          if (fileStats.isFile()) {
            categorySize += fileStats.size;
            categoryCount++;
          }
        } catch (error) {
          // Skip files that can't be accessed
          continue;
        }
      }
      
      stats.categoryStats[category] = {
        size: categorySize,
        count: categoryCount
      };
      
      stats.totalSize += categorySize;
      stats.totalFiles += categoryCount;
    }
    
    return stats;
  }
  
  /**
   * Check storage limits
   */
  checkStorageLimits(
    newFileSize: number,
    category: UploadCategory
  ): { allowed: boolean; errors: string[] } {
    const errors: string[] = [];
    const stats = this.getStorageStats();
    
    // Check total size limit
    if (stats.totalSize + newFileSize > TOTAL_STORAGE_LIMIT) {
      errors.push(
        `Total storage limit would be exceeded (current: ${this.formatSize(stats.totalSize)}, limit: ${this.formatSize(TOTAL_STORAGE_LIMIT)})`
      );
    }
    
    // Check total file count limit
    if (stats.totalFiles + 1 > TOTAL_FILE_COUNT_LIMIT) {
      errors.push(
        `Total file count limit would be exceeded (current: ${stats.totalFiles}, limit: ${TOTAL_FILE_COUNT_LIMIT})`
      );
    }
    
    // Check category file count limit
    const categoryLimit = getFileCountLimit(category);
    if (stats.categoryStats[category].count + 1 > categoryLimit) {
      errors.push(
        `Category ${category} file count limit would be exceeded (current: ${stats.categoryStats[category].count}, limit: ${categoryLimit})`
      );
    }
    
    return {
      allowed: errors.length === 0,
      errors
    };
  }
  
  /**
   * Get files in category
   */
  getFilesInCategory(category: UploadCategory): string[] {
    const categoryPath = path.join(this.basePath, category);
    if (!fs.existsSync(categoryPath)) {
      return [];
    }
    
    return fs.readdirSync(categoryPath).filter(file => {
      // Filter out .gitkeep and other hidden/system files
      if (file.startsWith('.') || file === 'Thumbs.db') {
        return false;
      }
      
      const filePath = path.join(categoryPath, file);
      return fs.statSync(filePath).isFile();
    });
  }
  
  /**
   * Generate unique filename
   */
  generateUniqueFilename(category: UploadCategory, filename: string): string {
    const existingFiles = this.getFilesInCategory(category);
    const categoryPath = path.join(this.basePath, category);
    
    return generateUniqueFilename(categoryPath, filename, existingFiles);
  }
  
  /**
   * Get file path
   */
  getFilePath(category: UploadCategory, filename: string): string {
    return path.join(this.basePath, category, filename);
  }
  
  /**
   * Format file size
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

