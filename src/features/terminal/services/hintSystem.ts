/**
 * Hint System
 * 
 * This file contains the hint generation and management logic for the game progression system.
 * It provides contextual hints based on user progress and current situation.
 */

import { GameStateManager } from './gameState'
import { ProgressTracker } from './progressTracker'
import { GameHint } from '@/features/shared/types/game'

export class HintSystem {
  private gameManager: GameStateManager
  private progressTracker: ProgressTracker
  private hintCache: Map<string, GameHint> = new Map()
  private usedHints: Set<string> = new Set()

  constructor() {
    this.gameManager = GameStateManager.getInstance()
    this.progressTracker = new ProgressTracker()
  }

  /**
   * Generate hint based on current context
   */
  public generateHint(context: string, type: 'general' | 'specific' | 'command' | 'path' | 'permission' = 'general'): GameHint | null {
    if (!this.gameManager.getGameState().isEnabled) return null

    const hintId = `${context}_${type}_${Date.now()}`
    const hint = this.createHint(hintId, context, type)
    
    if (hint) {
      this.hintCache.set(hintId, hint)
      return hint
    }

    return null
  }

  /**
   * Create hint based on context and type
   */
  private createHint(hintId: string, context: string, type: 'general' | 'specific' | 'command' | 'path' | 'permission'): GameHint | null {
    const gameState = this.gameManager.getGameState()
    
    // Check if user has reached hint limit
    if (gameState.hintsUsed >= 5) {
      return {
        id: hintId,
        content: "You've reached the maximum number of hints for this session. Try exploring more on your own!",
        type: 'general',
        cost: 0,
        difficulty: 'easy',
        context,
        used: false
      }
    }

    const hints = this.getContextualHints(context, type)
    if (hints.length === 0) return null

    const randomHint = hints[Math.floor(Math.random() * hints.length)]
    
    return {
      id: hintId,
      content: randomHint.content,
      type: randomHint.type,
      cost: randomHint.cost,
      difficulty: randomHint.difficulty,
      context,
      used: false
    }
  }

  /**
   * Get contextual hints based on current situation
   */
  private getContextualHints(context: string, type: 'general' | 'specific' | 'command' | 'path' | 'permission'): Array<{
    content: string
    type: 'general' | 'specific' | 'command' | 'path' | 'permission'
    cost: number
    difficulty: 'easy' | 'medium' | 'hard'
  }> {
    const gameState = this.gameManager.getGameState()
    const progress = this.gameManager.getProgress()

    const hints: Array<{
      content: string
      type: 'general' | 'specific' | 'command' | 'path' | 'permission'
      cost: number
      difficulty: 'easy' | 'medium' | 'hard'
    }> = []

    // General exploration hints
    if (type === 'general' || type === 'path') {
      hints.push(
        {
          content: "Try using 'ls' to see what's in the current directory",
          type: 'command',
          cost: 5,
          difficulty: 'easy'
        },
        {
          content: "Use 'cd' to navigate to different directories",
          type: 'command',
          cost: 5,
          difficulty: 'easy'
        },
        {
          content: "Hidden files start with a dot (.) - try 'ls -la' to see them",
          type: 'command',
          cost: 10,
          difficulty: 'medium'
        },
        {
          content: "Check the permissions of files with 'ls -l'",
          type: 'command',
          cost: 10,
          difficulty: 'medium'
        }
      )
    }

    // Command-specific hints
    if (type === 'command') {
      hints.push(
        {
          content: "Use 'cat' to read file contents",
          type: 'command',
          cost: 5,
          difficulty: 'easy'
        },
        {
          content: "Use 'find' to search for files by name",
          type: 'command',
          cost: 10,
          difficulty: 'medium'
        },
        {
          content: "Use 'grep' to search for text within files",
          type: 'command',
          cost: 10,
          difficulty: 'medium'
        },
        {
          content: "Use 'file' to determine file types",
          type: 'command',
          cost: 8,
          difficulty: 'medium'
        }
      )
    }

    // Permission-specific hints
    if (type === 'permission') {
      hints.push(
        {
          content: "Files with 's' in the permissions are SUID binaries",
          type: 'permission',
          cost: 15,
          difficulty: 'hard'
        },
        {
          content: "SUID binaries run with the owner's permissions",
          type: 'permission',
          cost: 20,
          difficulty: 'hard'
        },
        {
          content: "Look for files owned by root with SUID bit set",
          type: 'permission',
          cost: 25,
          difficulty: 'hard'
        }
      )
    }

    // Puzzle-specific hints
    if (context.includes('puzzle') || context.includes('flag')) {
      hints.push(
        {
          content: "Flags are often hidden in unexpected places",
          type: 'specific',
          cost: 15,
          difficulty: 'medium'
        },
        {
          content: "Check binary files for hidden text",
          type: 'specific',
          cost: 20,
          difficulty: 'hard'
        },
        {
          content: "Look for files with unusual permissions",
          type: 'specific',
          cost: 15,
          difficulty: 'medium'
        }
      )
    }

    // Progress-based hints
    if (progress.completedPuzzles === 0) {
      hints.push(
        {
          content: "Start by exploring your home directory",
          type: 'general',
          cost: 5,
          difficulty: 'easy'
        }
      )
    }

    if (progress.completedPuzzles > 0 && progress.completedPuzzles < 3) {
      hints.push(
        {
          content: "Try exploring system directories like /usr/bin",
          type: 'general',
          cost: 8,
          difficulty: 'medium'
        }
      )
    }

    return hints
  }

  /**
   * Use a hint
   */
  public useHint(hintId: string): boolean {
    const hint = this.hintCache.get(hintId)
    if (!hint || hint.used) return false

    const gameState = this.gameManager.getGameState()
    
    // Check if user can afford the hint
    if (gameState.totalScore < hint.cost) {
      console.log(`[HintSystem] Insufficient score for hint: ${hint.cost}`)
      return false
    }

    // Mark hint as used
    hint.used = true
    hint.usedAt = new Date().toISOString()
    this.usedHints.add(hintId)

    // Track hint usage
    this.progressTracker.trackHintUsed(hintId, hint.cost)

    console.log(`[HintSystem] Hint used: ${hint.content}`)
    return true
  }

  /**
   * Get available hints for current context
   */
  public getAvailableHints(context: string): GameHint[] {
    const hints: GameHint[] = []
    
    // Generate a few hints for the context
    for (let i = 0; i < 3; i++) {
      const hint = this.generateHint(context, 'general')
      if (hint) {
        hints.push(hint)
      }
    }

    return hints.filter(hint => !hint.used)
  }

  /**
   * Get hint by ID
   */
  public getHint(hintId: string): GameHint | null {
    return this.hintCache.get(hintId) || null
  }

  /**
   * Get all used hints
   */
  public getUsedHints(): GameHint[] {
    return Array.from(this.hintCache.values()).filter(hint => hint.used)
  }

  /**
   * Get hint statistics
   */
  public getHintStats(): {
    totalHints: number
    usedHints: number
    availableHints: number
    totalCost: number
  } {
    const hints = Array.from(this.hintCache.values())
    const usedHints = hints.filter(hint => hint.used)
    
    return {
      totalHints: hints.length,
      usedHints: usedHints.length,
      availableHints: hints.length - usedHints.length,
      totalCost: usedHints.reduce((sum, hint) => sum + hint.cost, 0)
    }
  }

  /**
   * Clear hint cache
   */
  public clearCache(): void {
    this.hintCache.clear()
    this.usedHints.clear()
    console.log('[HintSystem] Cache cleared')
  }

  /**
   * Get contextual hint for current terminal state
   */
  public getContextualHint(currentPath: string, lastCommand: string): GameHint | null {
    let context = 'general'
    let type: 'general' | 'specific' | 'command' | 'path' | 'permission' = 'general'

    // Determine context based on current path
    if (currentPath.includes('/home')) {
      context = 'home_directory'
      type = 'path'
    } else if (currentPath.includes('/usr/bin')) {
      context = 'system_binaries'
      type = 'command'
    } else if (currentPath.includes('/etc')) {
      context = 'system_config'
      type = 'permission'
    }

    // Determine context based on last command
    if (lastCommand.includes('ls')) {
      context = 'listing_files'
      type = 'command'
    } else if (lastCommand.includes('cat')) {
      context = 'reading_files'
      type = 'command'
    } else if (lastCommand.includes('find')) {
      context = 'searching_files'
      type = 'command'
    }

    return this.generateHint(context, type)
  }
}
