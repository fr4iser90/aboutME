/**
 * Permission Helper Functions
 * 
 * This file contains helper functions for permission operations,
 * error handling, and debugging utilities for the permission system.
 */

import { PermissionError, PermissionCheckResult, PermissionOperation } from '@/features/shared/types/permissions'

/**
 * Create a permission error message for display
 */
export const createPermissionErrorMessage = (error: PermissionError): string => {
  let message = error.message
  if (error.suggestion) {
    message += `\nHint: ${error.suggestion}`
  }
  return message
}

/**
 * Format permission check result for display
 */
export const formatPermissionResult = (result: PermissionCheckResult): string => {
  if (result.allowed) {
    return ''
  }
  
  if (result.error) {
    return createPermissionErrorMessage(result.error)
  }
  
  return result.reason || 'Permission denied'
}

/**
 * Debug permissions for a user and path
 */
export const debugPermissions = (
  permissionSystem: any,
  user: string,
  path: string
): string => {
  const userPerms = permissionSystem.getUserPermissions(user)
  const filePerms = permissionSystem.getFilePermissions(path)
  const canRead = permissionSystem.canRead(user, path)
  const canWrite = permissionSystem.canWrite(user, path)
  const canExecute = permissionSystem.canExecute(user, path)
  
  return `
Permission Debug for ${user} on ${path}:
User Groups: ${userPerms?.groups?.join(', ') || 'None'}
File Owner: ${filePerms?.owner || 'Unknown'}
File Group: ${filePerms?.group || 'Unknown'}
File Permissions: ${JSON.stringify(filePerms?.permissions || {})}
Can Read: ${canRead}
Can Write: ${canWrite}
Can Execute: ${canExecute}
  `.trim()
}

/**
 * Validate permission configuration
 */
export const validatePermissionConfig = (config: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!config.users) {
    errors.push('Missing users configuration')
  }
  
  if (!config.rules) {
    errors.push('Missing rules configuration')
  }
  
  if (config.users) {
    Object.entries(config.users).forEach(([userId, userPerms]: [string, any]) => {
      if (!userPerms.groups || !Array.isArray(userPerms.groups)) {
        errors.push(`User ${userId}: missing or invalid groups`)
      }
      
      if (!userPerms.permissions) {
        errors.push(`User ${userId}: missing permissions`)
      } else {
        const requiredOps = ['read', 'write', 'execute']
        requiredOps.forEach(op => {
          if (!userPerms.permissions[op] || !Array.isArray(userPerms.permissions[op])) {
            errors.push(`User ${userId}: missing or invalid ${op} permissions`)
          }
        })
      }
    })
  }
  
  if (config.rules) {
    config.rules.forEach((rule: any, index: number) => {
      if (!rule.path) {
        errors.push(`Rule ${index}: missing path`)
      }
      
      if (!rule.owner) {
        errors.push(`Rule ${index}: missing owner`)
      }
      
      if (!rule.group) {
        errors.push(`Rule ${index}: missing group`)
      }
      
      if (!rule.permissions) {
        errors.push(`Rule ${index}: missing permissions`)
      } else {
        const requiredPerms = ['owner', 'group', 'other']
        requiredPerms.forEach(perm => {
          if (!rule.permissions[perm]) {
            errors.push(`Rule ${index}: missing ${perm} permissions`)
          } else {
            const requiredOps = ['read', 'write', 'execute']
            requiredOps.forEach(op => {
              if (typeof rule.permissions[perm][op] !== 'boolean') {
                errors.push(`Rule ${index}: invalid ${perm}.${op} permission`)
              }
            })
          }
        })
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get operation type from command
 */
export const getOperationFromCommand = (command: string): PermissionOperation => {
  const cmd = command.trim().toLowerCase().split(' ')[0]
  
  if (cmd.startsWith('rm') || cmd.startsWith('mv') || cmd.startsWith('cp') || cmd.startsWith('mkdir') || cmd.startsWith('touch')) {
    return 'write'
  } else if (cmd.startsWith('cd') || cmd.startsWith('./') || cmd.startsWith('chmod') || cmd.startsWith('chown')) {
    return 'execute'
  } else {
    return 'read'
  }
}

/**
 * Check if command requires special permissions
 */
export const requiresSpecialPermissions = (command: string): boolean => {
  const specialCommands = ['su', 'sudo', 'chmod', 'chown', 'passwd']
  const cmd = command.trim().toLowerCase().split(' ')[0]
  return specialCommands.includes(cmd)
}

/**
 * Get helpful suggestion for permission errors
 */
export const getPermissionSuggestion = (operation: string, path: string, user: string): string => {
  if (user !== 'root') {
    if (operation === 'read') {
      return "Try using 'sudo' or check file permissions with 'ls -la'"
    } else if (operation === 'write') {
      return "Try using 'sudo' or check if you own the file with 'ls -la'"
    } else if (operation === 'execute') {
      return "Try using 'sudo' or check directory permissions with 'ls -la'"
    }
  }
  return "Check file permissions with 'ls -la'"
}

/**
 * Log permission check for debugging
 */
export const logPermissionCheck = (
  user: string,
  operation: string,
  path: string,
  result: boolean,
  reason?: string
): void => {
  console.log(`Permission Check: ${user} ${operation} ${path} = ${result}${reason ? ` (${reason})` : ''}`)
}

/**
 * Create a permission error object
 */
export const createPermissionError = (
  operation: string,
  path: string,
  user: string,
  reason: string
): PermissionError => {
  return {
    type: 'permission_denied',
    message: `${operation}: ${path}: Permission denied`,
    operation,
    path,
    user,
    suggestion: getPermissionSuggestion(operation, path, user)
  }
}

/**
 * Check if path is safe for permission validation
 */
export const isSafePath = (path: string): boolean => {
  // Prevent directory traversal attacks
  if (path.includes('..') || path.includes('//')) {
    return false
  }
  
  // Prevent null bytes
  if (path.includes('\0')) {
    return false
  }
  
  return true
}

/**
 * Normalize path for permission checking
 */
export const normalizePathForPermission = (path: string): string => {
  // Remove leading/trailing whitespace
  let normalized = path.trim()
  
  // Ensure path starts with /
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }
  
  // Remove double slashes
  normalized = normalized.replace(/\/+/g, '/')
  
  return normalized
}
