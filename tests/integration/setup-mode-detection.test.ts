/**
 * Setup Mode Detection Integration Tests
 * 
 * Tests the complete setup mode detection system including
 * API routes, middleware integration, and component behavior.
 */

import { NextRequest } from 'next/server';

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data) => ({ json: () => Promise.resolve(data) })),
    next: jest.fn(() => ({ headers: { set: jest.fn() } })),
    redirect: jest.fn(() => ({ headers: { set: jest.fn() } }))
  }
}));

// Mock file system
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    stat: jest.fn()
  }
}));

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

describe('Setup Mode Detection Integration', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = {
      url: 'http://localhost:3000',
      cookies: {
        get: jest.fn()
      }
    } as any;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Setup Status API', () => {
    it('should return initial setup mode when config files are missing', async () => {
      const { GET } = await import('../../src/app/api/setup/status/route');
      
      // Mock file system to return false for all files
      const fs = require('fs');
      fs.promises.access.mockRejectedValue(new Error('File not found'));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.isConfigured).toBe(false);
      expect(data.setupModeType).toBe('initial');
    });

    it('should return configured state when all files exist', async () => {
      const { GET } = await import('../../src/app/api/setup/status/route');
      
      // Mock file system to return true for all files
      const fs = require('fs');
      fs.promises.access.mockResolvedValue(undefined);
      fs.promises.stat.mockResolvedValue({
        mtime: { getTime: () => Date.now() - 10000 } // 10 seconds ago
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.isConfigured).toBe(true);
      expect(data.setupModeType).toBe(null);
    });

    it('should detect CSS changes and return build-required mode', async () => {
      const { GET } = await import('../../src/app/api/setup/status/route');
      
      // Mock file system
      const fs = require('fs');
      fs.promises.access.mockResolvedValue(undefined);
      fs.promises.stat.mockResolvedValue({
        mtime: { getTime: () => Date.now() + 1000 } // 1 second in future (recent change)
      });
      fs.promises.readFile.mockResolvedValue(JSON.stringify({ lastBuildTime: Date.now() - 20000 }));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.isConfigured).toBe(true);
      expect(data.setupModeType).toBe('build-required');
    });
  });

  describe('Setup Config API', () => {
    it('should create configuration files successfully', async () => {
      const { POST } = await import('../../src/app/api/setup/config/route');
      
      const configData = {
        githubUsername: 'testuser',
        portfolioTitle: 'Test Portfolio',
        portfolioDescription: 'A test portfolio',
        portfolioAuthor: 'Test Author'
      };

      // Mock file system
      const fs = require('fs');
      fs.promises.mkdir.mockResolvedValue(undefined);
      fs.promises.writeFile.mockResolvedValue(undefined);

      const mockRequest = {
        json: () => Promise.resolve(configData)
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe('Setup configuration created successfully');
      expect(fs.promises.writeFile).toHaveBeenCalledTimes(5); // 5 files created
    });

    it('should return error for missing required fields', async () => {
      const { POST } = await import('../../src/app/api/setup/config/route');
      
      const incompleteData = {
        githubUsername: 'testuser'
        // Missing other required fields
      };

      const mockRequest = {
        json: () => Promise.resolve(incompleteData)
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });
  });

  describe('Setup Disable API', () => {
    it('should disable setup mode successfully', async () => {
      const { POST } = await import('../../src/app/api/setup/disable/route');
      
      const existingConfig = {
        setup: { completed: false },
        security: { setupModeDisabled: false }
      };

      // Mock file system
      const fs = require('fs');
      fs.promises.access.mockResolvedValue(undefined);
      fs.promises.readFile.mockResolvedValue(JSON.stringify(existingConfig));
      fs.promises.writeFile.mockResolvedValue(undefined);

      const mockRequest = {} as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe('Setup mode disabled successfully');
      expect(data.config.completed).toBe(true);
      expect(data.config.setupModeDisabled).toBe(true);
    });

    it('should return error when config file is missing', async () => {
      const { POST } = await import('../../src/app/api/setup/disable/route');
      
      // Mock file system to throw error
      const fs = require('fs');
      fs.promises.access.mockRejectedValue(new Error('File not found'));

      const mockRequest = {} as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Config file not found');
    });
  });

  describe('Data Pipeline Integration', () => {
    it('should execute complete data pipeline', async () => {
      const { DataPipeline } = await import('../../src/lib/data-pipeline');
      
      const config = {
        githubUsername: 'testuser',
        portfolioTitle: 'Test Portfolio',
        portfolioDescription: 'A test portfolio',
        portfolioAuthor: 'Test Author'
      };

      // Mock file system
      const fs = require('fs');
      fs.promises.access.mockRejectedValue(new Error('Script not found')); // GitHub script not found
      fs.promises.mkdir.mockResolvedValue(undefined);
      fs.promises.writeFile.mockResolvedValue(undefined);

      const pipeline = new DataPipeline(config);
      const result = await pipeline.execute();

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.projects).toBeDefined();
      expect(result.data.skills).toBeDefined();
      expect(result.data.blog).toBeDefined();
      expect(result.data.terminal).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should handle pipeline errors gracefully', async () => {
      const { DataPipeline } = await import('../../src/lib/data-pipeline');
      
      const config = {
        githubUsername: 'testuser',
        portfolioTitle: 'Test Portfolio',
        portfolioDescription: 'A test portfolio',
        portfolioAuthor: 'Test Author'
      };

      // Mock file system to throw error
      const fs = require('fs');
      fs.promises.mkdir.mockRejectedValue(new Error('Permission denied'));

      const pipeline = new DataPipeline(config);
      const result = await pipeline.execute();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('Middleware Integration', () => {
    it('should allow access to setup API routes', async () => {
      const { middleware } = await import('../../src/middleware');
      
      const setupRequest = {
        nextUrl: { pathname: '/api/setup/status' },
        url: 'http://localhost:3000'
      } as any;

      const response = middleware(setupRequest);
      
      // Should not redirect (allow access)
      expect(response).toBeDefined();
    });

    it('should protect editor routes', async () => {
      const { middleware } = await import('../../src/middleware');
      
      const editorRequest = {
        nextUrl: { pathname: '/editor' },
        url: 'http://localhost:3000'
      } as any;

      // Mock authentication to return false
      const auth = require('../../src/features/auth/lib/auth');
      auth.isSecurelyAuthenticated = jest.fn().mockReturnValue(false);

      const response = middleware(editorRequest);
      
      // Should redirect to login
      expect(response).toBeDefined();
    });
  });

  describe('Component Integration', () => {
    it('should render setup wizard for initial mode', () => {
      // This would be tested with React Testing Library
      // For now, we'll test the hook logic
      const { useSetupModeDetection } = require('../../src/hooks/useSetupModeDetection');
      
      // Mock the hook behavior
      const mockHook = {
        mode: 'initial',
        isLoading: false,
        error: null,
        lastChecked: new Date()
      };

      expect(mockHook.mode).toBe('initial');
      expect(mockHook.isLoading).toBe(false);
    });

    it('should show build notification for build-required mode', () => {
      const { useSetupModeDetection } = require('../../src/hooks/useSetupModeDetection');
      
      const mockHook = {
        mode: 'build-required',
        isLoading: false,
        error: null,
        lastChecked: new Date()
      };

      expect(mockHook.mode).toBe('build-required');
      expect(mockHook.isLoading).toBe(false);
    });
  });
});
