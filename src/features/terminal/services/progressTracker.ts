/**
 * Progress Tracking System
 * 
 * This file contains the progress tracking logic that monitors user actions
 * and updates game progress accordingly.
 */

import { GameStateManager } from './gameState'
import { GameProgress, GameMilestone } from '@/features/shared/types/game'

export class ProgressTracker {
  private gameManager: GameStateManager
  private commandHistory: string[] = []
  private pathHistory: string[] = []
  private puzzleHistory: string[] = []

  constructor() {
    this.gameManager = GameStateManager.getInstance()
  }

  /**
   * Track command usage
   */
  public trackCommand(command: string, args: string[] = []): void {
    if (!this.gameManager.getGameState().isEnabled) return

    const fullCommand = `${command} ${args.join(' ')}`.trim()
    
    // Avoid duplicate tracking
    if (this.commandHistory.includes(fullCommand)) return
    
    this.commandHistory.push(fullCommand)
    
    this.gameManager.updateProgress('command_used', {
      command: fullCommand,
      timestamp: new Date().toISOString(),
      args
    })

    console.log(`[ProgressTracker] Command tracked: ${fullCommand}`)
  }

  /**
   * Track path exploration
   */
  public trackPath(path: string): void {
    if (!this.gameManager.getGameState().isEnabled) return

    // Avoid duplicate tracking
    if (this.pathHistory.includes(path)) return
    
    this.pathHistory.push(path)
    
    this.gameManager.updateProgress('path_explored', {
      path,
      timestamp: new Date().toISOString()
    })

    console.log(`[ProgressTracker] Path tracked: ${path}`)
  }

  /**
   * Track puzzle completion
   */
  public trackPuzzleCompletion(puzzleId: string, points: number = 100): void {
    if (!this.gameManager.getGameState().isEnabled) return

    // Avoid duplicate tracking
    if (this.puzzleHistory.includes(puzzleId)) return
    
    this.puzzleHistory.push(puzzleId)
    
    this.gameManager.updateProgress('puzzle_completed', {
      id: puzzleId,
      points,
      timestamp: new Date().toISOString()
    })

    console.log(`[ProgressTracker] Puzzle completed: ${puzzleId} (+${points} points)`)
  }

  /**
   * Auto-detect puzzle completion from terminal output
   */
  public detectPuzzleFromOutput(output: string): void {
    if (!this.gameManager.getGameState().isEnabled) return

    // Check for CTF flags
    const ctfFlags = output.match(/CTF\{[^}]+\}/g)
    if (ctfFlags) {
      ctfFlags.forEach(flag => {
        const puzzleId = `flag_${flag.replace(/[{}]/g, '')}`
        this.trackPuzzleCompletion(puzzleId, 200)
        this.trackFlagFound(puzzleId, 'terminal_output', 200)
      })
    }

    // Check for specific puzzle files
    if (output.includes('credentials.txt') && output.includes('Username:')) {
      this.trackPuzzleCompletion('credentials_puzzle', 100)
    }
    
    if (output.includes('flag.txt') && output.includes('Congratulations!')) {
      this.trackPuzzleCompletion('main_flag_puzzle', 300)
    }
    
    if (output.includes('hint.md') && output.includes('Puzzle Hints')) {
      this.trackPuzzleCompletion('hint_puzzle', 50)
    }
    
    if (output.includes('config.json') && output.includes('puzzle-server')) {
      this.trackPuzzleCompletion('config_puzzle', 75)
    }
    
    if (output.includes('secret.bin') && output.includes('^@')) {
      this.trackPuzzleCompletion('binary_puzzle', 150)
    }
  }

  /**
   * Track flag discovery
   */
  public trackFlagFound(flagId: string, location: string, points: number = 200): void {
    if (!this.gameManager.getGameState().isEnabled) return

    this.gameManager.updateProgress('flag_found', {
      id: flagId,
      location,
      points,
      timestamp: new Date().toISOString()
    })

    console.log(`[ProgressTracker] Flag found: ${flagId} at ${location} (+${points} points)`)
  }

  /**
   * Track hint usage
   */
  public trackHintUsed(hintId: string, cost: number = 10): void {
    if (!this.gameManager.getGameState().isEnabled) return

    this.gameManager.updateProgress('hint_used', {
      id: hintId,
      cost,
      timestamp: new Date().toISOString()
    })

    console.log(`[ProgressTracker] Hint used: ${hintId} (-${cost} points)`)
  }

  /**
   * Track permission escalation
   */
  public trackPermissionEscalation(fromUser: string, toUser: string, method: string): void {
    if (!this.gameManager.getGameState().isEnabled) return

    this.gameManager.updateProgress('permission_escalation', {
      fromUser,
      toUser,
      method,
      timestamp: new Date().toISOString()
    })

    console.log(`[ProgressTracker] Permission escalation: ${fromUser} -> ${toUser} via ${method}`)
  }

  /**
   * Get current progress statistics
   */
  public getProgressStats(): {
    commandsUsed: number
    pathsExplored: number
    puzzlesCompleted: number
    flagsFound: number
    hintsUsed: number
  } {
    const gameState = this.gameManager.getGameState()
    
    return {
      commandsUsed: gameState.commandsUsed.length,
      pathsExplored: this.pathHistory.length,
      puzzlesCompleted: gameState.puzzlesCompleted.length,
      flagsFound: gameState.puzzlesCompleted.length, // Assuming flags are part of puzzles
      hintsUsed: gameState.hintsUsed
    }
  }

  /**
   * Check if milestone is completed
   */
  public checkMilestoneCompletion(milestoneId: string): boolean {
    const gameState = this.gameManager.getGameState()
    const milestone = gameState.milestones.find(m => m.id === milestoneId)
    return milestone ? milestone.completed : false
  }

  /**
   * Get completion percentage for a specific milestone type
   */
  public getMilestoneProgress(type: 'command' | 'path' | 'puzzle' | 'flag'): number {
    const gameState = this.gameManager.getGameState()
    const milestones = gameState.milestones.filter(m => m.type === type)
    const completed = milestones.filter(m => m.completed).length
    
    return milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0
  }

  /**
   * Reset tracking history
   */
  public resetHistory(): void {
    this.commandHistory = []
    this.pathHistory = []
    this.puzzleHistory = []
    console.log('[ProgressTracker] History reset')
  }

  /**
   * Get detailed progress report
   */
  public getDetailedProgress(): {
    commands: string[]
    paths: string[]
    puzzles: string[]
    milestones: GameMilestone[]
    achievements: any[]
  } {
    const gameState = this.gameManager.getGameState()
    
    return {
      commands: [...this.commandHistory],
      paths: [...this.pathHistory],
      puzzles: [...this.puzzleHistory],
      milestones: gameState.milestones,
      achievements: gameState.achievements.filter(a => a.unlocked)
    }
  }

  /**
   * Export progress data for analysis
   */
  public exportProgressData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      gameState: this.gameManager.getGameState(),
      progress: this.gameManager.getProgress(),
      score: this.gameManager.getScore(),
      detailed: this.getDetailedProgress()
    }
    
    return JSON.stringify(data, null, 2)
  }
}
