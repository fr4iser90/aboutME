// Fake Filesystem Navigation Logic
import { PermissionSystem, createPermissionSystem } from './permissionSystem'
import { PermissionCheckResult, PermissionOperation } from '@/features/shared/types/permissions'
import { PuzzleContentGenerator } from './puzzleContentGenerator'
import { HiddenFileSystemManager } from './hiddenFileSystem'
import { TerminalCredentials } from '@/features/shared/types/puzzle'
import { config } from '@/features/shared/services/config'

export interface FileSystemNode {
  type: 'file' | 'directory'
  permissions: string
  owner: string
  group: string
  size: number
  modified: string
  content?: string
  contents?: { [key: string]: FileSystemNode }
}

export interface FileSystem {
  filesystem: {
    [path: string]: FileSystemNode
  }
  currentPath: string
  permissions: {
    [user: string]: {
      read: string[]
      write: string[]
      execute: string[]
    }
  }
}

export class FakeFileSystem {
  private osStructure: any
  private currentPath: string
  private currentUser: string
  private deletedFiles: Set<string>
  private permissionSystem: PermissionSystem | null
  private terminalCredentials: TerminalCredentials
  private puzzleGenerator: PuzzleContentGenerator
  private hiddenFileSystem: HiddenFileSystemManager

  constructor(currentUser: string = '', terminalCredentials: TerminalCredentials) {
    this.currentUser = currentUser
    this.currentPath = '/home/'
    this.osStructure = null
    this.deletedFiles = new Set()
    this.permissionSystem = null
    this.terminalCredentials = terminalCredentials
    this.puzzleGenerator = new PuzzleContentGenerator()
    this.hiddenFileSystem = new HiddenFileSystemManager()
    
    // Initialize hidden file system
    this.hiddenFileSystem.initialize(terminalCredentials)
  }

  // Load OS structure for file content
  async loadOsStructure() {
    if (!this.osStructure) {
      try {
        const response = await fetch(config.api.fakeOsStructure)
        this.osStructure = await response.json()
        
        // Set username from OS structure if not set
        if (!this.currentUser && this.osStructure.system?.username) {
          this.currentUser = this.osStructure.system.username
          this.currentPath = `/home/${this.currentUser}`
        }
      } catch (error) {
        console.warn('Could not load OS structure:', error)
        this.osStructure = { filesystem: {} }
      }
    }
  }

  // Initialize permission system
  async initializePermissionSystem() {
    if (!this.permissionSystem) {
      this.permissionSystem = await createPermissionSystem()
    }
  }

  // List files in current directory
  async listFiles(): Promise<string> {
    await this.loadOsStructure()
    
    const normalizedPath = this.normalizePath(this.currentPath)
    const pathParts = normalizedPath.split('/').filter(part => part !== '')
    
    if (!this.osStructure || !this.osStructure.filesystem) return ''
    
    let current = this.osStructure.filesystem
    
    // Navigate to current directory
    for (const part of pathParts) {
      if (!current || !current[part]) {
        return ''
      }
      current = current[part]
    }
    
    // Get all files and directories in current directory
    const files: string[] = []
    if (current && typeof current === 'object') {
      for (const [name, value] of Object.entries(current)) {
        if (typeof value === 'string' && value === 'file') {
          files.push(name)
        } else if (typeof value === 'object' && value !== null) {
          files.push(name)
        }
      }
    }
    
    return files.join('\n')
  }

  // Get current path
  getCurrentPath(): string {
    return this.currentPath
  }

  // Change directory
  async cd(path: string): Promise<{ success: boolean; error?: string }> {
    await this.loadOsStructure()
    
    if (!path || path === '') {
      this.currentPath = `/home/${this.terminalCredentials.username}`
      return { success: true }
    }

    const targetPath = this.resolvePath(path)
    
    if (!(await this.pathExists(targetPath))) {
      return { success: false, error: `cd: ${path}: No such file or directory` }
    }

    if (!(await this.isDirectory(targetPath))) {
      return { success: false, error: `cd: ${path}: Not a directory` }
    }

    this.currentPath = targetPath
    return { success: true }
  }

  // Set current path
  async setCurrentPath(path: string): Promise<boolean> {
    const normalizedPath = this.normalizePath(path)
    if (await this.pathExists(normalizedPath) && await this.isDirectory(normalizedPath)) {
      this.currentPath = normalizedPath
      return true
    }
    return false
  }


  // List directory contents
  async ls(path?: string, showHidden: boolean = false): Promise<{ success: boolean; files?: string[]; error?: string }> {
    await this.loadOsStructure()
    
    const targetPath = path ? this.resolvePath(path) : this.currentPath

    if (!(await this.pathExists(targetPath))) {
      return { success: false, error: `ls: ${path || '.'}: No such file or directory` }
    }

    if (!(await this.isDirectory(targetPath))) {
      return { success: false, error: `ls: ${path || '.'}: Not a directory` }
    }

    const normalizedPath = this.normalizePath(targetPath)
    const pathParts = normalizedPath.split('/').filter(part => part !== '')
    
    if (!this.osStructure || !this.osStructure.filesystem) {
      return { success: true, files: [] }
    }
    
    let current = this.osStructure.filesystem
    
    // Navigate to current directory
    for (const part of pathParts) {
      if (!current || !current[part]) {
        return { success: true, files: [] }
      }
      current = current[part]
    }
    
    // Get all files and directories in current directory
    let files: string[] = []
    if (current && typeof current === 'object') {
      files = Object.keys(current).filter(name => {
        const value = current[name]
        // Include directories and files
        const isValidFile = (typeof value === 'string' && value === 'file') || 
                           (typeof value === 'object' && value !== null)
        
        if (!isValidFile) return false
        
        // Check if this file/directory has been deleted
        const fullPath = this.joinPath(targetPath, name)
        if (this.getDeletedFiles().includes(fullPath)) {
          return false // Don't show deleted files
        }
        
        return true
      })
    }
    
    if (!showHidden) {
      files = files.filter(file => !file.startsWith('.'))
    }

    files.sort((a, b) => {
      const aIsDir = typeof current[a] === 'object' && current[a] !== null
      const bIsDir = typeof current[b] === 'object' && current[b] !== null
      
      if (aIsDir && !bIsDir) return -1
      if (!aIsDir && bIsDir) return 1
      return a.localeCompare(b)
    })

    // Add quotes around filenames with spaces (like Linux)
    const quotedFiles = files.map(file => {
      if (file.includes(' ')) {
        return `'${file}'`
      }
      return file
    })

    return { success: true, files: quotedFiles }
  }

  // List directory contents with details (ls -la)
  async lsLa(path?: string): Promise<{ success: boolean; entries?: Array<{name: string, details: string}>; error?: string }> {
    await this.loadOsStructure()
    
    const targetPath = path ? this.resolvePath(path) : this.currentPath

    if (!(await this.pathExists(targetPath))) {
      return { success: false, error: `ls: ${path || '.'}: No such file or directory` }
    }

    if (!(await this.isDirectory(targetPath))) {
      return { success: false, error: `ls: ${path || '.'}: Not a directory` }
    }

    const normalizedPath = this.normalizePath(targetPath)
    const pathParts = normalizedPath.split('/').filter(part => part !== '')
    
    if (!this.osStructure || !this.osStructure.filesystem) {
      return { success: true, entries: [] }
    }
    
    let current = this.osStructure.filesystem
    
    // Navigate to current directory
    for (const part of pathParts) {
      if (!current || !current[part]) {
        return { success: true, entries: [] }
      }
      current = current[part]
    }
    
    // Get all files and directories in current directory
    const entries = Object.entries(current)
      .filter(([name, value]) => {
        // Check if this file/directory has been deleted
        const fullPath = this.joinPath(targetPath, name)
        if (this.getDeletedFiles().includes(fullPath)) {
          return false // Don't show deleted files
        }
        return true
      })
      .map(([name, value]) => {
        const isDir = typeof value === 'object' && value !== null
        const permissions = isDir ? 'drwxr-xr-x' : '-rw-r--r--'
        const size = isDir ? 4096 : Math.floor(Math.random() * 10000) + 100
        const modified = new Date().toISOString()
        
        const details = `${permissions} ${this.currentUser.padEnd(8)} ${this.currentUser.padEnd(8)} ${size.toString().padStart(8)} ${this.formatDate(modified)} ${name}`
        return { name, details }
      })

    entries.sort((a, b) => {
      const aIsDir = typeof current[a.name] === 'object' && current[a.name] !== null
      const bIsDir = typeof current[b.name] === 'object' && current[b.name] !== null
      
      if (aIsDir && !bIsDir) return -1
      if (!aIsDir && bIsDir) return 1
      return a.name.localeCompare(b.name)
    })

    // Add quotes around filenames with spaces in ls -la output
    const quotedEntries = entries.map(entry => {
      if (entry.name.includes(' ')) {
        return {
          name: `'${entry.name}'`,
          details: entry.details.replace(entry.name, `'${entry.name}'`)
        }
      }
      return entry
    })

    return { success: true, entries: quotedEntries }
  }

  // Read file content from OS structure
  async cat(path: string): Promise<{ success: boolean; content?: string; error?: string }> {
    await this.loadOsStructure()
    
    // Remove quotes from path if present
    const cleanPath = path.replace(/^['"]|['"]$/g, '')
    const targetPath = this.resolvePath(cleanPath)
    const fileName = cleanPath.split('/').pop() || cleanPath

    // Check if file exists in OS structure
    if (!(await this.fileExistsInOsStructure(targetPath))) {
      return { success: false, error: `cat: ${cleanPath}: No such file or directory` }
    }

    // Check if file has been deleted
    if (this.getDeletedFiles().includes(targetPath)) {
      return { success: false, error: `cat: ${cleanPath}: No such file or directory` }
    }

    // Generate realistic content based on file name
    const content = this.generateFileContent(fileName, targetPath)
    return { success: true, content }
  }

  // Check if file exists in OS structure
  private async fileExistsInOsStructure(fullPath: string): Promise<boolean> {
    await this.loadOsStructure()
    
    if (!this.osStructure || !this.osStructure.filesystem) return false
    
    const normalizedPath = this.normalizePath(fullPath)
    const pathParts = normalizedPath.split('/').filter(part => part !== '')
    
    let current = this.osStructure.filesystem
    
    // Navigate to the file's parent directory
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current || !current[pathParts[i]]) {
        return false
      }
      current = current[pathParts[i]]
    }
    
    // Check if the file exists in the parent directory
    const fileName = pathParts[pathParts.length - 1]
    return current && current[fileName] === 'file'
  }

  // Generate realistic file content based on file name
  private generateFileContent(fileName: string, fullPath: string): string {
    // Use puzzle content generator for all file content
    return this.puzzleGenerator.generateFileContent(fileName, fullPath, this.terminalCredentials)
  }

  // Check if path exists
  async pathExists(path: string): Promise<boolean> {
    const node = await this.getNode(path)
    if (node === null) return false
    
    // Check if path has been deleted
    const normalizedPath = this.normalizePath(path)
    if (this.getDeletedFiles().includes(normalizedPath)) {
      return false
    }
    
    return true
  }

  // Check if path is a directory
  async isDirectory(path: string): Promise<boolean> {
    const node = await this.getNode(path)
    if (!node) return false
    
    // Check if path has been deleted
    const normalizedPath = this.normalizePath(path)
    if (this.getDeletedFiles().includes(normalizedPath)) {
      return false
    }
    
    return node.type === 'directory'
  }

  // Check if path is a file
  async isFile(path: string): Promise<boolean> {
    const node = await this.getNode(path)
    if (!node) return false
    
    // Check if path has been deleted
    const normalizedPath = this.normalizePath(path)
    if (this.getDeletedFiles().includes(normalizedPath)) {
      return false
    }
    
    return node.type === 'file'
  }

  // Get filesystem node from OS structure
  private async getNode(path: string): Promise<FileSystemNode | null> {
    await this.loadOsStructure()
    
    const normalizedPath = this.normalizePath(path)
    const pathParts = normalizedPath.split('/').filter(part => part !== '')
    
    if (!this.osStructure || !this.osStructure.filesystem) return null
    
    // Search through the OS structure
    let current = this.osStructure.filesystem
    
    for (const part of pathParts) {
      if (!current || !current[part]) {
        return null
      }
      current = current[part]
    }

    // Convert OS structure format to FileSystemNode format
    if (typeof current === 'string' && current === 'file') {
      return {
        type: 'file',
        permissions: '-rw-r--r--',
        owner: this.currentUser,
        group: this.currentUser,
        size: 1024,
        modified: new Date().toISOString(),
        content: ''
      }
    } else if (typeof current === 'object' && current !== null) {
      return {
        type: 'directory',
        permissions: 'drwxr-xr-x',
        owner: this.currentUser,
        group: this.currentUser,
        size: 4096,
        modified: new Date().toISOString(),
        contents: {}
      }
    }

    return null
  }

  // Resolve relative path to absolute path
  private resolvePath(path: string): string {
    if (path.startsWith('/')) {
      return this.normalizePath(path)
    }
    return this.normalizePath(this.joinPath(this.currentPath, path))
  }

  // Join path segments
  private joinPath(...segments: string[]): string {
    return segments.filter(segment => segment !== '').join('/')
  }

  // Normalize path (remove double slashes, resolve . and ..)
  private normalizePath(path: string): string {
    if (!path || path === '') return '/'
    
    const parts = path.split('/').filter(part => part !== '')
    const result: string[] = []

    for (const part of parts) {
      if (part === '.') {
        continue
      } else if (part === '..') {
        if (result.length > 0) {
          result.pop()
        }
      } else {
        result.push(part)
      }
    }

    return '/' + result.join('/')
  }

  // Format date for ls -la
  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 365) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  // Set current user
  setUser(user: string): void {
    this.currentUser = user
  }

  // Set terminal credentials
  setTerminalCredentials(credentials: TerminalCredentials): void {
    this.terminalCredentials = credentials
  }

  // Get current user
  getCurrentUser(): string {
    return this.currentUser
  }

  // Get deleted files (for cache integration)
  getDeletedFiles(): string[] {
    return Array.from(this.deletedFiles)
  }

  // Set deleted files (for cache restoration)
  setDeletedFiles(deletedFiles: string[]): void {
    this.deletedFiles = new Set(deletedFiles)
  }

  // Clear deleted files (for testing/reset)
  clearDeletedFiles(): void {
    this.setDeletedFiles([])
  }

  // Remove files or directories
  async rm(path: string, recursive: boolean = false, force: boolean = false): Promise<{ success: boolean; error?: string }> {
    await this.loadOsStructure()
    
    // Remove quotes from path if present
    const cleanPath = path.replace(/^['"]|['"]$/g, '')
    const targetPath = this.resolvePath(cleanPath)
    
    // Check if path exists
    if (!(await this.pathExists(targetPath))) {
      if (force) {
        return { success: true } // Silently succeed if force is used
      }
      return { success: false, error: `rm: ${cleanPath}: No such file or directory` }
    }

    // Check if it's a directory
    const isDir = await this.isDirectory(targetPath)
    
    if (isDir && !recursive) {
      return { success: false, error: `rm: ${cleanPath}: is a directory` }
    }

    // For directories, check if they're empty (unless recursive)
    if (isDir && recursive) {
      const lsResult = await this.ls(targetPath)
      if (lsResult.success && lsResult.files && lsResult.files.length > 0) {
        // Directory is not empty, but we're doing recursive delete
        // This is allowed with -r flag
      }
    }

    // Actually remove the file/directory from the fake filesystem structure
    const success = await this.removeFromStructure(targetPath, recursive)
    
    if (success) {
      // Add to deleted files set for tracking
      const currentDeleted = this.getDeletedFiles()
      currentDeleted.push(targetPath)
      this.setDeletedFiles(currentDeleted)
      console.log(`rm: ${recursive ? 'recursively ' : ''}removed ${targetPath}`)
      return { success: true }
    } else {
      return { success: false, error: `rm: ${cleanPath}: failed to remove` }
    }
  }

  // Remove file/directory from the fake filesystem structure
  private async removeFromStructure(targetPath: string, recursive: boolean): Promise<boolean> {
    await this.loadOsStructure()
    
    if (!this.osStructure || !this.osStructure.filesystem) {
      return false
    }
    
    const normalizedPath = this.normalizePath(targetPath)
    const pathParts = normalizedPath.split('/').filter(part => part !== '')
    
    // Navigate to the parent directory
    let current = this.osStructure.filesystem
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current || !current[pathParts[i]]) {
        return false
      }
      current = current[pathParts[i]]
    }
    
    // Get the file/directory name to remove
    const fileName = pathParts[pathParts.length - 1]
    
    if (!current || !current[fileName]) {
      return false
    }
    
    // Check if it's a directory and if recursive is needed
    if (typeof current[fileName] === 'object' && current[fileName] !== null) {
      // It's a directory
      if (!recursive) {
        return false // Can't remove directory without -r
      }
      
      // For recursive removal, we need to remove all contents
      // For simplicity, we'll just remove the directory entry
      // In a real implementation, we'd recursively remove all contents
    }
    
    // Remove the file/directory from the structure
    delete current[fileName]
    
    return true
  }

  // Remove multiple files/directories
  async rmMultiple(paths: string[], recursive: boolean = false, force: boolean = false): Promise<{ success: boolean; errors?: string[] }> {
    const errors: string[] = []
    
    for (const path of paths) {
      const result = await this.rm(path, recursive, force)
      if (!result.success && result.error) {
        errors.push(result.error)
      }
    }
    
    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    }
  }

  // Permission validation methods
  /**
   * Check if user has permission for the specified operation on the path
   */
  async hasPermission(user: string, path: string, operation: PermissionOperation): Promise<boolean> {
    await this.initializePermissionSystem()
    if (!this.permissionSystem) return true // Allow if permission system not available
    
    return this.permissionSystem.validateAccess(user, path, operation).allowed
  }

  /**
   * Check access with detailed result information
   */
  async checkAccess(user: string, path: string, operation: PermissionOperation): Promise<PermissionCheckResult> {
    await this.initializePermissionSystem()
    if (!this.permissionSystem) {
      return { allowed: true } // Allow if permission system not available
    }
    
    return this.permissionSystem.validateAccess(user, path, operation)
  }

  /**
   * Get permission error message for display
   */
  async getPermissionError(user: string, path: string, operation: PermissionOperation): Promise<string> {
    const result = await this.checkAccess(user, path, operation)
    if (result.allowed) return ''
    
    if (result.error) {
      return result.error.message + (result.error.suggestion ? `\nHint: ${result.error.suggestion}` : '')
    }
    
    return `${operation}: ${path}: Permission denied`
  }

  /**
   * Validate command access before execution
   */
  async validateCommandAccess(user: string, command: string, path: string): Promise<{ allowed: boolean; errorMessage?: string }> {
    await this.initializePermissionSystem()
    if (!this.permissionSystem) {
      return { allowed: true } // Allow if permission system not available
    }

    // Determine operation based on command
    let operation: PermissionOperation = 'read'
    if (command.startsWith('rm') || command.startsWith('mv') || command.startsWith('cp')) {
      operation = 'write'
    } else if (command.startsWith('cd') || command.startsWith('./')) {
      operation = 'execute'
    }

    const result = await this.checkAccess(user, path, operation)
    if (result.allowed) {
      return { allowed: true }
    }

    const errorMessage = await this.getPermissionError(user, path, operation)
    return { allowed: false, errorMessage }
  }

  /**
   * Clear permission cache (useful when user switches)
   */
  clearPermissionCache() {
    if (this.permissionSystem) {
      this.permissionSystem.clearCache()
    }
  }
}

