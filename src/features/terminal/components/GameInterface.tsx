/**
 * Game Interface Component
 * 
 * This component provides the main game interface with toggle controls,
 * progress display, and game state management.
 */

import React, { useState, useEffect } from 'react'
import { GameStateManager } from '../services/gameState'
import { GameState, GameProgress, GameScore } from '@/features/shared/types/game'

interface GameInterfaceProps {
  onGameModeToggle?: (enabled: boolean) => void
}

export default function GameInterface({ onGameModeToggle }: GameInterfaceProps) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [progress, setProgress] = useState<GameProgress | null>(null)
  const [score, setScore] = useState<GameScore | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  
  const gameManager = GameStateManager.getInstance()

  useEffect(() => {
    updateGameData()
  }, [])

  const updateGameData = () => {
    const state = gameManager.getGameState()
    const gameProgress = gameManager.getProgress()
    const gameScore = gameManager.getScore()
    
    setGameState(state)
    setProgress(gameProgress)
    setScore(gameScore)
  }

  const handleToggleGameMode = () => {
    gameManager.toggleGameMode()
    updateGameData()
    onGameModeToggle?.(gameManager.getGameState().isEnabled)
  }

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all game progress? This cannot be undone.')) {
      gameManager.resetProgress()
      updateGameData()
    }
  }

  if (!gameState || !progress || !score) {
    return null
  }

  return (
    <div className="game-interface">
      <div className={`game-interface__container ${isExpanded ? 'game-interface__container--expanded' : 'game-interface__container--collapsed'}`}>
        {/* Header */}
        <div className="game-interface__header">
          <div className="game-interface__status">
            <div className={`game-interface__indicator ${gameState.isEnabled ? 'game-interface__indicator--enabled' : 'game-interface__indicator--disabled'}`}></div>
            {isExpanded && (
              <span className="game-interface__title">
                {gameState.isEnabled ? 'Game Mode ON' : 'Game Mode OFF'}
              </span>
            )}
          </div>
          <div className="game-interface__controls">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="game-interface__toggle-btn"
            >
              {isExpanded ? '−' : '+'}
            </button>
            <button
              onClick={handleToggleGameMode}
              className={`game-interface__mode-btn ${gameState.isEnabled ? 'game-interface__mode-btn--enabled' : 'game-interface__mode-btn--disabled'}`}
            >
              {gameState.isEnabled ? 'OFF' : 'ON'}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="game-interface__content">
            {/* Progress Overview */}
            <div className="game-interface__section">
              <h3 className="game-interface__section-title">Progress</h3>
              <div className="game-interface__progress">
                <div className="game-interface__progress-info">
                  <span>Puzzles: {progress.completedPuzzles}/{progress.totalPuzzles}</span>
                  <span>{progress.completionPercentage}%</span>
                </div>
                <div className="game-interface__progress-bar">
                  <div 
                    className="game-interface__progress-fill"
                    style={{ width: `${progress.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Score Display */}
            <div className="game-interface__section">
              <h3 className="game-interface__section-title">Score</h3>
              <div className="game-interface__score-grid">
                <div className="game-interface__score-item">
                  <div className="game-interface__score-label">Total</div>
                  <div className="game-interface__score-value">{score.total}</div>
                </div>
                <div className="game-interface__score-item">
                  <div className="game-interface__score-label">Puzzles</div>
                  <div className="game-interface__score-value">{score.puzzleScore}</div>
                </div>
                <div className="game-interface__score-item">
                  <div className="game-interface__score-label">Commands</div>
                  <div className="game-interface__score-value">{score.commandScore}</div>
                </div>
                <div className="game-interface__score-item">
                  <div className="game-interface__score-label">Hints</div>
                  <div className="game-interface__score-value game-interface__score-value--negative">{score.hintPenalty}</div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="game-interface__section">
              <h3 className="game-interface__section-title">Milestones</h3>
              <div className="game-interface__milestones">
                {gameState.milestones.slice(0, 5).map((milestone) => (
                  <div key={milestone.id} className="game-interface__milestone">
                    <div className={`game-interface__milestone-dot ${milestone.completed ? 'game-interface__milestone-dot--completed' : 'game-interface__milestone-dot--pending'}`}></div>
                    <span className={`game-interface__milestone-text ${milestone.completed ? 'game-interface__milestone-text--completed' : ''}`}>
                      {milestone.name}
                    </span>
                    <span className="game-interface__milestone-points">({milestone.points}pts)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="game-interface__section">
              <h3 className="game-interface__section-title">Achievements</h3>
              <div className="game-interface__achievements">
                {gameState.achievements.filter(a => a.unlocked).slice(0, 6).map((achievement) => (
                  <div key={achievement.id} className="game-interface__achievement" title={achievement.description}>
                    {achievement.icon}
                  </div>
                ))}
                {gameState.achievements.filter(a => !a.unlocked).slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="game-interface__achievement game-interface__achievement--locked" title={achievement.description}>
                    {achievement.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="game-interface__actions">
              <button
                onClick={handleResetProgress}
                className="game-interface__action-btn game-interface__action-btn--reset"
              >
                Reset Progress
              </button>
              <button
                onClick={updateGameData}
                className="game-interface__action-btn game-interface__action-btn--refresh"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}