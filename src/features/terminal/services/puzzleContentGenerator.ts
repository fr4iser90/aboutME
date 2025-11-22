/**
 * Puzzle Content Generator
 * 
 * This file contains the main puzzle content generation logic for the terminal filesystem.
 * It handles puzzle file content generation, flag creation, hint generation, and binary data.
 */

import { 
  TerminalCredentials, 
  PuzzleFileTemplate, 
  PuzzleFlag, 
  PuzzleHint, 
  PuzzleGenerationResult,
  PuzzleSystemConfig 
} from '@/features/shared/types/puzzle'
import { config } from '@/features/shared/services/config'

export class PuzzleContentGenerator {
  private puzzleConfig: PuzzleSystemConfig | null = null
  private contentCache: Map<string, string> = new Map()

  constructor() {
    this.loadPuzzleConfig()
  }

  /**
   * Load puzzle configuration from JSON file
   */
  private async loadPuzzleConfig(): Promise<void> {
    try {
      const response = await fetch(config.api.puzzleFiles)
      this.puzzleConfig = await response.json()
    } catch (error) {
      console.warn('Could not load puzzle configuration:', error)
      this.puzzleConfig = null
    }
  }

  /**
   * Generate file content based on file name and path
   */
  generateFileContent(fileName: string, fullPath: string, credentials: TerminalCredentials): string {
    const cacheKey = `${fileName}:${fullPath}`
    
    // Check cache first
    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey)!
    }

    let content: string

    // Check if this is a SUID binary
    if (this.isSuidBinary(fileName, fullPath)) {
      content = this.generateSuidBinaryContent(fileName, fullPath, credentials)
      this.contentCache.set(cacheKey, content)
      return content
    }

    // Check if this is a puzzle file
    if (this.puzzleConfig) {
      const template = this.puzzleConfig.templates.find(t => t.name === fileName)
      if (template) {
        content = this.generateFromTemplate(template, credentials)
        this.contentCache.set(cacheKey, content)
        return content
      }
    }

    // Fallback to default content generation
    content = this.generateDefaultContent(fileName, fullPath, credentials)
    this.contentCache.set(cacheKey, content)
    return content
  }

  /**
   * Generate content from puzzle template
   */
  private generateFromTemplate(template: PuzzleFileTemplate, credentials: TerminalCredentials): string {
    let content = template.template

    // Replace template variables
    template.variables.forEach(variable => {
      const value = this.getTemplateVariable(variable, credentials)
      content = content.replace(new RegExp(`{${variable}}`, 'g'), value)
    })

    // Handle special binary content
    if (template.type === 'binary' && content === 'BINARY_CONTENT_PLACEHOLDER') {
      content = this.generateBinaryContent('executable')
    }

    return content
  }

  /**
   * Get template variable value
   */
  private getTemplateVariable(variable: string, credentials: TerminalCredentials): string {
    switch (variable) {
      case 'username':
        return credentials.username
      case 'hostname':
        return credentials.hostname
      case 'root_username':
        return credentials.root_username
      default:
        return `{${variable}}`
    }
  }

  /**
   * Generate default content for non-puzzle files
   */
  private generateDefaultContent(fileName: string, fullPath: string, credentials: TerminalCredentials): string {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const baseName = fileName.split('.').slice(0, -1).join('.')

    // Special files with realistic content
    if (fileName === '.bashrc') {
      return `# ~/.bashrc: executed by bash(1) for non-login shells.

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# History settings
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000

# Append to the history file, don't overwrite it
shopt -s histappend

# Check the window size after each command
shopt -s checkwinsize

# Set a fancy prompt
PS1='\\u@\\h:\\w\\$ '

# Enable color support
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "\$(dircolors -b ~/.dircolors)" || eval "\$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# Some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add an "alert" alias for long running commands
alias alert='notify-send --urgency=low -i "\$([ \$? = 0 ] && echo terminal || echo error)" "\$(history|tail -n1|sed -e '\\''s/^\\s*[0-9]\\+\\s*//;s/[;&|]\\s*alert$//'\\'')\"'

# Enable programmable completion features
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi`
    }

    if (fileName === '.gitconfig') {
      return `[user]
	name = ${credentials.username}
	email = ${credentials.username}@example.com

[core]
	editor = nano
	autocrlf = input

[push]
	default = simple

[alias]
	st = status
	co = checkout
	br = branch
	ci = commit
	unstage = reset HEAD --
	last = log -1 HEAD
	visual = !gitk`
    }

    if (fileName === '.zshrc') {
      return `# ~/.zshrc: Zsh configuration file

# Enable Powerlevel10k instant prompt
if [[ -r "\${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-\${(%):-%n}.zsh" ]]; then
  source "\${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-\${(%):-%n}.zsh"
fi

# History settings
HISTSIZE=10000
SAVEHIST=10000
HISTFILE=~/.zsh_history

# Options
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_SAVE_NO_DUPS
setopt HIST_FIND_NO_DUPS
setopt HIST_REDUCE_BLANKS
setopt INC_APPEND_HISTORY
setopt SHARE_HISTORY

# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

# Auto-completion
autoload -Uz compinit
compinit

# Key bindings
bindkey -e`
    }

    // File type specific content
    switch (ext) {
      // Binary files - show realistic binary output
      case 'mkv':
      case 'mp4':
      case 'avi':
      case 'mov':
        return this.generateBinaryContent('video')
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
        return this.generateBinaryContent('image')
      case 'pdf':
      case 'doc':
      case 'docx':
        return this.generateBinaryContent('document')
      case 'zip':
      case 'rar':
      case '7z':
        return this.generateBinaryContent('archive')
      case 'exe':
      case 'bin':
        return this.generateBinaryContent('executable')
      
      // Text files - show readable content
      case 'md':
        return `# ${baseName}\n\nThis is a markdown file.\n\n## Content\n\nSome content here...`
      case 'txt':
        return `This is a text file named ${fileName}.\n\nIt contains some sample text content.`
      case 'js':
        return `// ${fileName}\nconsole.log('Hello from ${fileName}!');`
      case 'py':
        return `#!/usr/bin/env python3\n# ${fileName}\n\nprint("Hello from ${fileName}!")`
      case 'json':
        return `{\n  "name": "${baseName}",\n  "description": "A JSON file",\n  "version": "1.0.0"\n}`
      case 'yml':
      case 'yaml':
        return `# ${fileName}\nname: ${baseName}\ndescription: A YAML file\nversion: 1.0.0`
      case 'sh':
        return `#!/bin/bash\n# ${fileName}\n\necho "Hello from ${fileName}!"`
      case 'desktop':
        return `[Desktop Entry]\nVersion=1.0\nType=Application\nName=${baseName}\nComment=Application\nExec=${baseName}\nIcon=${baseName}\nTerminal=false\nCategories=Game;`
      
      // Special puzzle files
      case 'secret':
        return `SECRET_KEY: admin123\nPASSWORD: password\nHIDDEN_MESSAGE: The flag is in /home/${credentials.username}/.ssh/id_rsa`
      
      // Special credentials file
      case 'credentials':
        return `username: ${credentials.username}\npassword: gaming123\napi_key: sk-1234567890abcdef\nsecret_token: abc123def456ghi789`
      
      default:
        return `This is a file named ${fileName}.\n\nIt contains some sample content.`
    }
  }

  /**
   * Generate realistic binary content
   */
  generateBinaryContent(type: string): string {
    const binaryChars = ['\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08', '\x09', '\x0A', '\x0B', '\x0C', '\x0D', '\x0E', '\x0F']
    const printableChars = ['^@', '^A', '^B', '^C', '^D', '^E', '^F', '^G', '^H', '^I', '^J', '^K', '^L', '^M', '^N', '^O']
    
    let output = ''
    const lines = Math.floor(Math.random() * 20) + 10 // 10-30 lines
    
    for (let i = 0; i < lines; i++) {
      const lineLength = Math.floor(Math.random() * 50) + 20 // 20-70 chars per line
      let line = ''
      
      for (let j = 0; j < lineLength; j++) {
        const charIndex = Math.floor(Math.random() * binaryChars.length)
        line += printableChars[charIndex]
      }
      
      output += line + '\n'
    }
    
    return output.trim()
  }

  /**
   * Generate flag content
   */
  generateFlagContent(flag: PuzzleFlag, credentials: TerminalCredentials): string {
    let content = flag.content

    // Replace template variables in flag content
    content = content.replace(/{username}/g, credentials.username)
    content = content.replace(/{hostname}/g, credentials.hostname)

    return content
  }

  /**
   * Generate hint content
   */
  generateHintContent(hint: PuzzleHint, credentials: TerminalCredentials): string {
    let content = hint.content

    // Replace template variables in hint content
    content = content.replace(/{username}/g, credentials.username)
    content = content.replace(/{hostname}/g, credentials.hostname)

    return content
  }

  /**
   * Generate credential content
   */
  generateCredentialContent(credentials: TerminalCredentials): string {
    return `username: ${credentials.username}
password: ${credentials.password}
hostname: ${credentials.hostname}
root_username: ${credentials.root_username}
root_password: ${credentials.root_password}
password_hint: ${credentials.password_hint}
root_password_hint: ${credentials.root_password_hint}`
  }

  /**
   * Check if a file is a SUID binary
   */
  private isSuidBinary(fileName: string, fullPath: string): boolean {
    if (!this.puzzleConfig?.suidBinaries) return false
    
    return this.puzzleConfig.suidBinaries.some(suidPath => 
      fullPath.includes(suidPath) || fileName === suidPath.split('/').pop()
    )
  }

  /**
   * Generate content for SUID binaries
   */
  private generateSuidBinaryContent(fileName: string, fullPath: string, credentials: TerminalCredentials): string {
    if (!this.puzzleConfig) return ''

    const template = this.puzzleConfig.templates.find(t => t.name === fileName && t.type === 'suid')
    if (!template) return ''

    return this.resolveTemplateVariables(template.template, credentials)
  }

  /**
   * Resolve template variables in content
   */
  private resolveTemplateVariables(content: string, credentials: TerminalCredentials): string {
    return content
      .replace(/{username}/g, credentials.username)
      .replace(/{hostname}/g, credentials.hostname)
      .replace(/{password}/g, credentials.password)
      .replace(/{root_username}/g, credentials.root_username)
      .replace(/{root_password}/g, credentials.root_password)
  }

  /**
   * Check if file is a puzzle file
   */
  isPuzzleFile(fileName: string): boolean {
    if (!this.puzzleConfig) return false
    
    return this.puzzleConfig.templates.some(template => template.name === fileName)
  }

  /**
   * Check if file is hidden
   */
  isHiddenFile(fileName: string): boolean {
    if (!this.puzzleConfig) return false
    
    return this.puzzleConfig.hiddenFiles.includes(fileName) || fileName.startsWith('.')
  }

  /**
   * Get puzzle file template
   */
  getPuzzleTemplate(fileName: string): PuzzleFileTemplate | null {
    if (!this.puzzleConfig) return null
    
    return this.puzzleConfig.templates.find(template => template.name === fileName) || null
  }

  /**
   * Clear content cache
   */
  clearCache(): void {
    this.contentCache.clear()
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.contentCache.size
  }
}
