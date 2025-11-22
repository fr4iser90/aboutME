/**
 * Permission System Type Definitions
 * 
 * This file contains all type definitions for the terminal permission system,
 * including permission structures, user permissions, and validation interfaces.
 */

export interface Permission {
  read: boolean
  write: boolean
  execute: boolean
}

export interface FilePermissions {
  owner: Permission
  group: Permission
  other: Permission
}

export interface UserPermissions {
  userId: string
  groups: string[]
  permissions: {
    read: string[]
    write: string[]
    execute: string[]
  }
}

export interface PermissionRule {
  path: string
  owner: string
  group: string
  permissions: FilePermissions
  specialPermissions?: {
    setuid?: boolean
    setgid?: boolean
    sticky?: boolean
  }
}

export interface PermissionError {
  type: 'permission_denied' | 'access_denied' | 'insufficient_privileges'
  message: string
  operation: string
  path: string
  user: string
  suggestion?: string
}

export interface PermissionConfig {
  users: { [userId: string]: UserPermissions }
  rules: PermissionRule[]
}

export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
  error?: PermissionError
}

export interface CommandPermissionContext {
  user: string
  command: string
  path: string
  operation: 'read' | 'write' | 'execute'
}

export type PermissionOperation = 'read' | 'write' | 'execute'

export interface PermissionSystemInterface {
  canRead(user: string, path: string): boolean
  canWrite(user: string, path: string): boolean
  canExecute(user: string, path: string): boolean
  validateAccess(user: string, path: string, operation: PermissionOperation): PermissionCheckResult
  getUserPermissions(user: string): UserPermissions | null
  getFilePermissions(path: string): FilePermissions | null
  checkPathTraversal(user: string, path: string): boolean
}
