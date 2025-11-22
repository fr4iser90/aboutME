/**
 * Game Progression Integration Tests
 * 
 * Integration tests for the complete game progression system
 */

import { GameStateManager } from '../../src/lib/gameState'
import { ProgressTracker } from '../../src/lib/progressTracker'
import { HintSystem } from '../../src/lib/hintSystem'

describe('Game Progression Integration', () => {
  let gameManager
  let progressTracker
  let hintSystem

  beforeEach(() => {
    localStorage.clear()
    gameManager = GameStateManager.getInstance()
    progressTracker = new ProgressTracker()
    hintSystem = new HintSystem()
    gameManager.toggleGameMode() // Enable game mode
  })

  afterEach(() => {
    gameManager.resetProgress()
    progressTracker.resetHistory()
    hintSystem.clearCache()
  })

  describe('Complete Game Flow', () => {
    it('should track complete game progression', () => {
      // User logs in
      progressTracker.trackCommand('login', [])
      
      // User explores directories
      progressTracker.trackPath('/home/user')
      progressTracker.trackCommand('ls', ['-la'])
      progressTracker.trackCommand('cd', ['/home/user'])
      
      // User finds a puzzle
      progressTracker.trackPuzzleCompletion('puzzle1', 100)
      
      // Check progress
      const stats = progressTracker.getProgressStats()
      expect(stats.commandsUsed).toBeGreaterThan(0)
      expect(stats.pathsExplored).toBeGreaterThan(0)
      expect(stats.puzzlesCompleted).toBe(1)
    })

    it('should award achievements based on progress', () => {
      // Complete multiple commands
      for (let i = 0; i < 10; i++) {
        progressTracker.trackCommand(`command${i}`, [])
      }
      
      const state = gameManager.getGameState()
      const terminalMaster = state.achievements.find(a => a.id === 'terminal_master')
      expect(terminalMaster?.unlocked).toBe(true)
    })

    it('should complete milestones progressively', () => {
      // Track first login
      progressTracker.trackCommand('login', [])
      
      let state = gameManager.getGameState()
      let firstLogin = state.milestones.find(m => m.id === 'first_login')
      expect(firstLogin?.completed).toBe(true)
      
      // Track ls command
      progressTracker.trackCommand('ls', [])
      
      state = gameManager.getGameState()
      let lsMilestone = state.milestones.find(m => m.id === 'use_ls_command')
      expect(lsMilestone?.completed).toBe(true)
    })
  })

  describe('Hint System Integration', () => {
    it('should generate contextual hints', () => {
      const hint = hintSystem.generateHint('exploration', 'general')
      expect(hint).not.toBeNull()
      expect(hint.content).toBeDefined()
      expect(hint.cost).toBeGreaterThan(0)
    })

    it('should deduct score when using hints', () => {
      const initialScore = gameManager.getGameState().totalScore
      
      const hint = hintSystem.generateHint('exploration', 'general')
      if (hint) {
        hintSystem.useHint(hint.id)
      }
      
      const finalScore = gameManager.getGameState().totalScore
      expect(finalScore).toBeLessThan(initialScore)
    })

    it('should limit hint usage', () => {
      // Use maximum hints
      for (let i = 0; i < 6; i++) {
        const hint = hintSystem.generateHint(`context${i}`, 'general')
        if (hint) {
          hintSystem.useHint(hint.id)
        }
      }
      
      const state = gameManager.getGameState()
      expect(state.hintsUsed).toBeLessThanOrEqual(5)
    })

    it('should provide contextual hints based on location', () => {
      const homeHint = hintSystem.getContextualHint('/home/user', 'ls')
      expect(homeHint).not.toBeNull()
      
      const binHint = hintSystem.getContextualHint('/usr/bin', 'ls')
      expect(binHint).not.toBeNull()
    })
  })

  describe('Victory Condition Integration', () => {
    it('should check multiple victory conditions', () => {
      // Complete several puzzles
      for (let i = 0; i < 5; i++) {
        progressTracker.trackPuzzleCompletion(`puzzle${i}`, 100)
      }
      
      const conditions = gameManager.checkVictoryConditions()
      const puzzleCondition = conditions.find(c => c.id === 'puzzle_master')
      expect(puzzleCondition?.current).toBe(5)
    })

    it('should mark conditions as completed when met', () => {
      // Add enough score to meet threshold
      for (let i = 0; i < 10; i++) {
        progressTracker.trackPuzzleCompletion(`puzzle${i}`, 100)
      }
      
      const conditions = gameManager.checkVictoryConditions()
      const scoreCondition = conditions.find(c => c.id === 'score_threshold')
      expect(scoreCondition?.completed).toBe(true)
    })
  })

  describe('Progress Persistence Integration', () => {
    it('should persist complete game state', () => {
      // Make progress
      progressTracker.trackCommand('ls', [])
      progressTracker.trackPath('/home/user')
      progressTracker.trackPuzzleCompletion('puzzle1', 100)
      
      // Save session
      gameManager.saveSession()
      
      // Verify persistence
      const saved = localStorage.getItem('game-progression-state')
      expect(saved).not.toBeNull()
      
      const session = gameManager.loadSession()
      expect(session).not.toBeNull()
      expect(session.puzzlesCompleted).toBeGreaterThan(0)
    })

    it('should restore state after reset', () => {
      // Make progress
      progressTracker.trackPuzzleCompletion('puzzle1', 100)
      const initialScore = gameManager.getGameState().totalScore
      
      // Create new instances to simulate reload
      const newManager = GameStateManager.getInstance()
      const newState = newManager.getGameState()
      
      expect(newState.totalScore).toBe(initialScore)
      expect(newState.puzzlesCompleted).toContain('puzzle1')
    })
  })

  describe('Score Calculation Integration', () => {
    it('should calculate complete score breakdown', () => {
      // Complete various activities
      progressTracker.trackPuzzleCompletion('puzzle1', 100)
      progressTracker.trackCommand('ls', [])
      progressTracker.trackCommand('cd', [])
      
      const score = gameManager.getScore()
      expect(score.total).toBeGreaterThan(0)
      expect(score.puzzleScore).toBeGreaterThan(0)
      expect(score.commandScore).toBeGreaterThan(0)
    })

    it('should apply hint penalties to total score', () => {
      progressTracker.trackPuzzleCompletion('puzzle1', 100)
      const scoreBeforeHint = gameManager.getScore().total
      
      const hint = hintSystem.generateHint('test', 'general')
      if (hint) {
        hintSystem.useHint(hint.id)
      }
      
      const scoreAfterHint = gameManager.getScore().total
      expect(scoreAfterHint).toBeLessThan(scoreBeforeHint)
    })
  })

  describe('Progress Export Integration', () => {
    it('should export complete progress data', () => {
      // Make progress
      progressTracker.trackCommand('ls', [])
      progressTracker.trackPath('/home/user')
      progressTracker.trackPuzzleCompletion('puzzle1', 100)
      
      const exportData = progressTracker.exportProgressData()
      expect(exportData).toBeDefined()
      
      const parsed = JSON.parse(exportData)
      expect(parsed.gameState).toBeDefined()
      expect(parsed.progress).toBeDefined()
      expect(parsed.score).toBeDefined()
    })
  })
})

