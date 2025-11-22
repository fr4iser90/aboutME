/**
 * JSON Editor API Integration Tests
 * 
 * Tests for JSON file API endpoints.
 */

import { jsonValidator } from '@/features/editor/services/jsonValidator';
import { projectSchema } from '@/features/editor/services/jsonSchema';
import { promises as fs } from 'fs';
import path from 'path';

describe('JSON Editor API Integration', () => {
  const testDataDir = path.join(process.cwd(), 'public/data/test');
  const testProjectPath = path.join(testDataDir, 'projects', 'test-project.json');

  beforeAll(async () => {
    // Create test directory
    await fs.mkdir(path.join(testDataDir, 'projects'), { recursive: true });
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('JSON file operations', () => {
    it('should create and save a valid JSON file', async () => {
      const testProject = {
        id: 1,
        name: 'Test Project',
        description: 'Test description',
        stars: 10,
        forks: 5,
        topics: ['react', 'typescript'],
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
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

      // Validate before saving
      const validation = jsonValidator.validate(testProject, projectSchema);
      expect(validation.isValid).toBe(true);

      // Save file
      await fs.writeFile(
        testProjectPath,
        JSON.stringify(testProject, null, 2),
        'utf-8'
      );

      // Verify file exists
      const exists = await fs.access(testProjectPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should load and parse JSON file', async () => {
      const content = await fs.readFile(testProjectPath, 'utf-8');
      const data = JSON.parse(content);

      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('description');
      expect(data.name).toBe('Test Project');
    });

    it('should validate loaded JSON file', async () => {
      const content = await fs.readFile(testProjectPath, 'utf-8');
      const data = JSON.parse(content);

      const validation = jsonValidator.validate(data, projectSchema);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle file not found error', async () => {
      const nonExistentPath = path.join(testDataDir, 'non-existent.json');
      
      try {
        await fs.readFile(nonExistentPath, 'utf-8');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid JSON error', async () => {
      const invalidJsonPath = path.join(testDataDir, 'invalid.json');
      await fs.writeFile(invalidJsonPath, '{ invalid json }', 'utf-8');

      try {
        const content = await fs.readFile(invalidJsonPath, 'utf-8');
        JSON.parse(content);
        fail('Should have thrown a parse error');
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        await fs.unlink(invalidJsonPath).catch(() => {});
      }
    });

    it('should handle validation error', async () => {
      const invalidProject = {
        id: 1
        // Missing required fields
      };

      const validation = jsonValidator.validate(invalidProject, projectSchema);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('File path validation', () => {
    it('should detect path traversal attempts', () => {
      const baseDir = '/safe/directory';
      const maliciousPath = '../../../etc/passwd';
      const fullPath = path.join(baseDir, maliciousPath);
      const normalized = path.normalize(fullPath);

      expect(normalized.startsWith(path.normalize(baseDir))).toBe(false);
    });

    it('should allow valid relative paths', () => {
      const baseDir = '/safe/directory';
      const validPath = 'projects/project.json';
      const fullPath = path.join(baseDir, validPath);
      const normalized = path.normalize(fullPath);

      expect(normalized.startsWith(path.normalize(baseDir))).toBe(true);
    });
  });

  describe('Concurrent operations', () => {
    it('should handle multiple file reads concurrently', async () => {
      const readPromises = Array.from({ length: 5 }, () =>
        fs.readFile(testProjectPath, 'utf-8')
      );

      const results = await Promise.all(readPromises);
      expect(results).toHaveLength(5);
      results.forEach(result => {
        const data = JSON.parse(result);
        expect(data.name).toBe('Test Project');
      });
    });
  });
});

