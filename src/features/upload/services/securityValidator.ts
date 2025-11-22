/**
 * Security Validator Service
 * 
 * Validates file security including magic numbers and path traversal
 */

import { FileValidationResult } from '../types';
import { verifyFileType, detectFileType } from '../utils/magicNumbers';
import { sanitizeFilename } from '../utils/filenameSanitizer';

export class SecurityValidator {
  /**
   * Validate file header (magic numbers)
   */
  static validateFileHeader(
    buffer: Buffer,
    expectedMimeType: string,
    filename: string
  ): FileValidationResult {
    const errors: string[] = [];
    
    // Verify file type matches expected MIME type
    const isValid = verifyFileType(buffer, expectedMimeType);
    if (!isValid) {
      errors.push(`File header does not match expected type ${expectedMimeType}`);
    }
    
    // Detect actual file type
    const detectedType = detectFileType(buffer);
    if (detectedType && detectedType !== expectedMimeType) {
      errors.push(
        `File header indicates type ${detectedType} but expected ${expectedMimeType}`
      );
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate path for traversal attempts
   */
  static validatePath(path: string, basePath: string): FileValidationResult {
    const errors: string[] = [];
    
    // Check for path traversal
    if (path.includes('..') || path.includes('../')) {
      errors.push('Path traversal detected');
    }
    
    // Check if path is within base path
    const normalizedPath = path.replace(/\\/g, '/');
    const normalizedBase = basePath.replace(/\\/g, '/');
    
    if (!normalizedPath.startsWith(normalizedBase)) {
      errors.push('Path is outside allowed directory');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Sanitize and validate filename
   */
  static sanitizeAndValidateFilename(filename: string): {
    sanitized: string;
    validation: FileValidationResult;
  } {
    const sanitized = sanitizeFilename(filename);
    const validation = this.validateFilename(sanitized);
    
    return { sanitized, validation };
  }
  
  /**
   * Validate filename
   */
  private static validateFilename(filename: string): FileValidationResult {
    const errors: string[] = [];
    
    if (!filename || filename.length === 0) {
      errors.push('Filename cannot be empty');
    }
    
    if (filename.includes('..')) {
      errors.push('Filename cannot contain parent directory references');
    }
    
    if (filename.includes('/') || filename.includes('\\')) {
      errors.push('Filename cannot contain path separators');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

