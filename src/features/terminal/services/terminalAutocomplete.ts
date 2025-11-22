// Terminal Autocomplete System
// Provides Tab completion for commands and file paths

import { FakeFileSystem } from './fakeFilesystem'
import { TerminalCommands } from './terminalCommands'
import { getAllCommandNames } from './commandRegistry'

export interface AutocompleteResult {
  suggestions: string[]
  isComplete: boolean
  commonPrefix?: string
}

export interface AutocompleteContext {
  filesystem: FakeFileSystem
  terminalCommands: TerminalCommands | null
  commandHistory: string[]
  currentPath: string
}

export class TerminalAutocomplete {
  private context: AutocompleteContext

  constructor(context: AutocompleteContext) {
    this.context = context
  }

  /**
   * Main autocomplete function - handles Tab key press
   * @param input Current command input
   * @param cursorPosition Current cursor position in input
   * @returns AutocompleteResult with suggestions and completion info
   */
  async handleTabCompletion(input: string, cursorPosition: number): Promise<AutocompleteResult> {
    console.log('🔍 handleTabCompletion called with:', { input, cursorPosition })
    
    const trimmedInput = input.trim()
    
    // If input is empty, show available commands
    if (!trimmedInput) {
      console.log('📝 Empty input, showing all commands')
      return this.getCommandSuggestions('')
    }

    // Parse the input to determine what we're completing
    const parts = this.parseCommandInput(input, cursorPosition)
    console.log('🔍 Parsed input parts:', parts)
    
    // Check if we're completing the command itself (first word)
    if (parts.wordIndex === 0) {
      console.log('🎯 Completing command:', parts.currentWord)
      return this.getCommandSuggestions(parts.currentWord)
    }

    // Check if it's a command that needs path completion
    if (this.needsPathCompletion(parts.command)) {
      // Check if we're completing options/flags
      if (parts.currentWord.startsWith('-')) {
        console.log('🎯 Completing options for command:', parts.command, 'partial:', parts.currentWord)
        return this.getCommandOptions(parts.command, parts.currentWord)
      }
      console.log('🎯 Completing path for command:', parts.command, 'partial:', parts.currentWord)
      return this.getPathSuggestions(parts.currentWord, parts.command)
    }

    // For other commands, try to suggest based on command history
    console.log('🎯 Completing from history:', parts.currentWord)
    return this.getHistorySuggestions(parts.currentWord)
  }

  /**
   * Parse command input to extract command, arguments, and current word
   */
  private parseCommandInput(input: string, cursorPosition: number): {
    command: string
    currentWord: string
    wordIndex: number
    allWords: string[]
  } {
    // Split by spaces but preserve quoted strings
    const words = this.splitCommandLine(input.substring(0, cursorPosition))
    
    const command = words[0] || ''
    const currentWord = words[words.length - 1] || ''
    const wordIndex = words.length - 1

    return {
      command,
      currentWord,
      wordIndex,
      allWords: words
    }
  }

  /**
   * Split command line respecting quotes
   */
  private splitCommandLine(input: string): string[] {
    const words: string[] = []
    let current = ''
    let inQuotes = false
    let quoteChar = ''

    for (let i = 0; i < input.length; i++) {
      const char = input[i]

      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true
        quoteChar = char
        current += char
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false
        quoteChar = ''
        current += char
      } else if (char === ' ' && !inQuotes) {
        if (current.trim()) {
          words.push(current.trim())
          current = ''
        }
      } else {
        current += char
      }
    }

    if (current.trim()) {
      words.push(current.trim())
    }

    return words
  }

  /**
   * Get command suggestions based on available terminal commands
   */
  async getCommandSuggestions(partial: string): Promise<AutocompleteResult> {
    console.log('🎯 getCommandSuggestions called with:', partial)
    
    // Always include all commands, regardless of terminalCommands availability
    const availableCommands = this.context.terminalCommands ? Object.keys(this.context.terminalCommands.commands) : []
    const pathCompletionCommands = ['pwd', 'cd', 'ls', 'cat', 'whoami', 'su', 'logout', 'rm']
    const newCommands = getAllCommandNames()
    const allCommands = [...availableCommands, ...pathCompletionCommands, ...newCommands]

    console.log('📋 Available commands:', allCommands)

    // Filter commands that start with the partial string
    const suggestions = allCommands.filter(cmd => 
      cmd.toLowerCase().startsWith(partial.toLowerCase())
    )

    console.log('🔍 Filtered suggestions:', suggestions)

    // Remove duplicates and sort
    const uniqueSuggestions = Array.from(new Set(suggestions)).sort()

    console.log('✨ Unique suggestions:', uniqueSuggestions)

    if (uniqueSuggestions.length === 1) {
      // Single suggestion - return the completion part
      const completion = uniqueSuggestions[0].substring(partial.length)
      console.log('✅ Single suggestion, completion:', completion)
      return {
        suggestions: [completion],
        isComplete: true,
        commonPrefix: completion
      }
    }

    if (uniqueSuggestions.length > 1) {
      // Multiple suggestions - find common prefix
      const commonPrefix = this.findCommonPrefix(uniqueSuggestions)
      const completion = commonPrefix.substring(partial.length)
      console.log('✅ Multiple suggestions, completion:', completion)
      return {
        suggestions: uniqueSuggestions.map(cmd => cmd.substring(partial.length)),
        isComplete: false,
        commonPrefix: completion
      }
    }

    console.log('❌ No suggestions found')
    return { suggestions: [], isComplete: false }
  }

  /**
   * Get command options/flags suggestions
   */
  private getCommandOptions(command: string, partial: string): AutocompleteResult {
    console.log('getCommandOptions called with:', { command, partial })
    
    const commandOptions: { [key: string]: string[] } = {
      'rm': ['-f', '--force', '-i', '-r', '-R', '--recursive', '-v', '--verbose', '--help'],
      'ls': ['-a', '--all', '-l', '-h', '--human-readable', '-t', '--sort=time'],
      'cat': ['-n', '--number', '-b', '--number-nonblank', '-s', '--squeeze-blank'],
      'cd': ['-', '-L', '-P'],
      'file': ['-b', '--brief', '-i', '--mime', '-L', '--dereference', '-z', '--uncompress', '--help'],
      'strings': ['-a', '--all', '-n', '--bytes=number', '-t', '--radix={o,d,x}', '-o', '-d', '-x', '--help'],
      'hexdump': ['-C', '--canonical', '-b', '--one-byte-octal', '-c', '--one-byte-char', '-d', '--two-bytes-decimal', '-o', '--two-bytes-octal', '-x', '--two-bytes-hex', '-n', '--length=BYTES', '--help'],
      'find': ['-name', '-type', '-size', '-mtime', '-user', '-group', '-perm', '-exec', '-print', '--help'],
      'ps': ['-a', '--all', '-u', '--user=USER', '-x', '--no-headers', '-o', '--format=FORMAT', '-p', '--pid=PID', '--help'],
      'lsof': ['-p', '-u', '-c', '-i', '--help'],
      'top': ['-n', '--iterations=NUMBER', '-u', '--user=USER', '-p', '--pid=PID', '-d', '--delay=SECONDS', '--help'],
      'kill': ['-l', '--list', '-s', '--signal=SIGNAL', '-9', '-KILL', '-15', '-TERM', '--help'],
      'netstat': ['-t', '--tcp', '-u', '--udp', '-l', '--listening', '-p', '--programs', '-n', '--numeric', '-a', '--all', '--help'],
      'ss': ['-t', '--tcp', '-u', '--udp', '-l', '--listening', '-p', '--processes', '-n', '--numeric', '-a', '--all', '-H', '--no-header', '--help'],
      'ping': ['-c', '--count=NUMBER', '-i', '--interval=SECONDS', '-t', '--ttl=NUMBER', '-W', '--timeout=SECONDS', '--help'],
      'nmap': ['-sS', '-sT', '-sU', '-p', '-O', '-sV', '-A', '--help'],
      'chmod': ['-R', '--recursive', '-v', '--verbose', '-c', '--changes', '--help'],
      'chown': ['-R', '--recursive', '-v', '--verbose', '-c', '--changes', '--help'],
      'sudo': ['-u', '--user=USER', '-l', '--list', '-v', '--validate', '--help'],
      'groups': ['--help']
    }

    const options = commandOptions[command.toLowerCase()] || []
    console.log('Available options for', command, ':', options)
    
    const suggestions = options.filter(option => 
      option.toLowerCase().startsWith(partial.toLowerCase())
    )

    console.log('Filtered option suggestions:', suggestions)

    if (suggestions.length === 1) {
      // Single suggestion - return the completion part
      const completion = suggestions[0].substring(partial.length)
      console.log('Single option suggestion, completion:', completion)
      return {
        suggestions: [completion],
        isComplete: true,
        commonPrefix: completion
      }
    }

    if (suggestions.length > 1) {
      // Multiple suggestions - find common prefix
      const commonPrefix = this.findCommonPrefix(suggestions)
      const completion = commonPrefix.substring(partial.length)
      console.log('Multiple option suggestions, completion:', completion)
      return {
        suggestions: suggestions.map(option => option.substring(partial.length)),
        isComplete: false,
        commonPrefix: completion
      }
    }

    console.log('No option suggestions found')
    return { suggestions: [], isComplete: false }
  }

  /**
   * Get path suggestions for filesystem commands
   */
  private async getPathSuggestions(partial: string, command: string): Promise<AutocompleteResult> {
    try {
      // Resolve the partial path
      const resolvedPath = this.resolvePartialPath(partial)
      const parentPath = this.getParentPath(resolvedPath)
      const searchPattern = this.getSearchPattern(resolvedPath)

      // Get directory contents
      const lsResult = await this.context.filesystem.ls(parentPath, true) // Include hidden files
      
      if (!lsResult.success || !lsResult.files) {
        return { suggestions: [], isComplete: false }
      }

      // Filter files based on search pattern
      const matchingFiles = lsResult.files.filter(file => {
        const cleanFile = file.replace(/^['"]|['"]$/g, '') // Remove quotes
        return cleanFile.startsWith(searchPattern)  // Case-sensitive!
      })

      // For cd command, only show directories
      if (command === 'cd') {
        const directories = await this.filterDirectories(matchingFiles, parentPath)
        return this.processSuggestions(directories, searchPattern, resolvedPath)
      }

      // For rm command, show all files and directories (can delete both)
      if (command === 'rm') {
        return this.processSuggestions(matchingFiles, searchPattern, resolvedPath)
      }

      // For other commands (cat, ls), show all matching files
      return this.processSuggestions(matchingFiles, searchPattern, resolvedPath)

    } catch (error) {
      console.error('Error in path suggestions:', error)
      return { suggestions: [], isComplete: false }
    }
  }

  /**
   * Filter to only include directories
   */
  private async filterDirectories(files: string[], parentPath: string): Promise<string[]> {
    const directories: string[] = []

    for (const file of files) {
      const cleanFile = file.replace(/^['"]|['"]$/g, '')
      const fullPath = this.joinPath(parentPath, cleanFile)
      
      if (await this.context.filesystem.isDirectory(fullPath)) {
        directories.push(file)
      }
    }

    return directories
  }

  /**
   * Process suggestions and determine completion
   */
  private processSuggestions(suggestions: string[], searchPattern: string, resolvedPath: string): AutocompleteResult {
    if (suggestions.length === 0) {
      return { suggestions: [], isComplete: false }
    }

    const cleanSuggestions = suggestions.map(s => s.replace(/^['"]|['"]$/g, ''))
    
    if (suggestions.length === 1) {
      const suggestion = cleanSuggestions[0]
      // Return only the completion part, not the full path
      const completionPart = suggestion.substring(searchPattern.length)
      
      return {
        suggestions: [completionPart],
        isComplete: true,
        commonPrefix: completionPart
      }
    }

    // Multiple suggestions - find common prefix
    const commonPrefix = this.findCommonPrefix(cleanSuggestions)
    
    if (commonPrefix && commonPrefix.length > searchPattern.length) {
      // Return only the common completion part
      const completionPart = commonPrefix.substring(searchPattern.length)
      
      return {
        suggestions: cleanSuggestions.map(s => s.substring(searchPattern.length)),
        isComplete: false,
        commonPrefix: completionPart
      }
    }

    // Return only the completion parts
    return {
      suggestions: cleanSuggestions.map(s => s.substring(searchPattern.length)),
      isComplete: false
    }
  }

  /**
   * Get history suggestions based on command history
   */
  private getHistorySuggestions(partial: string): AutocompleteResult {
    const suggestions = this.context.commandHistory.filter(cmd => 
      cmd.toLowerCase().startsWith(partial.toLowerCase())
    )

    if (suggestions.length === 1) {
      return {
        suggestions: suggestions,
        isComplete: true,
        commonPrefix: suggestions[0]
      }
    }

    if (suggestions.length > 1) {
      const commonPrefix = this.findCommonPrefix(suggestions)
      return {
        suggestions: suggestions,
        isComplete: false,
        commonPrefix
      }
    }

    return { suggestions: [], isComplete: false }
  }

  /**
   * Check if command needs path completion
   */
  private needsPathCompletion(command: string): boolean {
    const pathCompletionCommands = ['ls', 'cd', 'cat', 'rm', 'file', 'strings', 'hexdump', 'find', 'chmod', 'chown']
    return pathCompletionCommands.includes(command.toLowerCase())
  }

  /**
   * Resolve partial path to full path
   */
  private resolvePartialPath(partial: string): string {
    if (!partial) return this.context.currentPath
    
    if (partial.startsWith('/')) {
      return partial
    }
    
    return this.joinPath(this.context.currentPath, partial)
  }

  /**
   * Get parent path from a full path
   */
  private getParentPath(path: string): string {
    const parts = path.split('/').filter(part => part !== '')
    if (parts.length === 0) return '/'
    parts.pop()
    return '/' + parts.join('/')
  }

  /**
   * Get search pattern from partial path
   */
  private getSearchPattern(path: string): string {
    const parts = path.split('/').filter(part => part !== '')
    return parts[parts.length - 1] || ''
  }

  /**
   * Join path segments
   */
  private joinPath(...segments: string[]): string {
    return segments.filter(segment => segment !== '').join('/')
  }

  /**
   * Find common prefix among suggestions
   */
  private findCommonPrefix(suggestions: string[]): string {
    if (suggestions.length === 0) return ''
    if (suggestions.length === 1) return suggestions[0]

    let prefix = suggestions[0]
    
    for (let i = 1; i < suggestions.length; i++) {
      const suggestion = suggestions[i]
      let j = 0
      
      while (j < prefix.length && j < suggestion.length && prefix[j] === suggestion[j]) {
        j++
      }
      
      prefix = prefix.substring(0, j)
      
      if (prefix === '') break
    }

    return prefix
  }

  /**
   * Update context (called when filesystem or commands change)
   */
  updateContext(newContext: Partial<AutocompleteContext>): void {
    this.context = { ...this.context, ...newContext }
  }
}

/**
 * Factory function to create autocomplete instance
 */
export function createTerminalAutocomplete(context: AutocompleteContext): TerminalAutocomplete {
  return new TerminalAutocomplete(context)
}
