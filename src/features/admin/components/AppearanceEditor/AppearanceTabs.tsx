'use client'

interface AppearanceTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'design', name: 'Design System', icon: '🎨' },
  { id: 'themes', name: 'Themes', icon: '🌈' },
  { id: 'layout', name: 'Layout Settings', icon: '📐' },
  { id: 'switcher', name: 'Public Switcher', icon: '🔄' },
  { id: 'creator', name: 'Creator', icon: '➕' },
  { id: 'effects', name: 'Effects', icon: '✨' },
  { id: 'preview', name: 'Preview', icon: '👁️' }
]

export default function AppearanceTabs({ activeTab, onTabChange }: AppearanceTabsProps) {
  return (
    <div className="appearance-tabs">
      <div className="appearance-tabs__list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`appearance-tabs__tab ${
              activeTab === tab.id ? 'appearance-tabs__tab--active' : ''
            }`}
          >
            <span className="appearance-tabs__icon">{tab.icon}</span>
            <span className="appearance-tabs__name">{tab.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

