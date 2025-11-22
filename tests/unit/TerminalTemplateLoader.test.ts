/**
 * Unit tests for TerminalTemplateLoader
 */

import { TerminalTemplateLoader, TemplateVariables } from '@/features/terminal/services/templateLoader';
import { promises as fs } from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn()
  }
}));

describe('TerminalTemplateLoader', () => {
  let loader: TerminalTemplateLoader;
  let mockVariables: TemplateVariables;
  let templateDir: string;

  beforeEach(() => {
    templateDir = path.join(process.cwd(), 'src', 'features', 'terminal', 'templates');
    loader = new TerminalTemplateLoader();
    mockVariables = {
      USERNAME: 'testuser',
      HOSTNAME: 'testserver',
      PASSWORD_USER: 'userpass123',
      PASSWORD_ROOT: 'rootpass456',
      PASSWORD_HINT: 'First letter is u',
      ROOT_PASSWORD_HINT: 'First letter is r'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    loader.clearCache();
  });

  describe('loadTemplate', () => {
    it('should load template file successfully', async () => {
      const templateContent = '{"username": "{{USERNAME}}"}';
      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);

      const result = await loader.loadTemplate('terminal-user-info.json');

      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('terminal-user-info.json.template'),
        'utf-8'
      );
      expect(result).toBe(templateContent);
    });

    it('should cache loaded templates', async () => {
      const templateContent = '{"username": "{{USERNAME}}"}';
      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);

      await loader.loadTemplate('terminal-user-info.json');
      await loader.loadTemplate('terminal-user-info.json');

      // Should only be called once due to caching
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should throw error for missing template file', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(
        loader.loadTemplate('nonexistent.json')
      ).rejects.toThrow('Template file not found');
    });

    it('should throw error for read failures', async () => {
      const error = new Error('Permission denied');
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(
        loader.loadTemplate('terminal-user-info.json')
      ).rejects.toThrow('Failed to load template');
    });
  });

  describe('replaceVariables', () => {
    it('should replace all template variables correctly', () => {
      const content = '{"username": "{{USERNAME}}", "hostname": "{{HOSTNAME}}"}';
      
      const result = loader.replaceVariables(content, mockVariables);

      expect(result).toBe('{"username": "testuser", "hostname": "testserver"}');
    });

    it('should replace multiple occurrences of same variable', () => {
      const content = '{{USERNAME}} logged in as {{USERNAME}}';
      
      const result = loader.replaceVariables(content, mockVariables);

      expect(result).toBe('testuser logged in as testuser');
    });

    it('should handle optional variables with empty fallback', () => {
      const content = '{"hint": "{{PASSWORD_HINT}}"}';
      const varsWithoutHint = { ...mockVariables };
      delete varsWithoutHint.PASSWORD_HINT;

      const result = loader.replaceVariables(content, varsWithoutHint);

      expect(result).toBe('{"hint": ""}');
    });

    it('should replace all variable types', () => {
      const content = JSON.stringify({
        username: '{{USERNAME}}',
        hostname: '{{HOSTNAME}}',
        password: '{{PASSWORD_USER}}',
        rootPassword: '{{PASSWORD_ROOT}}',
        hint: '{{PASSWORD_HINT}}',
        rootHint: '{{ROOT_PASSWORD_HINT}}'
      });

      const result = loader.replaceVariables(content, mockVariables);
      const parsed = JSON.parse(result);

      expect(parsed.username).toBe('testuser');
      expect(parsed.hostname).toBe('testserver');
      expect(parsed.password).toBe('userpass123');
      expect(parsed.rootPassword).toBe('rootpass456');
      expect(parsed.hint).toBe('First letter is u');
      expect(parsed.rootHint).toBe('First letter is r');
    });
  });

  describe('generateFromTemplate', () => {
    it('should generate JSON from template successfully', async () => {
      const templateContent = '{"username": "{{USERNAME}}", "hostname": "{{HOSTNAME}}"}';
      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);

      const result = await loader.generateFromTemplate(
        'terminal-user-info.json',
        mockVariables
      );

      expect(result).toEqual({
        username: 'testuser',
        hostname: 'testserver'
      });
    });

    it('should throw error for invalid JSON', async () => {
      const templateContent = '{invalid json}';
      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);

      await expect(
        loader.generateFromTemplate('terminal-user-info.json', mockVariables)
      ).rejects.toThrow('Failed to parse JSON');
    });

    it('should handle nested JSON structures', async () => {
      const templateContent = JSON.stringify({
        user: {
          name: '{{USERNAME}}',
          home: '/home/{{USERNAME}}'
        },
        system: {
          hostname: '{{HOSTNAME}}'
        }
      });
      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);

      const result = await loader.generateFromTemplate(
        'terminal-user-info.json',
        mockVariables
      );

      expect(result.user.name).toBe('testuser');
      expect(result.user.home).toBe('/home/testuser');
      expect(result.system.hostname).toBe('testserver');
    });
  });

  describe('generateAllTerminalFiles', () => {
    it('should generate all 6 terminal files', async () => {
      const templateContent = '{"username": "{{USERNAME}}"}';
      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);

      const results = await loader.generateAllTerminalFiles(mockVariables);

      // Should generate all 6 files
      expect(Object.keys(results)).toHaveLength(6);
      expect(results).toHaveProperty('terminal-user-info.json');
      expect(results).toHaveProperty('terminal-commands.json');
      expect(results).toHaveProperty('terminal.json');
      expect(results).toHaveProperty('fake-os-structure.json');
      expect(results).toHaveProperty('permission-rules.json');
      expect(results).toHaveProperty('puzzle-files.json');
    });

    it('should throw error if any template generation fails', async () => {
      const templateContent = '{"username": "{{USERNAME}}"}';
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';

      // First call succeeds, second fails
      (fs.readFile as jest.Mock)
        .mockResolvedValueOnce(templateContent)
        .mockRejectedValueOnce(error);

      await expect(
        loader.generateAllTerminalFiles(mockVariables)
      ).rejects.toThrow('Template generation failed');
    });
  });

  describe('validateVariables', () => {
    it('should validate all required variables are present', () => {
      const validation = loader.validateVariables(mockVariables);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should return errors for missing required variables', () => {
      const incomplete = {
        USERNAME: 'testuser'
        // Missing other required fields
      };

      const validation = loader.validateVariables(incomplete);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors).toContain(expect.stringContaining('HOSTNAME'));
      expect(validation.errors).toContain(expect.stringContaining('PASSWORD_USER'));
      expect(validation.errors).toContain(expect.stringContaining('PASSWORD_ROOT'));
    });

    it('should return errors for invalid variable types', () => {
      const invalid = {
        USERNAME: 123, // Should be string
        HOSTNAME: 'testserver',
        PASSWORD_USER: 'userpass',
        PASSWORD_ROOT: 'rootpass'
      };

      const validation = loader.validateVariables(invalid);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(expect.stringContaining('USERNAME'));
    });
  });

  describe('clearCache', () => {
    it('should clear template cache', async () => {
      const templateContent = '{"username": "{{USERNAME}}"}';
      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);

      await loader.loadTemplate('terminal-user-info.json');
      expect(fs.readFile).toHaveBeenCalledTimes(1);

      loader.clearCache();
      await loader.loadTemplate('terminal-user-info.json');

      // Should be called again after cache clear
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('getTemplateFiles', () => {
    it('should return all 6 terminal template file names', () => {
      const files = TerminalTemplateLoader.getTemplateFiles();

      expect(files).toHaveLength(6);
      expect(files).toContain('terminal-user-info.json');
      expect(files).toContain('terminal-commands.json');
      expect(files).toContain('terminal.json');
      expect(files).toContain('fake-os-structure.json');
      expect(files).toContain('permission-rules.json');
      expect(files).toContain('puzzle-files.json');
    });
  });
});

