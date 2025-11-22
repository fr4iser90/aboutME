/**
 * Game State Management Tests
 * 
 * Unit tests for the game state management system
 */

import { GameStateManager } from '../../src/lib/gameState'

describe('GameStateManager', () => {
  let gameManager: any;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    gameManager = GameStateManager.getInstance();
  });

  afterEach(() => {
    gameManager.resetProgress();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = GameStateManager.getInstance()
      const instance2 = GameStateManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Game State Initialization', () => {
    it('should initialize with default state', () => {
      const state = gameManager.getGameState()
      expect(state.isEnabled).toBe(false)
      expect(state.currentLevel).toBe(1)
      expect(state.totalScore).toBe(0)
      expect(state.hintsUsed).toBe(0)
      expect(state.puzzlesCompleted).toHaveLength(0)
      expect(state.commandsUsed).toHaveLength(0)
    })

    it('should have default milestones', () => {
      const state = gameManager.getGameState()
      expect(state.milestones.length).toBeGreaterThan(0)
      expect(state.milestones[0]).toHaveProperty('id')
      expect(state.milestones[0]).toHaveProperty('name')
      expect(state.milestones[0]).toHaveProperty('completed')
    })

    it('should have default achievements', () => {
      const state = gameManager.getGameState()
      expect(state.achievements.length).toBeGreaterThan(0)
      expect(state.achievements[0]).toHaveProperty('id')
      expect(state.achievements[0]).toHaveProperty('name')
      expect(state.achievements[0]).toHaveProperty('unlocked')
    })
  })

  describe('Game Mode Toggle', () => {
    it('should toggle game mode on', () => {
      gameManager.toggleGameMode()
      const state = gameManager.getGameState()
      expect(state.isEnabled).toBe(true)
    })

    it('should toggle game mode off', () => {
      gameManager.toggleGameMode()
      gameManager.toggleGameMode()
      const state = gameManager.getGameState()
      expect(state.isEnabled).toBe(false)
    })
  })

  describe('Progress Updates', () => {
    beforeEach(() => {
      gameManager.toggleGameMode() // Enable game mode
    })

    it('should track puzzle completion', () => {
      gameManager.updateProgress('puzzle_completed', { id: 'puzzle1', points: 100 })
      const state = gameManager.getGameState()
      expect(state.puzzlesCompleted).toContain('puzzle1')
      expect(state.totalScore).toBeGreaterThanOrEqual(100)
    })

    it('should track command usage', () => {
      gameManager.updateProgress('command_used', { command: 'ls' })
      const state = gameManager.getGameState()
      expect(state.commandsUsed).toContain('ls')
    })

    it('should track hint usage', () => {
      const initialScore = gameManager.getGameState().totalScore
      gameManager.updateProgress('hint_used', { id: 'hint1' })
      const state = gameManager.getGameState()
      expect(state.hintsUsed).toBe(1)
      expect(state.totalScore).toBeLessThan(initialScore)
    })

    it('should not track when game mode is disabled', () => {
      gameManager.toggleGameMode() // Disable
      gameManager.updateProgress('puzzle_completed', { id: 'puzzle1', points: 100 })
      const state = gameManager.getGameState()
      expect(state.puzzlesCompleted).toHaveLength(0)
    })
  })

  describe('Milestone Completion', () => {
    beforeEach(() => {
      gameManager.toggleGameMode()
    })

    it('should complete command milestone', () => {
      gameManager.updateProgress('command_used', { command: 'ls' })
      const state = gameManager.getGameState()
      const lsMilestone = state.milestones.find(m => m.target === 'ls')
      expect(lsMilestone?.completed).toBe(true)
    })

    it('should award points for milestone completion', () => {
      const initialScore = gameManager.getGameState().totalScore
      gameManager.updateProgress('command_used', { command: 'ls' })
      const finalScore = gameManager.getGameState().totalScore
      expect(finalScore).toBeGreaterThan(initialScore)
    })
  })

  describe('Score Calculation', () => {
    beforeEach(() => {
      gameManager.toggleGameMode()
    })

    it('should calculate total score', () => {
      const score = gameManager.getScore()
      expect(score).toHaveProperty('total')
      expect(score).toHaveProperty('puzzleScore')
      expect(score).toHaveProperty('commandScore')
    })

    it('should include hint penalty', () => {
      gameManager.updateProgress('hint_used', { id: 'hint1' })
      const score = gameManager.getScore()
      expect(score.hintPenalty).toBeLessThan(0)
    })
  })

  describe('Victory Conditions', () => {
    it('should check victory conditions', () => {
      const conditions = gameManager.checkVictoryConditions()
      expect(Array.isArray(conditions)).toBe(true)
      expect(conditions.length).toBeGreaterThan(0)
    })

    it('should track progress toward victory', () => {
      gameManager.toggleGameMode()
      gameManager.updateProgress('puzzle_completed', { id: 'puzzle1', points: 100 })
      const conditions = gameManager.checkVictoryConditions()
      const puzzleCondition = conditions.find(c => c.type === 'puzzle_completion')
      expect(puzzleCondition?.current).toBeGreaterThan(0)
    })
  })

  describe('State Persistence', () => {
    it('should save state to localStorage', () => {
      gameManager.toggleGameMode()
      gameManager.updateProgress('puzzle_completed', { id: 'puzzle1', points: 100 })
      
      const saved = localStorage.getItem('game-progression-state')
      expect(saved).not.toBeNull()
      
      const parsed = JSON.parse(saved)
      expect(parsed.puzzlesCompleted).toContain('puzzle1')
    })

    it('should load state from localStorage', () => {
      gameManager.toggleGameMode()
      gameManager.updateProgress('puzzle_completed', { id: 'puzzle1', points: 100 })
      
      // Create new instance to test loading
      const newManager = GameStateManager.getInstance()
      const state = newManager.getGameState()
      expect(state.puzzlesCompleted).toContain('puzzle1')
    })
  })

  describe('Progress Reset', () => {
    it('should reset all progress', () => {
      gameManager.toggleGameMode()
      gameManager.updateProgress('puzzle_completed', { id: 'puzzle1', points: 100 })
      gameManager.resetProgress()
      
      const state = gameManager.getGameState()
      expect(state.puzzlesCompleted).toHaveLength(0)
      expect(state.totalScore).toBe(0)
      expect(state.isEnabled).toBe(false)
    })
  })

  describe('Session Management', () => {
    it('should save session data', () => {
      gameManager.toggleGameMode()
      gameManager.updateProgress('puzzle_completed', { id: 'puzzle1', points: 100 })
      gameManager.saveSession()
      
      const saved = localStorage.getItem('game-session')
      expect(saved).not.toBeNull()
    })

    it('should load session data', () => {
      gameManager.toggleGameMode()
      gameManager.updateProgress('puzzle_completed', { id: 'puzzle1', points: 100 })
      gameManager.saveSession()
      
      const session = gameManager.loadSession()
      expect(session).not.toBeNull()
      expect(session.puzzlesCompleted).toBeGreaterThan(0)
    })
  })
})

