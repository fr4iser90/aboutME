/**
 * Puzzle Files System Type Definitions
 * 
 * This file contains all type definitions for the puzzle files system,
 * including puzzle content structures, hidden file management, and flag systems.
 */

export interface TerminalCredentials {
  hostname: string
  username: string
  password: string
  password_hint: string
  root_username: string
  root_password: string
  root_password_hint: string
}

export interface PuzzleFlag {
  id: string
  content: string
  location: string
  difficulty: 'easy' | 'medium' | 'hard'
  hints: string[]
  dependencies?: string[]
}

export interface PuzzleHint {
  id: string
  content: string
  location: string
  type: 'text' | 'binary' | 'encoded' | 'hidden'
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface PuzzleFile {
  name: string
  path: string
  type: 'text' | 'binary' | 'config' | 'credential' | 'flag' | 'hint' | 'suid'
  content: string
  hidden: boolean
  permissions: string
  owner: string
  group: string
  flags?: PuzzleFlag[]
  hints?: PuzzleHint[]
  metadata?: {
    size: number
    modified: string
    created: string
  }
}

export interface HiddenFileSystem {
  files: Map<string, PuzzleFile>
  directories: Map<string, string[]>
  hiddenPaths: Set<string>
}

export interface PuzzleContentGenerator {
  generateFileContent(fileName: string, fullPath: string, credentials: TerminalCredentials): string
  generateBinaryContent(type: string): string
  generateFlagContent(flag: PuzzleFlag, credentials: TerminalCredentials): string
  generateHintContent(hint: PuzzleHint, credentials: TerminalCredentials): string
  generateCredentialContent(credentials: TerminalCredentials): string
}

export interface PuzzleFileTemplate {
  name: string
  type: 'text' | 'binary' | 'config' | 'credential' | 'flag' | 'hint' | 'suid'
  template: string
  variables: string[]
  hidden: boolean
  permissions: string
  owner: string
  group: string
}

export interface PuzzleSystemConfig {
  flags: PuzzleFlag[]
  hints: PuzzleHint[]
  templates: PuzzleFileTemplate[]
  hiddenFiles: string[]
  binaryTypes: string[]
  credentialFiles: string[]
  suidBinaries: string[]
}

export interface PuzzleGenerationResult {
  success: boolean
  content?: string
  error?: string
  metadata?: {
    type: string
    size: number
    hidden: boolean
  }
}
