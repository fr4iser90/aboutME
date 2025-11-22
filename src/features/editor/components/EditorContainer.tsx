'use client'

import { useState, ReactNode } from 'react'
import TerminalEditor from '@/features/terminal/components/TerminalEditor'

interface EditorContainerProps {
  contentEditor: ReactNode
}

type TabType = 'content' | 'terminal' | 'settings'

export default function EditorContainer({ contentEditor }: EditorContainerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('content')

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'content', label: 'Content Editor', icon: '📝' },
    { id: 'terminal', label: 'Terminal Editor', icon: '💻' }
    // Settings tab can be added later
  ]

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Navigation */}
      <div style={{
        background: '#1e1e1e',
        borderBottom: '1px solid #333',
        display: 'flex',
        gap: '0'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab.id ? '#2a2a2a' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #00d4ff' : '2px solid transparent',
              color: activeTab === tab.id ? '#00d4ff' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ marginRight: '8px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'content' && contentEditor}
        {activeTab === 'terminal' && <TerminalEditor />}
      </div>
    </div>
  )
}

export type { TabType }

