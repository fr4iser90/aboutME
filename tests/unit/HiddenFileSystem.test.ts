/**
 * Hidden File System Tests
 * 
 * Unit tests for the hidden file system management.
 */

import { HiddenFileSystemManager } from '../../src/lib/hiddenFileSystem'
import { TerminalCredentials } from '../../src/types/puzzle'

// Mock fetch for puzzle configuration
global.fetch = jest.fn()

describe('HiddenFileSystemManager', () => {
  let hiddenFileSystem: HiddenFileSystemManager
  let mockCredentials: TerminalCredentials

  beforeEach(() => {
    hiddenFileSystem = new HiddenFileSystemManager()
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
            name: '.bashrc',
            type: 'text',
            template: '# {username} bashrc',
            variables: ['username'],
            hidden: true,
            permissions: '-rw-r--r--',
            owner: '{username}',
            group: '{username}'
          }
        ],
        hiddenFiles: ['.bashrc', '.ssh/id_rsa'],
        binaryTypes: ['bin'],
        credentialFiles: ['.bashrc']
      })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialize', () => {
    it('should initialize with terminal credentials', async () => {
      await hiddenFileSystem.initialize(mockCredentials)
      
      expect(hiddenFileSystem.isHidden('.bashrc')).toBe(true)
      expect(hiddenFileSystem.isHiddenDirectory('.ssh')).toBe(true)
    })
  })

  describe('isHidden', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should identify hidden files', () => {
      expect(hiddenFileSystem.isHidden('.bashrc')).toBe(true)
      expect(hiddenFileSystem.isHidden('.ssh/id_rsa')).toBe(true)
      expect(hiddenFileSystem.isHidden('.hidden')).toBe(true)
    })

    it('should identify non-hidden files', () => {
      expect(hiddenFileSystem.isHidden('test.txt')).toBe(false)
      expect(hiddenFileSystem.isHidden('README.md')).toBe(false)
    })
  })

  describe('isHiddenDirectory', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should identify hidden directories', () => {
      expect(hiddenFileSystem.isHiddenDirectory('.ssh')).toBe(true)
      expect(hiddenFileSystem.isHiddenDirectory('.config')).toBe(true)
      expect(hiddenFileSystem.isHiddenDirectory('.hidden')).toBe(true)
    })

    it('should identify non-hidden directories', () => {
      expect(hiddenFileSystem.isHiddenDirectory('Documents')).toBe(false)
      expect(hiddenFileSystem.isHiddenDirectory('Downloads')).toBe(false)
    })
  })

  describe('getHiddenFileContent', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should return hidden file content', () => {
      const content = hiddenFileSystem.getHiddenFileContent('.bashrc')
      expect(content).toContain('testuser')
    })

    it('should return null for non-hidden files', () => {
      const content = hiddenFileSystem.getHiddenFileContent('test.txt')
      expect(content).toBeNull()
    })
  })

  describe('getHiddenFileMetadata', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should return hidden file metadata', () => {
      const metadata = hiddenFileSystem.getHiddenFileMetadata('.bashrc')
      expect(metadata).toBeDefined()
      expect(metadata?.name).toBe('.bashrc')
      expect(metadata?.hidden).toBe(true)
    })

    it('should return null for non-hidden files', () => {
      const metadata = hiddenFileSystem.getHiddenFileMetadata('test.txt')
      expect(metadata).toBeNull()
    })
  })

  describe('listHiddenFiles', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should list hidden files in directory', () => {
      const files = hiddenFileSystem.listHiddenFiles('/home/testuser')
      expect(files).toContain('.bashrc')
    })

    it('should return empty array for non-hidden directories', () => {
      const files = hiddenFileSystem.listHiddenFiles('/tmp')
      expect(files).toEqual([])
    })
  })

  describe('getAllHiddenFiles', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should return all hidden files', () => {
      const files = hiddenFileSystem.getAllHiddenFiles()
      expect(files.length).toBeGreaterThan(0)
      expect(files.some(file => file.name === '.bashrc')).toBe(true)
    })
  })

  describe('getHiddenFilesByType', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should return hidden files by type', () => {
      const textFiles = hiddenFileSystem.getHiddenFilesByType('text')
      expect(textFiles.length).toBeGreaterThan(0)
      expect(textFiles.every(file => file.type === 'text')).toBe(true)
    })
  })

  describe('hasHiddenFiles', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should detect hidden files in path', () => {
      expect(hiddenFileSystem.hasHiddenFiles('/home/testuser')).toBe(true)
    })

    it('should not detect hidden files in empty path', () => {
      expect(hiddenFileSystem.hasHiddenFiles('/empty')).toBe(false)
    })
  })

  describe('discoverHiddenFiles', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should discover common hidden files', () => {
      const discovered = hiddenFileSystem.discoverHiddenFiles('/home/testuser')
      expect(discovered).toContain('.bashrc')
      expect(discovered).toContain('.ssh/id_rsa')
    })
  })

  describe('generateHiddenFileContent', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should generate hidden file content', () => {
      const content = hiddenFileSystem.generateHiddenFileContent('.bashrc', '/home/testuser/.bashrc')
      expect(content).toContain('testuser')
    })

    it('should generate default hidden content for unknown files', () => {
      const content = hiddenFileSystem.generateHiddenFileContent('.unknown', '/home/testuser/.unknown')
      expect(content).toContain('testuser')
    })
  })

  describe('getHiddenFilePermissions', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should return hidden file permissions', () => {
      const permissions = hiddenFileSystem.getHiddenFilePermissions('.bashrc')
      expect(permissions).toBe('-rw-r--r--')
    })

    it('should return default permissions for unknown files', () => {
      const permissions = hiddenFileSystem.getHiddenFilePermissions('.unknown')
      expect(permissions).toBe('-rw-r--r--')
    })
  })

  describe('getHiddenFileOwner', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should return hidden file owner', () => {
      const owner = hiddenFileSystem.getHiddenFileOwner('.bashrc')
      expect(owner).toBe('testuser')
    })

    it('should return default owner for unknown files', () => {
      const owner = hiddenFileSystem.getHiddenFileOwner('.unknown')
      expect(owner).toBe('root')
    })
  })

  describe('getHiddenFileGroup', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should return hidden file group', () => {
      const group = hiddenFileSystem.getHiddenFileGroup('.bashrc')
      expect(group).toBe('testuser')
    })

    it('should return default group for unknown files', () => {
      const group = hiddenFileSystem.getHiddenFileGroup('.unknown')
      expect(group).toBe('root')
    })
  })

  describe('shouldShowInLs', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should show hidden files when showHidden is true', () => {
      expect(hiddenFileSystem.shouldShowInLs('.bashrc', true)).toBe(true)
    })

    it('should hide hidden files when showHidden is false', () => {
      expect(hiddenFileSystem.shouldShowInLs('.bashrc', false)).toBe(false)
    })

    it('should show non-hidden files regardless of showHidden', () => {
      expect(hiddenFileSystem.shouldShowInLs('test.txt', false)).toBe(true)
      expect(hiddenFileSystem.shouldShowInLs('test.txt', true)).toBe(true)
    })
  })

  describe('getDiscoveryHints', () => {
    it('should return discovery hints', () => {
      const hints = hiddenFileSystem.getDiscoveryHints()
      expect(hints.length).toBeGreaterThan(0)
      expect(hints[0]).toContain('ls -a')
    })
  })

  describe('clear', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should clear hidden file system', () => {
      expect(hiddenFileSystem.getAllHiddenFiles().length).toBeGreaterThan(0)
      
      hiddenFileSystem.clear()
      
      expect(hiddenFileSystem.getAllHiddenFiles().length).toBe(0)
    })
  })

  describe('getStatistics', () => {
    beforeEach(async () => {
      await hiddenFileSystem.initialize(mockCredentials)
    })

    it('should return statistics', () => {
      const stats = hiddenFileSystem.getStatistics()
      expect(stats.totalHiddenFiles).toBeGreaterThan(0)
      expect(stats.totalHiddenDirectories).toBeGreaterThan(0)
      expect(stats.hiddenFileTypes).toBeDefined()
    })
  })
})
