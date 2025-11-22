/**
 * Permission System Unit Tests
 * 
 * This file contains unit tests for the permission system functionality,
 * including permission validation, file access control, and error handling.
 */

import { PermissionSystem } from '../lib/permissionSystem'
import { PermissionConfig, PermissionOperation } from '../types/permissions'

// Mock permission configuration for testing
const mockConfig: PermissionConfig = {
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

describe('PermissionSystem', () => {
  let permissionSystem: PermissionSystem

  beforeEach(() => {
    permissionSystem = new PermissionSystem(mockConfig)
  })

  describe('User Permissions', () => {
    test('should return correct user permissions', () => {
      const userPerms = permissionSystem.getUserPermissions('fr4iser')
      expect(userPerms).toBeDefined()
      expect(userPerms?.userId).toBe('fr4iser')
      expect(userPerms?.groups).toContain('users')
      expect(userPerms?.groups).toContain('sudo')
    })

    test('should return null for non-existent user', () => {
      const userPerms = permissionSystem.getUserPermissions('nonexistent')
      expect(userPerms).toBeNull()
    })

    test('should return root user permissions', () => {
      const userPerms = permissionSystem.getUserPermissions('root')
      expect(userPerms).toBeDefined()
      expect(userPerms?.userId).toBe('root')
      expect(userPerms?.groups).toContain('root')
    })
  })

  describe('File Permissions', () => {
    test('should return correct file permissions for known path', () => {
      const filePerms = permissionSystem.getFilePermissions('/home/fr4iser')
      expect(filePerms).toBeDefined()
      expect(filePerms?.owner.read).toBe(true)
      expect(filePerms?.owner.write).toBe(true)
      expect(filePerms?.owner.execute).toBe(true)
    })

    test('should return null for unknown path', () => {
      const filePerms = permissionSystem.getFilePermissions('/unknown/path')
      expect(filePerms).toBeNull()
    })
  })

  describe('Read Permissions', () => {
    test('should allow fr4iser to read from home directory', () => {
      const canRead = permissionSystem.canRead('fr4iser', '/home/fr4iser')
      expect(canRead).toBe(true)
    })

    test('should allow fr4iser to read from tmp directory', () => {
      const canRead = permissionSystem.canRead('fr4iser', '/tmp')
      expect(canRead).toBe(true)
    })

    test('should deny fr4iser access to root directory', () => {
      const canRead = permissionSystem.canRead('fr4iser', '/root')
      expect(canRead).toBe(false)
    })

    test('should allow root to read from any directory', () => {
      const canRead = permissionSystem.canRead('root', '/root')
      expect(canRead).toBe(true)
    })
  })

  describe('Write Permissions', () => {
    test('should allow fr4iser to write to home directory', () => {
      const canWrite = permissionSystem.canWrite('fr4iser', '/home/fr4iser')
      expect(canWrite).toBe(true)
    })

    test('should allow fr4iser to write to tmp directory', () => {
      const canWrite = permissionSystem.canWrite('fr4iser', '/tmp')
      expect(canWrite).toBe(true)
    })

    test('should deny fr4iser write access to root directory', () => {
      const canWrite = permissionSystem.canWrite('fr4iser', '/root')
      expect(canWrite).toBe(false)
    })

    test('should allow root to write to any directory', () => {
      const canWrite = permissionSystem.canWrite('root', '/root')
      expect(canWrite).toBe(true)
    })
  })

  describe('Execute Permissions', () => {
    test('should allow fr4iser to execute in home directory', () => {
      const canExecute = permissionSystem.canExecute('fr4iser', '/home/fr4iser')
      expect(canExecute).toBe(true)
    })

    test('should allow fr4iser to execute in bin directories', () => {
      const canExecute = permissionSystem.canExecute('fr4iser', '/usr/bin')
      expect(canExecute).toBe(true)
    })

    test('should deny fr4iser execute access to root directory', () => {
      const canExecute = permissionSystem.canExecute('fr4iser', '/root')
      expect(canExecute).toBe(false)
    })

    test('should allow root to execute in any directory', () => {
      const canExecute = permissionSystem.canExecute('root', '/root')
      expect(canExecute).toBe(true)
    })
  })

  describe('Path Traversal', () => {
    test('should allow valid path traversal', () => {
      const canTraverse = permissionSystem.checkPathTraversal('fr4iser', '/home/fr4iser/Documents')
      expect(canTraverse).toBe(true)
    })

    test('should deny invalid path traversal', () => {
      const canTraverse = permissionSystem.checkPathTraversal('fr4iser', '/root/secret')
      expect(canTraverse).toBe(false)
    })

    test('should allow root to traverse any path', () => {
      const canTraverse = permissionSystem.checkPathTraversal('root', '/root/secret')
      expect(canTraverse).toBe(true)
    })
  })

  describe('Validate Access', () => {
    test('should return allowed result for valid access', () => {
      const result = permissionSystem.validateAccess('fr4iser', '/home/fr4iser', 'read')
      expect(result.allowed).toBe(true)
      expect(result.error).toBeUndefined()
    })

    test('should return denied result for invalid access', () => {
      const result = permissionSystem.validateAccess('fr4iser', '/root', 'read')
      expect(result.allowed).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.type).toBe('permission_denied')
    })

    test('should return error for non-existent user', () => {
      const result = permissionSystem.validateAccess('nonexistent', '/home/fr4iser', 'read')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('User not found')
    })
  })

  describe('Permission Caching', () => {
    test('should cache permission results', () => {
      // First call should cache the result
      const result1 = permissionSystem.canRead('fr4iser', '/home/fr4iser')
      expect(result1).toBe(true)

      // Second call should use cached result
      const result2 = permissionSystem.canRead('fr4iser', '/home/fr4iser')
      expect(result2).toBe(true)
    })

    test('should clear cache when requested', () => {
      // Cache a result
      permissionSystem.canRead('fr4iser', '/home/fr4iser')
      
      // Clear cache
      permissionSystem.clearCache()
      
      // Result should still be correct (cache cleared but permission still valid)
      const result = permissionSystem.canRead('fr4iser', '/home/fr4iser')
      expect(result).toBe(true)
    })
  })

  describe('Rule Management', () => {
    test('should add new permission rule', () => {
      const newRule = {
        path: '/test',
        owner: 'fr4iser',
        group: 'users',
        permissions: {
          owner: { read: true, write: true, execute: true },
          group: { read: true, write: false, execute: true },
          other: { read: false, write: false, execute: false }
        }
      }

      permissionSystem.addRule(newRule)
      
      const canRead = permissionSystem.canRead('fr4iser', '/test')
      expect(canRead).toBe(true)
    })

    test('should remove permission rule', () => {
      permissionSystem.removeRule('/home/fr4iser')
      
      const filePerms = permissionSystem.getFilePermissions('/home/fr4iser')
      expect(filePerms).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    test('should handle empty path', () => {
      const result = permissionSystem.validateAccess('fr4iser', '', 'read')
      expect(result.allowed).toBe(false)
    })

    test('should handle root path', () => {
      const result = permissionSystem.validateAccess('root', '/', 'read')
      expect(result.allowed).toBe(true)
    })

    test('should handle nested paths', () => {
      const result = permissionSystem.validateAccess('fr4iser', '/home/fr4iser/Documents/file.txt', 'read')
      expect(result.allowed).toBe(true)
    })
  })
})

describe('Permission System Integration', () => {
  test('should work with real-world scenarios', () => {
    const system = new PermissionSystem(mockConfig)
    
    // Scenario 1: Regular user trying to access their home directory
    expect(system.canRead('fr4iser', '/home/fr4iser')).toBe(true)
    expect(system.canWrite('fr4iser', '/home/fr4iser')).toBe(true)
    expect(system.canExecute('fr4iser', '/home/fr4iser')).toBe(true)
    
    // Scenario 2: Regular user trying to access system files
    expect(system.canRead('fr4iser', '/etc/passwd')).toBe(false)
    expect(system.canWrite('fr4iser', '/etc/passwd')).toBe(false)
    
    // Scenario 3: Root user accessing any file
    expect(system.canRead('root', '/etc/passwd')).toBe(true)
    expect(system.canWrite('root', '/etc/passwd')).toBe(true)
    
    // Scenario 4: Regular user accessing temporary directory
    expect(system.canRead('fr4iser', '/tmp')).toBe(true)
    expect(system.canWrite('fr4iser', '/tmp')).toBe(true)
  })
})
