/**
 * Game Progress Component
 * 
 * This component displays detailed game progress information including
 * milestones, achievements, and progress statistics.
 */

import React, { useState, useEffect } from 'react'
import { GameStateManager } from '../services/gameState'
import { GameProgress as GameProgressType, GameMilestone, GameAchievement } from '@/features/shared/types/game'

interface GameProgressProps {
  isVisible: boolean
  onClose: () => void
}

export default function GameProgress({ isVisible, onClose }: GameProgressProps) {
  const [progress, setProgress] = useState<GameProgressType | null>(null)
  const [milestones, setMilestones] = useState<GameMilestone[]>([])
  const [achievements, setAchievements] = useState<GameAchievement[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'achievements'>('overview')

  const gameManager = GameStateManager.getInstance()

  useEffect(() => {
    if (isVisible) {
      updateProgressData()
    }
  }, [isVisible])

  const updateProgressData = () => {
    const gameProgress = gameManager.getProgress()
    const gameState = gameManager.getGameState()
    
    setProgress(gameProgress)
    setMilestones(gameState.milestones)
    setAchievements(gameState.achievements)
  }

  if (!isVisible || !progress) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Game Progress</h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'milestones'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Milestones
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Achievements
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Progress Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Puzzle Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Completed</span>
                      <span>{progress.completedPuzzles}/{progress.totalPuzzles}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress.completionPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm text-gray-400">
                      {progress.completionPercentage}% Complete
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Command Usage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Used</span>
                      <span>{progress.usedCommands}/{progress.totalCommands}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((progress.usedCommands / progress.totalCommands) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm text-gray-400">
                      {Math.round((progress.usedCommands / progress.totalCommands) * 100)}% Complete
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{progress.completedPuzzles}</div>
                  <div className="text-sm text-gray-400">Puzzles</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{progress.usedCommands}</div>
                  <div className="text-sm text-gray-400">Commands</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{progress.foundFlags}</div>
                  <div className="text-sm text-gray-400">Flags</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{progress.currentStreak}</div>
                  <div className="text-sm text-gray-400">Streak</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>• Last puzzle completed: {progress.completedPuzzles > 0 ? 'Recently' : 'None'}</div>
                  <div>• Last command used: {progress.usedCommands > 0 ? 'Recently' : 'None'}</div>
                  <div>• Current streak: {progress.currentStreak} days</div>
                  <div>• Longest streak: {progress.longestStreak} days</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-4 h-4 rounded-full mt-1 ${
                        milestone.completed ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium">{milestone.name}</h4>
                          <span className="text-yellow-400 text-sm">{milestone.points}pts</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{milestone.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            milestone.difficulty === 'easy' ? 'bg-green-600' :
                            milestone.difficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {milestone.difficulty}
                          </span>
                          {milestone.completed && milestone.completedAt && (
                            <span className="text-gray-500 text-xs">
                              Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`rounded-lg p-4 ${
                    achievement.unlocked ? 'bg-gray-800' : 'bg-gray-900 opacity-60'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${
                            achievement.unlocked ? 'text-white' : 'text-gray-500'
                          }`}>
                            {achievement.name}
                          </h4>
                          <span className="text-yellow-400 text-sm">{achievement.points}pts</span>
                        </div>
                        <p className={`text-sm mt-1 ${
                          achievement.unlocked ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            achievement.category === 'exploration' ? 'bg-blue-600' :
                            achievement.category === 'mastery' ? 'bg-purple-600' :
                            achievement.category === 'speed' ? 'bg-red-600' :
                            achievement.category === 'discovery' ? 'bg-green-600' : 'bg-yellow-600'
                          }`}>
                            {achievement.category}
                          </span>
                          {achievement.unlocked && achievement.unlockedAt && (
                            <span className="text-gray-500 text-xs">
                              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={updateProgressData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
