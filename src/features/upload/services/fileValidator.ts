/**
 * File Validator Service
 * 
 * Validates file uploads for type, size, and category restrictions
 */

import { UploadCategory, FileValidationResult } from '../types';
import { getFileSizeLimit, getFileCountLimit } from '../utils/fileSizeLimits';
import { 
  ALLOWED_MIME_TYPES, 
  getMimeTypeFromExtension, 
  isValidMimeType 
} from '../utils/mimeTypes';
import { validateFilename } from '../utils/filenameSanitizer';

export class FileValidator {
  /**
   * Validate file type
   */
  static validateFileType(
    filename: string,
    mimeType: string,
    category: UploadCategory
  ): FileValidationResult {
    const errors: string[] = [];
    
    // Get allowed types for category
    const allowedTypes = this.getAllowedTypesForCategory(category);
    
    // Check MIME type
    if (!isValidMimeType(mimeType, allowedTypes)) {
      errors.push(`File type ${mimeType} is not allowed for category ${category}`);
    }
    
    // Check extension
    const ext = this.getExtension(filename);
    const expectedMimeType = getMimeTypeFromExtension(ext);
    if (expectedMimeType && expectedMimeType !== mimeType) {
      errors.push(`File extension ${ext} does not match MIME type ${mimeType}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate file size
   */
  static validateFileSize(
    size: number,
    category: UploadCategory
  ): FileValidationResult {
    const errors: string[] = [];
    const maxSize = getFileSizeLimit(category);
    
    if (size > maxSize) {
      errors.push(
        `File size ${this.formatSize(size)} exceeds limit of ${this.formatSize(maxSize)} for category ${category}`
      );
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate filename
   */
  static validateFilename(filename: string): FileValidationResult {
    const result = validateFilename(filename);
    
    return {
      valid: result.valid,
      errors: result.error ? [result.error] : []
    };
  }
  
  /**
   * Get allowed types for category
   */
  private static getAllowedTypesForCategory(category: UploadCategory): string[] {
    switch (category) {
      case 'hero':
      case 'background':
      case 'blog':
      case 'about':
        return [...ALLOWED_MIME_TYPES.images];
      case 'projects':
        return [...ALLOWED_MIME_TYPES.images, ...ALLOWED_MIME_TYPES.videos];
      case 'general':
        return [
          ...ALLOWED_MIME_TYPES.images,
          ...ALLOWED_MIME_TYPES.videos,
          ...ALLOWED_MIME_TYPES.documents
        ];
      default:
        return [];
    }
  }
  
  /**
   * Get file extension
   */
  private static getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.slice(lastDot).toLowerCase();
  }
  
  /**
   * Format file size
   */
  private static formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

