'use client'

import dynamic from 'next/dynamic'
import AdminPageLayout from '@/features/admin/components/AdminPageLayout'

// Lazy load TerminalEditor for better performance
const TerminalEditor = dynamic(
  () => import('@/features/terminal/components/TerminalEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="games-config__loading">
        Loading terminal editor...
      </div>
    )
  }
)

export default function GamesConfigPage() {
  const games = [
    { id: 'terminal', name: 'Terminal Game', icon: '💻', enabled: true, available: true },
    { id: 'snake', name: 'Snake', icon: '🐍', enabled: false, available: false },
    { id: 'pacman', name: 'Pacman', icon: '👻', enabled: false, available: false }
  ]

  return (
    <AdminPageLayout
      title="Games Configuration"
      subtitle="Configure available games for your portfolio"
      centered={false}
      maxWidth="full"
    >
      {/* Games List */}
      <div className="games-config__section">
        <h2 className="games-config__section-title">Available Games</h2>
        <div className="games-config__grid">
          {games.map((game) => (
            <div 
              key={game.id}
              className={`glass-card games-config__game ${!game.available ? 'games-config__game--unavailable' : ''}`}
            >
              <span className="games-config__game-icon">{game.icon}</span>
              <h3 className="games-config__game-name">{game.name}</h3>
              <span className={`games-config__game-status ${game.enabled ? 'games-config__game-status--active' : ''}`}>
                {game.enabled ? '● Active' : game.available ? '○ Inactive' : 'Coming Soon'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Game Configuration */}
      <div className="games-config__section">
        <h2 className="games-config__section-title">Terminal Game Configuration</h2>
        <p className="games-config__section-description">
          Configure terminal settings: hostname, username, password, and available commands.
        </p>
        <div className="glass-card games-config__terminal">
          <TerminalEditor />
        </div>
      </div>
    </AdminPageLayout>
  )
}
