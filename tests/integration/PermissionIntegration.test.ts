/**
 * Permission System Integration Tests
 * 
 * This file contains integration tests for the permission system
 * with filesystem operations and command execution.
 */

import { FakeFileSystem } from '../../src/lib/fakeFilesystem'
import { processCommand, loadTerminalCommands } from '../../src/lib/terminalCommands'

// Mock fetch for testing
global.fetch = jest.fn()

describe('Permission Integration Tests', () => {
  let filesystem: FakeFileSystem
  let mockContext: any
  let terminalCommands: any

  beforeEach(async () => {
    // Mock permission rules response
    const mockPermissionRules = {
      users: {
        'fr4iser': {
          userId: 'fr4iser',
          groups: ['users', 'sudo'],
          permissions: {
            read: ['/home/fr4iser', '/tmp', '/usr/share'],
            write: ['/home/fr4iser', '/tmp'],
            execute: ['/home/fr4iser', '/usr/bin', '/bin']
          }
        },
        'root': {
          userId: 'root',
          groups: ['root', 'wheel'],
          permissions: {
            read: ['/'],
            write: ['/'],
            execute: ['/']
          }
        }
      },
      rules: [
        {
          path: '/home/fr4iser',
          owner: 'fr4iser',
          group: 'users',
          permissions: {
            owner: { read: true, write: true, execute: true },
            group: { read: true, write: false, execute: true },
            other: { read: false, write: false, execute: false }
          }
        },
        {
          path: '/root',
          owner: 'root',
          group: 'root',
          permissions: {
            owner: { read: true, write: true, execute: true },
            group: { read: false, write: false, execute: false },
            other: { read: false, write: false, execute: false }
          }
        },
        {
          path: '/tmp',
          owner: 'root',
          group: 'root',
          permissions: {
            owner: { read: true, write: true, execute: true },
            group: { read: true, write: true, execute: true },
            other: { read: true, write: true, execute: true }
          }
        }
      ]
    }

    // Mock OS structure response
    const mockOsStructure = {
      system: {
        hostname: 'Gaming',
        username: 'fr4iser'
      },
      filesystem: {
        home: {
          fr4iser: {
            Documents: {
              'file1.txt': 'file',
              'file2.txt': 'file'
            },
            Downloads: {
              'download1.zip': 'file'
            },
            '.bashrc': 'file',
            '.gitconfig': 'file'
          }
        },
        root: {
          'secret.txt': 'file',
          'config.json': 'file'
        },
        tmp: {
          'temp1.txt': 'file',
          'temp2.log': 'file'
        }
      }
    }

    // Setup fetch mocks
    ;(global.fetch as jest.Mock)
      .mockImplementation((url: string) => {
        if (url.includes('permission-rules.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPermissionRules)
          })
        } else if (url.includes('fake-os-structure.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockOsStructure)
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

    filesystem = new FakeFileSystem('fr4iser')
    
    // Load terminal commands
    terminalCommands = await loadTerminalCommands()
    
    mockContext = {
      userName: 'fr4iser',
      currentDate: new Date().toLocaleString(),
      commandHistory: [],
      sessionId: 'test-session',
      commandCount: 0,
      outputCount: 0,
      currentPath: '/home/fr4iser',
      filesystem: filesystem,
      terminalCredentials: {
        hostname: 'Gaming',
        username: 'fr4iser',
        password: 'kira',
        root_username: 'root',
        root_password: 'password123456789!kira'
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('cd command with permissions', () => {
    test('should allow access to home directory', async () => {
      const result = await processCommand('cd /home/fr4iser', terminalCommands, terminalCommands, mockContext)
      expect(result).toBe('')
    })

    test('should deny access to root directory', async () => {
      const result = await processCommand('cd /root', terminalCommands, terminalCommands, mockContext)
      expect(result).toContain('Permission denied')
    })

    test('should allow access to tmp directory', async () => {
      const result = await processCommand('cd /tmp', terminalCommands, terminalCommands, mockContext)
      expect(result).toBe('')
    })
  })

  describe('ls command with permissions', () => {
    test('should allow listing home directory', async () => {
      const result = await processCommand('ls', terminalCommands, terminalCommands, mockContext)
      expect(result).not.toContain('Permission denied')
    })

    test('should deny listing root directory', async () => {
      // First change to root directory (this will fail due to permissions)
      const cdResult = await processCommand('cd /root', terminalCommands, mockContext)
      expect(cdResult).toContain('Permission denied')
    })
  })

  describe('cat command with permissions', () => {
    test('should allow reading files in home directory', async () => {
      const result = await processCommand('cat /home/fr4iser/Documents/file1.txt', terminalCommands, terminalCommands, mockContext)
      expect(result).not.toContain('Permission denied')
    })

    test('should deny reading files in root directory', async () => {
      const result = await processCommand('cat /root/secret.txt', terminalCommands, mockContext)
      expect(result).toContain('Permission denied')
    })

    test('should allow reading files in tmp directory', async () => {
      const result = await processCommand('cat /tmp/temp1.txt', terminalCommands, mockContext)
      expect(result).not.toContain('Permission denied')
    })
  })

  describe('rm command with permissions', () => {
    test('should allow removing files in home directory', async () => {
      const result = await processCommand('rm /home/fr4iser/Documents/file1.txt', terminalCommands, mockContext)
      expect(result).not.toContain('Permission denied')
    })

    test('should deny removing files in root directory', async () => {
      const result = await processCommand('rm /root/secret.txt', terminalCommands, mockContext)
      expect(result).toContain('Permission denied')
    })

    test('should allow removing files in tmp directory', async () => {
      const result = await processCommand('rm /tmp/temp1.txt', terminalCommands, mockContext)
      expect(result).not.toContain('Permission denied')
    })
  })

  describe('root user permissions', () => {
    beforeEach(() => {
      mockContext.userName = 'root'
      filesystem.setUser('root')
    })

    test('should allow root to access any directory', async () => {
      const result = await processCommand('cd /root', terminalCommands, terminalCommands, mockContext)
      expect(result).toBe('')
    })

    test('should allow root to read any file', async () => {
      const result = await processCommand('cat /root/secret.txt', terminalCommands, mockContext)
      expect(result).not.toContain('Permission denied')
    })

    test('should allow root to remove any file', async () => {
      const result = await processCommand('rm /root/secret.txt', terminalCommands, mockContext)
      expect(result).not.toContain('Permission denied')
    })
  })

  describe('permission error messages', () => {
    test('should provide helpful error messages', async () => {
      const result = await processCommand('cat /root/secret.txt', terminalCommands, mockContext)
      expect(result).toContain('Permission denied')
      expect(result).toContain('Hint:')
    })

    test('should suggest using sudo for permission errors', async () => {
      const result = await processCommand('rm /root/secret.txt', terminalCommands, mockContext)
      expect(result).toContain('Try using \'sudo\'')
    })
  })

  describe('permission system initialization', () => {
    test('should initialize permission system on first use', async () => {
      // This should trigger permission system initialization
      const result = await processCommand('cd /home/fr4iser', terminalCommands, terminalCommands, mockContext)
      expect(result).toBe('')
      
      // Verify fetch was called for permission rules
      expect(global.fetch).toHaveBeenCalledWith('/data/permission-rules.json')
    })

    test('should handle permission system initialization failure gracefully', async () => {
      // Mock fetch failure
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      
      // Should still work (fallback to allow all)
      const result = await processCommand('cd /home/fr4iser', terminalCommands, terminalCommands, mockContext)
      expect(result).toBe('')
    })
  })

  describe('complex permission scenarios', () => {
    test('should handle nested directory access', async () => {
      const result = await processCommand('cd /home/fr4iser/Documents', terminalCommands, mockContext)
      expect(result).toBe('')
    })

    test('should handle multiple file operations', async () => {
      const result1 = await processCommand('cat /home/fr4iser/Documents/file1.txt', terminalCommands, terminalCommands, mockContext)
      expect(result1).not.toContain('Permission denied')
      
      const result2 = await processCommand('cat /home/fr4iser/Documents/file2.txt', terminalCommands, mockContext)
      expect(result2).not.toContain('Permission denied')
    })

    test('should handle permission checks for different users', async () => {
      // Test as regular user
      const result1 = await processCommand('cat /root/secret.txt', terminalCommands, mockContext)
      expect(result1).toContain('Permission denied')
      
      // Switch to root user
      mockContext.userName = 'root'
      filesystem.setUser('root')
      
      const result2 = await processCommand('cat /root/secret.txt', terminalCommands, mockContext)
      expect(result2).not.toContain('Permission denied')
    })
  })
})
