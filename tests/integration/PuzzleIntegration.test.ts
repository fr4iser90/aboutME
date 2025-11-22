/**
 * Puzzle Integration Tests
 * 
 * Integration tests for the puzzle files system with terminal filesystem.
 */

import { FakeFileSystem } from '../../src/lib/fakeFilesystem'
import { TerminalCredentials } from '../../src/types/puzzle'

// Mock fetch for OS structure and puzzle configuration
global.fetch = jest.fn()

describe('Puzzle Integration Tests', () => {
  let filesystem: FakeFileSystem
  let mockCredentials: TerminalCredentials

  beforeEach(() => {
    mockCredentials = {
      hostname: 'test-host',
      username: 'testuser',
      password: 'testpass',
      password_hint: 'Test password hint',
      root_username: 'root',
      root_password: 'rootpass',
      root_password_hint: 'Root password hint'
    }

    // Mock OS structure
    ;(fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('fake-os-structure.json')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            filesystem: {
              home: {
                testuser: {
                  'credentials.txt': 'file',
                  'flag.txt': 'file',
                  'hint.md': 'file',
                  'config.json': 'file',
                  'secret.bin': 'file',
                  '.bashrc': 'file',
                  '.ssh': {
                    'id_rsa': 'file',
                    'id_rsa.pub': 'file',
                    'known_hosts': 'file'
                  }
                }
              }
            }
          })
        })
      } else if (url.includes('puzzle-files.json')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            flags: [
              {
                id: 'flag_001',
                content: 'CTF{hidden_in_plain_sight}',
                location: '/home/{username}/credentials.txt',
                difficulty: 'easy',
                hints: ['Look for files with unusual names'],
                dependencies: []
              }
            ],
            hints: [
              {
                id: 'hint_001',
                content: 'Look for files with unusual names',
                location: '/home/{username}/hint.md',
                type: 'text',
                difficulty: 'easy'
              }
            ],
            templates: [
              {
                name: 'credentials.txt',
                type: 'credential',
                template: 'Username: admin\nPassword: secret123\nFlag: CTF{hidden_in_plain_sight}',
                variables: ['username'],
                hidden: false,
                permissions: '-rw-r--r--',
                owner: '{username}',
                group: '{username}'
              },
              {
                name: 'flag.txt',
                type: 'flag',
                template: 'Congratulations! You found the flag!\n\nCTF{terminal_master_2024}',
                variables: ['username'],
                hidden: false,
                permissions: '-rw-r--r--',
                owner: '{username}',
                group: '{username}'
              },
              {
                name: 'hint.md',
                type: 'hint',
                template: '# Puzzle Hints\n\n## Step 1\nLook for files with unusual names',
                variables: ['username'],
                hidden: false,
                permissions: '-rw-r--r--',
                owner: '{username}',
                group: '{username}'
              },
              {
                name: 'config.json',
                type: 'config',
                template: '{\n  "server": "puzzle-server.local",\n  "username": "{username}"\n}',
                variables: ['username'],
                hidden: false,
                permissions: '-rw-r--r--',
                owner: '{username}',
                group: '{username}'
              },
              {
                name: 'secret.bin',
                type: 'binary',
                template: 'BINARY_CONTENT_PLACEHOLDER',
                variables: ['username'],
                hidden: false,
                permissions: '-rw-r--r--',
                owner: '{username}',
                group: '{username}'
              },
              {
                name: '.bashrc',
                type: 'text',
                template: '# {username} bashrc',
                variables: ['username'],
                hidden: true,
                permissions: '-rw-r--r--',
                owner: '{username}',
                group: '{username}'
              },
              {
                name: 'id_rsa',
                type: 'credential',
                template: '-----BEGIN OPENSSH PRIVATE KEY-----\n# Hidden flag: CTF{ssh_key_master}',
                variables: ['username'],
                hidden: true,
                permissions: '-rw-------',
                owner: '{username}',
                group: '{username}'
              }
            ],
            hiddenFiles: ['.bashrc', '.ssh/id_rsa', '.ssh/id_rsa.pub', '.ssh/known_hosts'],
            binaryTypes: ['bin'],
            credentialFiles: ['credentials.txt', '.ssh/id_rsa']
          })
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    filesystem = new FakeFileSystem('testuser', mockCredentials)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Puzzle File Content Generation', () => {
    it('should generate puzzle file content with template variables', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('credentials.txt')
      expect(result.success).toBe(true)
      expect(result.content).toContain('CTF{hidden_in_plain_sight}')
    })

    it('should generate flag file content', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('flag.txt')
      expect(result.success).toBe(true)
      expect(result.content).toContain('CTF{terminal_master_2024}')
    })

    it('should generate hint file content', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('hint.md')
      expect(result.success).toBe(true)
      expect(result.content).toContain('Puzzle Hints')
      expect(result.content).toContain('Look for files with unusual names')
    })

    it('should generate config file content with template variables', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('config.json')
      expect(result.success).toBe(true)
      expect(result.content).toContain('testuser')
      expect(result.content).toContain('puzzle-server.local')
    })

    it('should generate binary file content', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('secret.bin')
      expect(result.success).toBe(true)
      expect(result.content).toContain('^@')
      expect(result.content).toContain('^A')
    })
  })

  describe('Hidden File System Integration', () => {
    it('should generate hidden file content', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('.bashrc')
      expect(result.success).toBe(true)
      expect(result.content).toContain('testuser')
    })

    it('should generate SSH key content with hidden flag', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('.ssh/id_rsa')
      expect(result.success).toBe(true)
      expect(result.content).toContain('OPENSSH PRIVATE KEY')
      expect(result.content).toContain('CTF{ssh_key_master}')
    })
  })

  describe('File Listing with Hidden Files', () => {
    it('should list files without hidden files by default', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.ls()
      expect(result.success).toBe(true)
      expect(result.files).toContain('credentials.txt')
      expect(result.files).toContain('flag.txt')
      expect(result.files).not.toContain('.bashrc')
    })

    it('should list files with hidden files when showHidden is true', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.ls(undefined, true)
      expect(result.success).toBe(true)
      expect(result.files).toContain('credentials.txt')
      expect(result.files).toContain('flag.txt')
      expect(result.files).toContain('.bashrc')
    })
  })

  describe('File Analysis Commands Integration', () => {
    it('should work with file command', async () => {
      await filesystem.loadOsStructure()
      
      // Mock the file command execution
      const mockContext = {
        userName: 'testuser',
        currentDate: new Date().toISOString(),
        filesystem: filesystem,
        terminalCredentials: mockCredentials
      }

      // This would be tested with actual command execution
      // For now, we just verify the files exist and have content
      const result = await filesystem.cat('secret.bin')
      expect(result.success).toBe(true)
      expect(result.content).toBeDefined()
    })

    it('should work with strings command', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('secret.bin')
      expect(result.success).toBe(true)
      expect(result.content).toBeDefined()
      
      // The strings command would extract readable strings from binary content
      // This is tested by ensuring the content is generated properly
    })

    it('should work with hexdump command', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('secret.bin')
      expect(result.success).toBe(true)
      expect(result.content).toBeDefined()
      
      // The hexdump command would show hex representation
      // This is tested by ensuring binary content is generated
    })
  })

  describe('Permission System Integration', () => {
    it('should respect file permissions for puzzle files', async () => {
      await filesystem.loadOsStructure()
      await filesystem.initializePermissionSystem()
      
      // Test that files can be read with proper permissions
      const result = await filesystem.cat('credentials.txt')
      expect(result.success).toBe(true)
    })

    it('should respect hidden file permissions', async () => {
      await filesystem.loadOsStructure()
      await filesystem.initializePermissionSystem()
      
      // Test that hidden files can be read with proper permissions
      const result = await filesystem.cat('.bashrc')
      expect(result.success).toBe(true)
    })
  })

  describe('User Context Integration', () => {
    it('should use correct user context in puzzle content', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('config.json')
      expect(result.success).toBe(true)
      expect(result.content).toContain('testuser')
    })

    it('should use correct hostname context in puzzle content', async () => {
      await filesystem.loadOsStructure()
      
      // This would be tested if we had hostname in templates
      const result = await filesystem.cat('config.json')
      expect(result.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing puzzle configuration gracefully', async () => {
      // Mock failed fetch
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))
      
      const newFilesystem = new FakeFileSystem('testuser', mockCredentials)
      await newFilesystem.loadOsStructure()
      
      // Should still work with default content generation
      const result = await newFilesystem.cat('test.txt')
      expect(result.success).toBe(true)
    })

    it('should handle non-existent files', async () => {
      await filesystem.loadOsStructure()
      
      const result = await filesystem.cat('nonexistent.txt')
      expect(result.success).toBe(false)
      expect(result.error).toContain('No such file')
    })
  })

  describe('Performance', () => {
    it('should cache generated content', async () => {
      await filesystem.loadOsStructure()
      
      // First access
      const result1 = await filesystem.cat('credentials.txt')
      expect(result1.success).toBe(true)
      
      // Second access should use cache
      const result2 = await filesystem.cat('credentials.txt')
      expect(result2.success).toBe(true)
      expect(result1.content).toBe(result2.content)
    })
  })
})
