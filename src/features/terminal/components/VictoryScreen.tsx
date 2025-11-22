/**
 * Victory Screen Component
 * 
 * This component displays the victory screen when game completion conditions are met.
 * It shows achievements, final score, and completion statistics.
 */

import React, { useState, useEffect } from 'react'
import { GameStateManager } from '../services/gameState'
import { VictoryCondition, GameAchievement, GameScore } from '@/features/shared/types/game'

interface VictoryScreenProps {
  isVisible: boolean
  onClose: () => void
}

export default function VictoryScreen({ isVisible, onClose }: VictoryScreenProps) {
  const [victoryConditions, setVictoryConditions] = useState<VictoryCondition[]>([])
  const [achievements, setAchievements] = useState<GameAchievement[]>([])
  const [finalScore, setFinalScore] = useState<GameScore | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  const gameManager = GameStateManager.getInstance()

  useEffect(() => {
    if (isVisible) {
      updateVictoryData()
      setShowCelebration(true)
      
      // Auto-hide celebration after 3 seconds
      setTimeout(() => setShowCelebration(false), 3000)
    }
  }, [isVisible])

  const updateVictoryData = () => {
    const conditions = gameManager.checkVictoryConditions()
    const gameState = gameManager.getGameState()
    const score = gameManager.getScore()
    
    setVictoryConditions(conditions)
    setAchievements(gameState.achievements.filter((a: GameAchievement) => a.unlocked))
    setFinalScore(score)
  }

  const handleNewGame = () => {
    gameManager.resetProgress()
    onClose()
  }

  const handleContinue = () => {
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700">
          {showCelebration && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-6xl animate-bounce">🎉</div>
            </div>
          )}
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Victory Achieved!
          </h1>
          <p className="text-gray-300 text-center">
            Congratulations on completing the terminal challenge!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Final Score */}
          {finalScore && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-3">Final Score</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Total Score:</span>
                    <span className="text-white font-medium">{finalScore.total}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Puzzle Score:</span>
                    <span className="text-green-400">{finalScore.puzzleScore}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Command Score:</span>
                    <span className="text-blue-400">{finalScore.commandScore}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Exploration Score:</span>
                    <span className="text-purple-400">{finalScore.explorationScore}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Hint Penalty:</span>
                    <span className="text-red-400">{finalScore.hintPenalty}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Time Bonus:</span>
                    <span className="text-yellow-400">{finalScore.timeBonus}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Victory Conditions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-3">Victory Conditions</h2>
            <div className="space-y-2">
              {victoryConditions.map((condition) => (
                <div key={condition.id} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    condition.completed ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{condition.name}</div>
                    <div className="text-gray-400 text-sm">{condition.description}</div>
                    <div className="text-gray-500 text-xs">
                      Progress: {condition.current}/{condition.target} ({condition.points} points)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-3">Achievements Unlocked</h2>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{achievement.name}</div>
                    <div className="text-gray-400 text-xs">{achievement.description}</div>
                    <div className="text-yellow-400 text-xs">+{achievement.points} points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-3">Game Statistics</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Puzzles Completed:</span>
                  <span className="text-white">{achievements.length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Commands Used:</span>
                  <span className="text-white">{finalScore?.commandScore ? finalScore.commandScore / 10 : 0}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Hints Used:</span>
                  <span className="text-white">{Math.abs(finalScore?.hintPenalty || 0) / 10}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Completion Time:</span>
                  <span className="text-white">N/A</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700 flex space-x-4">
          <button
            onClick={handleNewGame}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            New Game
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            Continue Playing
          </button>
        </div>
      </div>
    </div>
  )
}
