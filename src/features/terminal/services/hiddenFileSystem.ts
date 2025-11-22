/**
 * Hidden File System
 * 
 * This file contains the hidden file management system for the puzzle files.
 * It handles hidden file detection, hidden directory support, and hidden file discovery mechanics.
 */

import { 
  PuzzleFile, 
  HiddenFileSystem, 
  TerminalCredentials,
  PuzzleFileTemplate 
} from '@/features/shared/types/puzzle'
import { PuzzleContentGenerator } from './puzzleContentGenerator'
import { config } from '@/features/shared/services/config'

export class HiddenFileSystemManager {
  private hiddenFiles: Map<string, PuzzleFile> = new Map()
  private hiddenDirectories: Map<string, string[]> = new Map()
  private hiddenPaths: Set<string> = new Set()
  private puzzleGenerator: PuzzleContentGenerator
  private terminalCredentials: TerminalCredentials | null = null

  constructor() {
    this.puzzleGenerator = new PuzzleContentGenerator()
  }

  /**
   * Initialize hidden file system with terminal credentials
   */
  async initialize(credentials: TerminalCredentials): Promise<void> {
    this.terminalCredentials = credentials
    await this.loadHiddenFiles()
  }

  /**
   * Load hidden files from puzzle configuration
   */
  private async loadHiddenFiles(): Promise<void> {
    try {
      const response = await fetch(config.api.puzzleFiles)
      const puzzleConfig = await response.json()
      
      // Initialize hidden files
      puzzleConfig.hiddenFiles.forEach((fileName: string) => {
        this.addHiddenFile(fileName)
      })

      // Initialize hidden directories
      this.initializeHiddenDirectories()
      
    } catch (error) {
      console.warn('Could not load hidden files configuration:', error)
    }
  }

  /**
   * Add hidden file to the system
   */
  private addHiddenFile(fileName: string): void {
    if (!this.terminalCredentials) return

    const template = this.puzzleGenerator.getPuzzleTemplate(fileName)
    if (template) {
      const content = this.puzzleGenerator.generateFileContent(fileName, '', this.terminalCredentials)
      
      const puzzleFile: PuzzleFile = {
        name: fileName,
        path: `/${fileName}`,
        type: template.type,
        content: content,
        hidden: template.hidden,
        permissions: template.permissions,
        owner: template.owner.replace('{username}', this.terminalCredentials.username),
        group: template.group.replace('{username}', this.terminalCredentials.username),
        metadata: {
          size: content.length,
          modified: new Date().toISOString(),
          created: new Date().toISOString()
        }
      }

      this.hiddenFiles.set(fileName, puzzleFile)
      this.hiddenPaths.add(fileName)
    }
  }

  /**
   * Initialize hidden directories
   */
  private initializeHiddenDirectories(): void {
    // Common hidden directories
    const hiddenDirs = [
      '.ssh',
      '.config',
      '.cache',
      '.local',
      '.gnupg',
      '.ssh/authorized_keys',
      '.ssh/config'
    ]

    hiddenDirs.forEach(dir => {
      this.hiddenDirectories.set(dir, [])
      this.hiddenPaths.add(dir)
    })
  }

  /**
   * Check if file is hidden
   */
  isHidden(fileName: string): boolean {
    return this.hiddenPaths.has(fileName) || fileName.startsWith('.')
  }

  /**
   * Check if directory is hidden
   */
  isHiddenDirectory(dirName: string): boolean {
    return this.hiddenDirectories.has(dirName) || dirName.startsWith('.')
  }

  /**
   * Get hidden file content
   */
  getHiddenFileContent(fileName: string): string | null {
    const file = this.hiddenFiles.get(fileName)
    return file ? file.content : null
  }

  /**
   * Get hidden file metadata
   */
  getHiddenFileMetadata(fileName: string): PuzzleFile | null {
    return this.hiddenFiles.get(fileName) || null
  }

  /**
   * List hidden files in directory
   */
  listHiddenFiles(directory: string): string[] {
    const files: string[] = []
    
    // Add files from hidden files map
    this.hiddenFiles.forEach((file, fileName) => {
      if (file.path.startsWith(directory)) {
        files.push(fileName)
      }
    })

    // Add files from hidden directories
    this.hiddenDirectories.forEach((dirFiles, dirName) => {
      if (dirName.startsWith(directory)) {
        files.push(...dirFiles)
      }
    })

    return files
  }

  /**
   * Get all hidden files
   */
  getAllHiddenFiles(): PuzzleFile[] {
    return Array.from(this.hiddenFiles.values())
  }

  /**
   * Get hidden files by type
   */
  getHiddenFilesByType(type: string): PuzzleFile[] {
    return Array.from(this.hiddenFiles.values()).filter(file => file.type === type)
  }

  /**
   * Check if path contains hidden files
   */
  hasHiddenFiles(path: string): boolean {
    return Array.from(this.hiddenFiles.keys()).some(fileName => 
      fileName.startsWith(path)
    )
  }

  /**
   * Discover hidden files in directory
   */
  discoverHiddenFiles(directory: string): string[] {
    const discovered: string[] = []
    
    // Check for common hidden files
    const commonHiddenFiles = [
      '.bashrc',
      '.zshrc',
      '.gitconfig',
      '.vimrc',
      '.ssh/id_rsa',
      '.ssh/id_rsa.pub',
      '.ssh/known_hosts',
      '.ssh/config'
    ]

    commonHiddenFiles.forEach(fileName => {
      if (fileName.startsWith(directory) || directory === '/') {
        discovered.push(fileName)
      }
    })

    return discovered
  }

  /**
   * Generate hidden file content dynamically
   */
  generateHiddenFileContent(fileName: string, fullPath: string): string {
    if (!this.terminalCredentials) return ''

    // Check if it's a known hidden file
    const template = this.puzzleGenerator.getPuzzleTemplate(fileName)
    if (template) {
      return this.puzzleGenerator.generateFileContent(fileName, fullPath, this.terminalCredentials)
    }

    // Generate default hidden file content
    return this.generateDefaultHiddenContent(fileName, fullPath)
  }

  /**
   * Generate default hidden file content
   */
  private generateDefaultHiddenContent(fileName: string, fullPath: string): string {
    if (!this.terminalCredentials) return ''

    const ext = fileName.split('.').pop()?.toLowerCase()
    
    switch (ext) {
      case 'rc':
        return `# ${fileName} configuration file\n# Generated for ${this.terminalCredentials.username}`
      case 'config':
        return `# ${fileName} configuration\n# User: ${this.terminalCredentials.username}\n# Host: ${this.terminalCredentials.hostname}`
      case 'pub':
        return `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC1234567890abcdef... ${this.terminalCredentials.username}@${this.terminalCredentials.hostname}`
      default:
        return `# ${fileName}\n# Hidden file for ${this.terminalCredentials.username}`
    }
  }

  /**
   * Get hidden file permissions
   */
  getHiddenFilePermissions(fileName: string): string {
    const file = this.hiddenFiles.get(fileName)
    return file ? file.permissions : '-rw-r--r--'
  }

  /**
   * Get hidden file owner
   */
  getHiddenFileOwner(fileName: string): string {
    const file = this.hiddenFiles.get(fileName)
    return file ? file.owner : 'root'
  }

  /**
   * Get hidden file group
   */
  getHiddenFileGroup(fileName: string): string {
    const file = this.hiddenFiles.get(fileName)
    return file ? file.group : 'root'
  }

  /**
   * Check if file should be shown in ls output
   */
  shouldShowInLs(fileName: string, showHidden: boolean): boolean {
    if (showHidden) return true
    return !this.isHidden(fileName)
  }

  /**
   * Get hidden file discovery hints
   */
  getDiscoveryHints(): string[] {
    return [
      'Use ls -a to show hidden files',
      'Hidden files start with a dot (.)',
      'Check common hidden directories like .ssh, .config',
      'Some hidden files contain important information',
      'Use find command to search for hidden files'
    ]
  }

  /**
   * Clear hidden file system
   */
  clear(): void {
    this.hiddenFiles.clear()
    this.hiddenDirectories.clear()
    this.hiddenPaths.clear()
  }

  /**
   * Get hidden file system statistics
   */
  getStatistics(): {
    totalHiddenFiles: number
    totalHiddenDirectories: number
    hiddenFileTypes: { [key: string]: number }
  } {
    const hiddenFileTypes: { [key: string]: number } = {}
    
    this.hiddenFiles.forEach(file => {
      hiddenFileTypes[file.type] = (hiddenFileTypes[file.type] || 0) + 1
    })

    return {
      totalHiddenFiles: this.hiddenFiles.size,
      totalHiddenDirectories: this.hiddenDirectories.size,
      hiddenFileTypes
    }
  }
}
