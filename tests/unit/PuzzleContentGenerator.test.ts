/**
 * Puzzle Content Generator Tests
 * 
 * Unit tests for the puzzle content generation system.
 */

import { PuzzleContentGenerator } from '../../src/lib/puzzleContentGenerator'
import { TerminalCredentials } from '../../src/types/puzzle'

// Mock fetch for puzzle configuration
global.fetch = jest.fn()

describe('PuzzleContentGenerator', () => {
  let generator: PuzzleContentGenerator
  let mockCredentials: TerminalCredentials

  beforeEach(() => {
    generator = new PuzzleContentGenerator()
    mockCredentials = {
      hostname: 'test-host',
      username: 'testuser',
      password: 'testpass',
      password_hint: 'Test password hint',
      root_username: 'root',
      root_password: 'rootpass',
      root_password_hint: 'Root password hint'
    }

    // Mock successful fetch response
    ;(fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        flags: [],
        hints: [],
        templates: [
          {
            name: 'test.txt',
            type: 'text',
            template: 'Hello {username} from {hostname}!',
            variables: ['username', 'hostname'],
            hidden: false,
            permissions: '-rw-r--r--',
            owner: '{username}',
            group: '{username}'
          }
        ],
        hiddenFiles: ['.test'],
        binaryTypes: ['bin'],
        credentialFiles: ['test.txt']
      })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('generateFileContent', () => {
    it('should generate content from template', async () => {
      // Wait for config to load
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const content = generator.generateFileContent('test.txt', '/home/testuser/test.txt', mockCredentials)
      expect(content).toBe('Hello testuser from test-host!')
    })

    it('should generate default content for non-template files', () => {
      const content = generator.generateFileContent('unknown.txt', '/home/testuser/unknown.txt', mockCredentials)
      expect(content).toContain('unknown.txt')
    })

    it('should cache generated content', async () => {
      // Wait for config to load
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const content1 = generator.generateFileContent('test.txt', '/home/testuser/test.txt', mockCredentials)
      const content2 = generator.generateFileContent('test.txt', '/home/testuser/test.txt', mockCredentials)
      
      expect(content1).toBe(content2)
      expect(generator.getCacheSize()).toBe(1)
    })
  })

  describe('generateBinaryContent', () => {
    it('should generate binary-like content', () => {
      const content = generator.generateBinaryContent('executable')
      expect(content).toContain('^@')
      expect(content).toContain('^A')
      expect(content.length).toBeGreaterThan(100)
    })

    it('should generate different content each time', () => {
      const content1 = generator.generateBinaryContent('executable')
      const content2 = generator.generateBinaryContent('executable')
      expect(content1).not.toBe(content2)
    })
  })

  describe('generateFlagContent', () => {
    it('should generate flag content with template variables', () => {
      const flag = {
        id: 'test_flag',
        content: 'CTF{test_{username}}',
        location: '/home/{username}/flag.txt',
        difficulty: 'easy' as const,
        hints: []
      }

      const content = generator.generateFlagContent(flag, mockCredentials)
      expect(content).toBe('CTF{test_testuser}')
    })
  })

  describe('generateHintContent', () => {
    it('should generate hint content with template variables', () => {
      const hint = {
        id: 'test_hint',
        content: 'Hint for {username} on {hostname}',
        location: '/home/{username}/hint.txt',
        type: 'text' as const,
        difficulty: 'easy' as const
      }

      const content = generator.generateHintContent(hint, mockCredentials)
      expect(content).toBe('Hint for testuser on test-host')
    })
  })

  describe('generateCredentialContent', () => {
    it('should generate credential content', () => {
      const content = generator.generateCredentialContent(mockCredentials)
      expect(content).toContain('username: testuser')
      expect(content).toContain('password: testpass')
      expect(content).toContain('hostname: test-host')
      expect(content).toContain('root_username: root')
      expect(content).toContain('root_password: rootpass')
    })
  })

  describe('isPuzzleFile', () => {
    it('should identify puzzle files', async () => {
      // Wait for config to load
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(generator.isPuzzleFile('test.txt')).toBe(true)
      expect(generator.isPuzzleFile('unknown.txt')).toBe(false)
    })
  })

  describe('isHiddenFile', () => {
    it('should identify hidden files', async () => {
      // Wait for config to load
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(generator.isHiddenFile('.test')).toBe(true)
      expect(generator.isHiddenFile('test.txt')).toBe(false)
      expect(generator.isHiddenFile('.hidden')).toBe(true)
    })
  })

  describe('getPuzzleTemplate', () => {
    it('should return puzzle template', async () => {
      // Wait for config to load
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const template = generator.getPuzzleTemplate('test.txt')
      expect(template).toBeDefined()
      expect(template?.name).toBe('test.txt')
    })

    it('should return null for non-puzzle files', async () => {
      // Wait for config to load
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const template = generator.getPuzzleTemplate('unknown.txt')
      expect(template).toBeNull()
    })
  })

  describe('cache management', () => {
    it('should clear cache', async () => {
      // Wait for config to load
      await new Promise(resolve => setTimeout(resolve, 100))
      
      generator.generateFileContent('test.txt', '/home/testuser/test.txt', mockCredentials)
      expect(generator.getCacheSize()).toBe(1)
      
      generator.clearCache()
      expect(generator.getCacheSize()).toBe(0)
    })
  })
})
