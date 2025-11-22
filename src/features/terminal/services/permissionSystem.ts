/**
 * Permission System Core Implementation
 * 
 * This file contains the main permission validation logic for the terminal filesystem.
 * It handles user permissions, file access control, and permission validation.
 */

import { 
  PermissionRule, 
  UserPermissions, 
  PermissionConfig, 
  PermissionCheckResult, 
  PermissionError, 
  PermissionOperation,
  PermissionSystemInterface,
  FilePermissions,
  Permission
} from '@/features/shared/types/permissions'
import { config as appConfig } from '@/features/shared/services/config'

export class PermissionSystem implements PermissionSystemInterface {
  private rules: PermissionRule[]
  private users: Map<string, UserPermissions>
  private permissionCache: Map<string, boolean>

  constructor(config: PermissionConfig) {
    this.rules = config.rules || []
    this.users = new Map()
    this.permissionCache = new Map()
    
    // Initialize user permissions
    Object.entries(config.users || {}).forEach(([userId, userPerms]) => {
      this.users.set(userId, userPerms)
    })
  }

  /**
   * Check if user can read from the specified path
   */
  canRead(user: string, path: string): boolean {
    const cacheKey = `read:${user}:${path}`
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!
    }

    const result = this.validateAccess(user, path, 'read')
    this.permissionCache.set(cacheKey, result.allowed)
    return result.allowed
  }

  /**
   * Check if user can write to the specified path
   */
  canWrite(user: string, path: string): boolean {
    const cacheKey = `write:${user}:${path}`
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!
    }

    const result = this.validateAccess(user, path, 'write')
    this.permissionCache.set(cacheKey, result.allowed)
    return result.allowed
  }

  /**
   * Check if user can execute the specified path
   */
  canExecute(user: string, path: string): boolean {
    const cacheKey = `execute:${user}:${path}`
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!
    }

    const result = this.validateAccess(user, path, 'execute')
    this.permissionCache.set(cacheKey, result.allowed)
    return result.allowed
  }

  /**
   * Main validation method for all permission checks
   */
  validateAccess(user: string, path: string, operation: PermissionOperation): PermissionCheckResult {
    // Root user can access everything
    if (user === 'root') {
      return { allowed: true }
    }

    // Check if user exists
    const userPerms = this.getUserPermissions(user)
    if (!userPerms) {
      return {
        allowed: false,
        reason: 'User not found',
        error: this.createPermissionError(operation, path, user, 'User not found')
      }
    }

    // Skip path traversal check - it's too restrictive for this use case
    // Users should be able to access their allowed paths directly

    // Check user-specific permissions
    const userHasPermission = this.checkUserPermissions(userPerms, path, operation)
    if (userHasPermission) {
      return { allowed: true }
    }

    // Check file permissions
    const filePerms = this.getFilePermissions(path)
    if (filePerms) {
      const fileAccess = this.checkFilePermissions(userPerms, filePerms, operation, path)
      if (fileAccess.allowed) {
        return { allowed: true }
      }
      return fileAccess
    }

    // Default deny
    return {
      allowed: false,
      reason: 'Permission denied',
      error: this.createPermissionError(operation, path, user, 'Permission denied')
    }
  }

  /**
   * Get user permissions by user ID
   */
  getUserPermissions(user: string): UserPermissions | null {
    return this.users.get(user) || null
  }

  /**
   * Get file permissions for a specific path
   */
  getFilePermissions(path: string): FilePermissions | null {
    // Find the most specific rule for this path
    const rule = this.findMatchingRule(path)
    if (rule) {
      return rule.permissions
    }
    return null
  }

  /**
   * Check if path traversal is allowed for the user
   */
  checkPathTraversal(user: string, path: string): boolean {
    const userPerms = this.getUserPermissions(user)
    if (!userPerms) return false

    // Root user can access everything
    if (user === 'root') return true

    // Check if user has permission to traverse to the path
    const pathParts = path.split('/').filter(part => part !== '')
    let currentPath = '/'

    for (const part of pathParts) {
      currentPath = this.joinPath(currentPath, part)
      
      // Check if user has execute permission on this directory
      if (!this.checkUserPermissions(userPerms, currentPath, 'execute')) {
        return false
      }
    }

    return true
  }

  /**
   * Check user-specific permissions
   */
  private checkUserPermissions(userPerms: UserPermissions, path: string, operation: PermissionOperation): boolean {
    const allowedPaths = userPerms.permissions[operation]
    return allowedPaths.some(allowedPath => this.pathMatches(path, allowedPath))
  }

  /**
   * Check file permissions based on user groups and file ownership
   */
  private checkFilePermissions(userPerms: UserPermissions, filePerms: FilePermissions, operation: PermissionOperation, path: string): PermissionCheckResult {
    // Find the rule for this path to get ownership info
    const rule = this.findMatchingRule(path)
    if (!rule) {
      return {
        allowed: false,
        reason: 'No permission rule found',
        error: this.createPermissionError(operation, path, userPerms.userId, 'No permission rule found')
      }
    }

    // Check owner permissions
    if (userPerms.userId === rule.owner) {
      const ownerPerm = filePerms.owner[operation]
      if (ownerPerm) {
        return { allowed: true }
      }
    }

    // Check group permissions
    if (userPerms.groups.includes(rule.group)) {
      const groupPerm = filePerms.group[operation]
      if (groupPerm) {
        return { allowed: true }
      }
    }

    // Check other permissions
    const otherPerm = filePerms.other[operation]
    if (otherPerm) {
      return { allowed: true }
    }

    return {
      allowed: false,
      reason: 'File permissions deny access',
      error: this.createPermissionError(operation, '', userPerms.userId, 'File permissions deny access')
    }
  }

  /**
   * Find the most specific matching rule for a path
   */
  private findMatchingRule(path: string): PermissionRule | null {
    let bestMatch: PermissionRule | null = null
    let bestMatchLength = 0

    for (const rule of this.rules) {
      if (this.pathMatches(path, rule.path)) {
        if (rule.path.length > bestMatchLength) {
          bestMatch = rule
          bestMatchLength = rule.path.length
        }
      }
    }

    return bestMatch
  }

  /**
   * Check if a path matches a pattern (supports wildcards)
   */
  private pathMatches(path: string, pattern: string): boolean {
    if (pattern === '*') return true
    if (pattern === path) return true
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1)
      return path.startsWith(prefix)
    }
    if (pattern.startsWith('*')) {
      const suffix = pattern.slice(1)
      return path.endsWith(suffix)
    }
    return false
  }

  /**
   * Join path segments
   */
  private joinPath(...segments: string[]): string {
    return segments.filter(segment => segment !== '').join('/')
  }

  /**
   * Create a permission error object
   */
  private createPermissionError(operation: string, path: string, user: string, reason: string): PermissionError {
    return {
      type: 'permission_denied',
      message: `${operation}: ${path}: Permission denied`,
      operation,
      path,
      user,
      suggestion: this.getSuggestion(operation, path, user)
    }
  }

  /**
   * Get helpful suggestion for permission errors
   */
  private getSuggestion(operation: string, path: string, user: string): string {
    if (user !== 'root') {
      return "Try using 'sudo' or check file permissions with 'ls -la'"
    }
    return "Check file permissions with 'ls -la'"
  }

  /**
   * Clear permission cache
   */
  clearCache(): void {
    this.permissionCache.clear()
  }

  /**
   * Add a new permission rule
   */
  addRule(rule: PermissionRule): void {
    this.rules.push(rule)
    this.clearCache()
  }

  /**
   * Remove a permission rule
   */
  removeRule(path: string): void {
    this.rules = this.rules.filter(rule => rule.path !== path)
    this.clearCache()
  }

  /**
   * Update user permissions
   */
  updateUserPermissions(userId: string, permissions: UserPermissions): void {
    this.users.set(userId, permissions)
    this.clearCache()
  }
}

/**
 * Create a permission system instance from configuration
 */
export const createPermissionSystem = async (): Promise<PermissionSystem> => {
  try {
    const response = await fetch(appConfig.api.permissionRules)
    const config: PermissionConfig = await response.json()
    return new PermissionSystem(config)
  } catch (error) {
    console.warn('Could not load permission configuration, using defaults:', error)
    return new PermissionSystem({
      users: {},
      rules: []
    })
  }
}

/**
 * Helper function to create permission error messages
 */
export const createPermissionErrorMessage = (error: PermissionError): string => {
  let message = error.message
  if (error.suggestion) {
    message += `\nHint: ${error.suggestion}`
  }
  return message
}
