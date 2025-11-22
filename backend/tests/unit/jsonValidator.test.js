/**
 * JSON Validator Unit Tests
 * 
 * Tests for JSON Schema validation service.
 */

import { jsonValidator } from '@/features/editor/services/jsonValidator';
import { projectSchema, blogPostSchema, aboutSchema } from '@/features/editor/services/jsonSchema';

describe('JSONValidator', () => {
  describe('validate', () => {
    it('should validate valid project JSON', () => {
      const validProject = {
        id: 1,
        name: 'Test Project',
        description: 'Test description',
        stars: 10,
        forks: 5,
        topics: ['react', 'typescript'],
        updatedAt: '2025-11-21T08:00:00.000Z',
        createdAt: '2025-11-21T08:00:00.000Z',
        size: 1000,
        featured: false,
        category: 'web',
        technologies: ['React'],
        status: 'active',
        difficulty: 'intermediate',
        contributors: 1,
        screenshots: [],
        tags: []
      };

      const result = jsonValidator.validate(validProject, projectSchema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject project with missing required fields', () => {
      const invalidProject = {
        id: 1
        // Missing name and description
      };

      const result = jsonValidator.validate(invalidProject, projectSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject project with wrong type', () => {
      const invalidProject = {
        id: 'not-a-number',
        name: 'Test',
        description: 'Test',
        stars: 'not-a-number'
      };

      const result = jsonValidator.validate(invalidProject, projectSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate valid blog post JSON', () => {
      const validBlogPost = {
        id: 'test-post',
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
        publishedAt: '2025-11-21T08:00:00.000Z',
        updatedAt: '2025-11-21T08:00:00.000Z',
        author: 'Test Author',
        category: 'tech',
        tags: ['test'],
        featured: false,
        draft: false,
        readingTime: 5,
        status: 'published',
        difficulty: 'beginner',
        technologies: []
      };

      const result = jsonValidator.validate(validBlogPost, blogPostSchema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject blog post with invalid slug format', () => {
      const invalidBlogPost = {
        id: 'test-post',
        title: 'Test Post',
        content: 'Test content',
        slug: 'invalid slug with spaces',
        publishedAt: '2025-11-21T08:00:00.000Z',
        updatedAt: '2025-11-21T08:00:00.000Z'
      };

      const result = jsonValidator.validate(invalidBlogPost, blogPostSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate valid about JSON', () => {
      const validAbout = {
        content: 'About content',
        htmlContent: '<p>About content</p>',
        lastModified: '2025-11-21T08:00:00.000Z',
        generatedBy: 'test'
      };

      const result = jsonValidator.validate(validAbout, aboutSchema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject about with missing required content', () => {
      const invalidAbout = {
        htmlContent: '<p>Content</p>'
        // Missing required 'content' field
      };

      const result = jsonValidator.validate(invalidAbout, aboutSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateString', () => {
    it('should validate valid JSON string', () => {
      const validJson = JSON.stringify({
        id: 1,
        name: 'Test',
        description: 'Test description'
      });

      const result = jsonValidator.validateString(validJson, projectSchema);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid JSON string', () => {
      const invalidJson = '{ invalid json }';

      const result = jsonValidator.validateString(invalidJson, projectSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('formatError', () => {
    it('should format error message correctly', () => {
      const error = {
        path: '/name',
        message: 'Required field missing',
        value: undefined
      };

      const formatted = jsonValidator.formatError(error);
      expect(formatted).toContain('/name');
      expect(formatted).toContain('Required field missing');
    });
  });

  describe('formatErrors', () => {
    it('should format multiple errors', () => {
      const errors = [
        {
          path: '/name',
          message: 'Required field missing',
          value: undefined
        },
        {
          path: '/description',
          message: 'Required field missing',
          value: undefined
        }
      ];

      const formatted = jsonValidator.formatErrors(errors);
      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toContain('/name');
      expect(formatted[1]).toContain('/description');
    });
  });
});

