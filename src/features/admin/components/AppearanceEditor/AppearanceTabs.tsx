'use client'

interface AppearanceTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'design', name: 'Design System', icon: 'D' },
  { id: 'themes', name: 'Themes', icon: 'Th' },
  { id: 'layout', name: 'Layout Settings', icon: 'La' },
  { id: 'switcher', name: 'Public Switcher', icon: 'Sw' },
  { id: 'creator', name: 'Creator', icon: 'Cr' },
  { id: 'effects', name: 'Effects', icon: 'Fx' },
  { id: 'preview', name: 'Preview', icon: 'V' }
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

