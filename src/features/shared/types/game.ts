/**
 * Game Progression System Type Definitions
 * 
 * This file contains all type definitions for the game progression system,
 * including game state structures, progress tracking, and victory conditions.
 */

export interface GameState {
  isEnabled: boolean
  currentLevel: number
  totalScore: number
  hintsUsed: number
  puzzlesCompleted: string[]
  commandsUsed: string[]
  milestones: GameMilestone[]
  achievements: GameAchievement[]
  sessionStartTime: string
  lastActivityTime: string
  gameMode: 'authentic' | 'guided' | 'competitive'
}

export interface GameMilestone {
  id: string
  name: string
  description: string
  type: 'puzzle' | 'command' | 'path' | 'permission' | 'flag'
  target: string
  completed: boolean
  completedAt?: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface GameAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  points: number
  category: 'exploration' | 'mastery' | 'speed' | 'discovery' | 'persistence'
}

export interface GameProgress {
  totalPuzzles: number
  completedPuzzles: number
  totalCommands: number
  usedCommands: number
  totalPaths: number
  exploredPaths: number
  totalFlags: number
  foundFlags: number
  completionPercentage: number
  currentStreak: number
  longestStreak: number
}

export interface GameHint {
  id: string
  content: string
  type: 'general' | 'specific' | 'command' | 'path' | 'permission'
  cost: number
  difficulty: 'easy' | 'medium' | 'hard'
  context: string
  used: boolean
  usedAt?: string
}

export interface GameScore {
  total: number
  puzzleScore: number
  commandScore: number
  explorationScore: number
  efficiencyScore: number
  hintPenalty: number
  timeBonus: number
  streakBonus: number
}

export interface VictoryCondition {
  id: string
  name: string
  description: string
  type: 'puzzle_completion' | 'flag_collection' | 'path_exploration' | 'command_mastery' | 'permission_escalation'
  target: number | string
  current: number
  completed: boolean
  completedAt?: string
  points: number
}

export interface GameSession {
  id: string
  startTime: string
  endTime?: string
  duration?: number
  finalScore: number
  hintsUsed: number
  puzzlesCompleted: number
  commandsUsed: number
  achievements: string[]
  gameMode: string
}

export interface GameConfig {
  enableHints: boolean
  enableScoring: boolean
  enableAchievements: boolean
  enableProgressTracking: boolean
  hintCostMultiplier: number
  scoreMultiplier: number
  maxHintsPerSession: number
  victoryThreshold: number
}

export interface GameStateUpdate {
  type: 'puzzle_completed' | 'command_used' | 'path_explored' | 'flag_found' | 'hint_used' | 'achievement_unlocked'
  data: any
  timestamp: string
}

export interface GameInterface {
  toggleGameMode(): void
  getGameState(): GameState
  updateProgress(type: string, data: any): void
  useHint(hintId: string): GameHint | null
  checkVictoryConditions(): VictoryCondition[]
  resetProgress(): void
  getScore(): GameScore
  getProgress(): GameProgress
  saveSession(): void
  loadSession(): void
}
