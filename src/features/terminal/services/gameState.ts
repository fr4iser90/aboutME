/**
 * Game State Management System
 * 
 * This file contains the main game state management logic using singleton pattern.
 * It handles game state persistence, progress tracking, and state updates.
 */

import { 
  GameState, 
  GameProgress, 
  GameScore, 
  GameMilestone, 
  GameAchievement, 
  VictoryCondition,
  GameConfig,
  GameStateUpdate,
  GameSession
} from '@/features/shared/types/game'

export class GameStateManager {
  private static instance: GameStateManager
  private gameState: GameState
  private config: GameConfig
  private localStorageKey = 'game-progression-state'
  private sessionKey = 'game-session'

  private constructor() {
    this.config = this.getDefaultConfig()
    this.gameState = this.getDefaultGameState()
    this.loadGameState()
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager()
    }
    return GameStateManager.instance
  }

  /**
   * Get default game configuration
   */
  private getDefaultConfig(): GameConfig {
    return {
      enableHints: true,
      enableScoring: true,
      enableAchievements: true,
      enableProgressTracking: true,
      hintCostMultiplier: 10,
      scoreMultiplier: 1,
      maxHintsPerSession: 5,
      victoryThreshold: 1000
    }
  }

  /**
   * Get default game state
   */
  private getDefaultGameState(): GameState {
    const now = new Date().toISOString()
    return {
      isEnabled: false, // Disabled by default for authentic look
      currentLevel: 1,
      totalScore: 0,
      hintsUsed: 0,
      puzzlesCompleted: [],
      commandsUsed: [],
      milestones: this.getDefaultMilestones(),
      achievements: this.getDefaultAchievements(),
      sessionStartTime: now,
      lastActivityTime: now,
      gameMode: 'guided'
    }
  }

  /**
   * Get default milestones
   */
  private getDefaultMilestones(): GameMilestone[] {
    return [
      {
        id: 'first_login',
        name: 'First Login',
        description: 'Successfully log into the terminal',
        type: 'command',
        target: 'login',
        completed: false,
        points: 50,
        difficulty: 'easy'
      },
      {
        id: 'explore_home',
        name: 'Home Explorer',
        description: 'Explore your home directory',
        type: 'path',
        target: '/home',
        completed: false,
        points: 25,
        difficulty: 'easy'
      },
      {
        id: 'find_first_flag',
        name: 'Flag Hunter',
        description: 'Find your first puzzle flag',
        type: 'flag',
        target: 'any',
        completed: false,
        points: 100,
        difficulty: 'medium'
      },
      {
        id: 'use_ls_command',
        name: 'Directory Lister',
        description: 'Use the ls command to list files',
        type: 'command',
        target: 'ls',
        completed: false,
        points: 25,
        difficulty: 'easy'
      },
      {
        id: 'use_cd_command',
        name: 'Path Navigator',
        description: 'Use the cd command to change directories',
        type: 'command',
        target: 'cd',
        completed: false,
        points: 25,
        difficulty: 'easy'
      }
    ]
  }

  /**
   * Get default achievements
   */
  private getDefaultAchievements(): GameAchievement[] {
    return [
      {
        id: 'terminal_master',
        name: 'Terminal Master',
        description: 'Complete 10 different terminal commands',
        icon: '🎯',
        unlocked: false,
        points: 200,
        category: 'mastery'
      },
      {
        id: 'path_explorer',
        name: 'Path Explorer',
        description: 'Explore 20 different paths',
        icon: '🗺️',
        unlocked: false,
        points: 150,
        category: 'exploration'
      },
      {
        id: 'flag_collector',
        name: 'Flag Collector',
        description: 'Find 5 puzzle flags',
        icon: '🏴',
        unlocked: false,
        points: 300,
        category: 'discovery'
      },
      {
        id: 'hint_saver',
        name: 'Hint Saver',
        description: 'Complete a session without using hints',
        icon: '💡',
        unlocked: false,
        points: 100,
        category: 'persistence'
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a puzzle in under 2 minutes',
        icon: '⚡',
        unlocked: false,
        points: 250,
        category: 'speed'
      }
    ]
  }

  /**
   * Toggle game mode on/off
   */
  public toggleGameMode(): void {
    this.gameState.isEnabled = !this.gameState.isEnabled
    this.gameState.lastActivityTime = new Date().toISOString()
    
    if (this.gameState.isEnabled) {
      this.gameState.sessionStartTime = new Date().toISOString()
      console.log('Game mode enabled')
    } else {
      console.log('Game mode disabled')
    }
    
    this.saveGameState()
  }

  /**
   * Get current game state
   */
  public getGameState(): GameState {
    return { ...this.gameState }
  }

  /**
   * Update game progress
   */
  public updateProgress(type: string, data: any): void {
    if (!this.gameState.isEnabled) return

    const update: GameStateUpdate = {
      type: type as any,
      data,
      timestamp: new Date().toISOString()
    }

    this.processUpdate(update)
    this.checkMilestones()
    this.checkAchievements()
    this.saveGameState()
  }

  /**
   * Process game state update
   */
  private processUpdate(update: GameStateUpdate): void {
    this.gameState.lastActivityTime = update.timestamp

    switch (update.type) {
      case 'puzzle_completed':
        if (!this.gameState.puzzlesCompleted.includes(update.data.id)) {
          this.gameState.puzzlesCompleted.push(update.data.id)
          this.gameState.totalScore += update.data.points || 100
        }
        break

      case 'command_used':
        if (!this.gameState.commandsUsed.includes(update.data.command)) {
          this.gameState.commandsUsed.push(update.data.command)
          this.gameState.totalScore += 10
        }
        break

      case 'hint_used':
        this.gameState.hintsUsed++
        this.gameState.totalScore -= this.config.hintCostMultiplier
        break

      case 'achievement_unlocked':
        const achievement = this.gameState.achievements.find(a => a.id === update.data.id)
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true
          achievement.unlockedAt = update.timestamp
          this.gameState.totalScore += achievement.points
        }
        break
    }
  }

  /**
   * Check milestone completion
   */
  private checkMilestones(): void {
    this.gameState.milestones.forEach(milestone => {
      if (milestone.completed) return

      let completed = false

      switch (milestone.type) {
        case 'command':
          completed = this.gameState.commandsUsed.includes(milestone.target)
          break
        case 'puzzle':
          completed = this.gameState.puzzlesCompleted.includes(milestone.target)
          break
        case 'flag':
          completed = this.gameState.puzzlesCompleted.length > 0
          break
        case 'path':
          // This would need integration with filesystem exploration
          completed = false
          break
      }

      if (completed) {
        milestone.completed = true
        milestone.completedAt = new Date().toISOString()
        this.gameState.totalScore += milestone.points
      }
    })
  }

  /**
   * Check achievement completion
   */
  private checkAchievements(): void {
    this.gameState.achievements.forEach(achievement => {
      if (achievement.unlocked) return

      let unlocked = false

      switch (achievement.id) {
        case 'terminal_master':
          unlocked = this.gameState.commandsUsed.length >= 10
          break
        case 'path_explorer':
          // This would need integration with filesystem exploration
          unlocked = false
          break
        case 'flag_collector':
          unlocked = this.gameState.puzzlesCompleted.length >= 5
          break
        case 'hint_saver':
          unlocked = this.gameState.hintsUsed === 0
          break
        case 'speed_demon':
          // This would need timing integration
          unlocked = false
          break
      }

      if (unlocked) {
        achievement.unlocked = true
        achievement.unlockedAt = new Date().toISOString()
        this.gameState.totalScore += achievement.points
      }
    })
  }

  /**
   * Get current game progress
   */
  public getProgress(): GameProgress {
    return {
      totalPuzzles: 10, // This would be dynamic based on available puzzles
      completedPuzzles: this.gameState.puzzlesCompleted.length,
      totalCommands: 20, // This would be dynamic based on available commands
      usedCommands: this.gameState.commandsUsed.length,
      totalPaths: 50, // This would be dynamic based on filesystem
      exploredPaths: 0, // This would need filesystem integration
      totalFlags: 5, // This would be dynamic based on puzzle system
      foundFlags: this.gameState.puzzlesCompleted.length,
      completionPercentage: Math.round((this.gameState.puzzlesCompleted.length / 10) * 100),
      currentStreak: 0, // This would need streak tracking
      longestStreak: 0 // This would need streak tracking
    }
  }

  /**
   * Get current game score
   */
  public getScore(): GameScore {
    const hintPenalty = this.gameState.hintsUsed * this.config.hintCostMultiplier
    const timeBonus = 0 // This would need timing integration
    const streakBonus = 0 // This would need streak tracking

    return {
      total: this.gameState.totalScore,
      puzzleScore: this.gameState.puzzlesCompleted.length * 100,
      commandScore: this.gameState.commandsUsed.length * 10,
      explorationScore: 0, // This would need filesystem integration
      efficiencyScore: 0, // This would need efficiency calculation
      hintPenalty: -hintPenalty,
      timeBonus,
      streakBonus
    }
  }

  /**
   * Check victory conditions
   */
  public checkVictoryConditions(): VictoryCondition[] {
    const conditions: VictoryCondition[] = [
      {
        id: 'score_threshold',
        name: 'Score Master',
        description: 'Reach 1000 points',
        type: 'puzzle_completion',
        target: 1000,
        current: this.gameState.totalScore,
        completed: this.gameState.totalScore >= 1000,
        points: 500
      },
      {
        id: 'puzzle_master',
        name: 'Puzzle Master',
        description: 'Complete all available puzzles',
        type: 'puzzle_completion',
        target: 10,
        current: this.gameState.puzzlesCompleted.length,
        completed: this.gameState.puzzlesCompleted.length >= 10,
        points: 1000
      },
      {
        id: 'command_master',
        name: 'Command Master',
        description: 'Use all available commands',
        type: 'command_mastery',
        target: 20,
        current: this.gameState.commandsUsed.length,
        completed: this.gameState.commandsUsed.length >= 20,
        points: 300
      }
    ]

    return conditions
  }

  /**
   * Reset game progress
   */
  public resetProgress(): void {
    this.gameState = this.getDefaultGameState()
    this.saveGameState()
    console.log('Game progress reset')
  }

  /**
   * Save game state to localStorage
   */
  private saveGameState(): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.gameState))
    } catch (error) {
      console.error('Failed to save game state:', error)
    }
  }

  /**
   * Load game state from localStorage
   */
  private loadGameState(): void {
    try {
      const saved = localStorage.getItem(this.localStorageKey)
      if (saved) {
        const parsedState = JSON.parse(saved)
        this.gameState = { ...this.getDefaultGameState(), ...parsedState }
      }
    } catch (error) {
      console.error('Failed to load game state:', error)
      this.gameState = this.getDefaultGameState()
    }
  }

  /**
   * Save current session
   */
  public saveSession(): void {
    const session: GameSession = {
      id: `session_${Date.now()}`,
      startTime: this.gameState.sessionStartTime,
      endTime: new Date().toISOString(),
      duration: Date.now() - new Date(this.gameState.sessionStartTime).getTime(),
      finalScore: this.gameState.totalScore,
      hintsUsed: this.gameState.hintsUsed,
      puzzlesCompleted: this.gameState.puzzlesCompleted.length,
      commandsUsed: this.gameState.commandsUsed.length,
      achievements: this.gameState.achievements.filter(a => a.unlocked).map(a => a.id),
      gameMode: this.gameState.gameMode
    }

    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(session))
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  /**
   * Load last session
   */
  public loadSession(): GameSession | null {
    try {
      const saved = localStorage.getItem(this.sessionKey)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load session:', error)
      return null
    }
  }
}
