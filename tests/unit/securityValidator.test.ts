/**
 * Security Validator Unit Tests
 * 
 * Tests for security validation service
 */

import { SecurityValidator } from '@/features/upload/services/securityValidator';

describe('SecurityValidator', () => {
  describe('validateFileHeader', () => {
    it('should validate JPEG file header', () => {
      const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const result = SecurityValidator.validateFileHeader(jpegHeader, 'image/jpeg', 'test.jpg');
      expect(result.valid).toBe(true);
    });
    
    it('should validate PNG file header', () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const result = SecurityValidator.validateFileHeader(pngHeader, 'image/png', 'test.png');
      expect(result.valid).toBe(true);
    });
    
    it('should reject mismatched file header', () => {
      const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const result = SecurityValidator.validateFileHeader(jpegHeader, 'image/png', 'test.png');
      expect(result.valid).toBe(false);
    });
  });
  
  describe('validatePath', () => {
    const basePath = '/uploads';
    
    it('should accept valid path', () => {
      const result = SecurityValidator.validatePath('/uploads/hero/test.jpg', basePath);
      expect(result.valid).toBe(true);
    });
    
    it('should reject path traversal', () => {
      const result = SecurityValidator.validatePath('/uploads/../etc/passwd', basePath);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should reject path outside base directory', () => {
      const result = SecurityValidator.validatePath('/etc/passwd', basePath);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('sanitizeAndValidateFilename', () => {
    it('should sanitize filename with invalid characters', () => {
      const { sanitized, validation } = SecurityValidator.sanitizeAndValidateFilename('test<>file.jpg');
      expect(validation.valid).toBe(true);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });
    
    it('should reject filename with path separators', () => {
      const { validation } = SecurityValidator.sanitizeAndValidateFilename('test/file.jpg');
      expect(validation.valid).toBe(false);
    });
  });
});

