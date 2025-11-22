/**
 * File Validator Unit Tests
 * 
 * Tests for file validation service
 */

import { FileValidator } from '@/features/upload/services/fileValidator';
import { UploadCategory } from '@/features/upload/types';

describe('FileValidator', () => {
  describe('validateFileType', () => {
    it('should accept valid image for hero category', () => {
      const result = FileValidator.validateFileType('test.jpg', 'image/jpeg', 'hero');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject video for hero category', () => {
      const result = FileValidator.validateFileType('test.mp4', 'video/mp4', 'hero');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should accept video for projects category', () => {
      const result = FileValidator.validateFileType('test.mp4', 'video/mp4', 'projects');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject mismatched extension and MIME type', () => {
      const result = FileValidator.validateFileType('test.jpg', 'image/png', 'hero');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('validateFileSize', () => {
    it('should accept file within size limit', () => {
      const result = FileValidator.validateFileSize(1024 * 1024, 'hero'); // 1MB
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject file exceeding size limit', () => {
      const result = FileValidator.validateFileSize(3 * 1024 * 1024, 'hero'); // 3MB > 2MB limit
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('validateFilename', () => {
    it('should accept valid filename', () => {
      const result = FileValidator.validateFilename('test-image.jpg');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject filename with path traversal', () => {
      const result = FileValidator.validateFilename('../test.jpg');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should reject empty filename', () => {
      const result = FileValidator.validateFilename('');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

