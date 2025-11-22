'use client'

interface EditorTabsProps {
  activeTab: 'content' | 'appearance' | 'preview'
  onTabChange: (tab: 'content' | 'appearance' | 'preview') => void
  splitView?: boolean
  onSplitViewToggle?: () => void
}

export default function EditorTabs({ 
  activeTab, 
  onTabChange,
  splitView = false,
  onSplitViewToggle
}: EditorTabsProps) {
  const tabs = [
    { id: 'content' as const, label: 'Content', icon: '📝' },
    { id: 'appearance' as const, label: 'Appearance', icon: '🎨' },
    { id: 'preview' as const, label: 'Preview', icon: '👁️' }
  ]

  return (
    <div className="editor-tabs">
      <div className="editor-tabs__list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`editor-tabs__tab ${
              activeTab === tab.id ? 'editor-tabs__tab--active' : ''
            }`}
          >
            <span className="editor-tabs__icon">{tab.icon}</span>
            <span className="editor-tabs__label">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {onSplitViewToggle && activeTab === 'content' && (
        <div className="editor-tabs__actions">
          <button
            onClick={onSplitViewToggle}
            className={`editor-tabs__split-toggle ${
              splitView ? 'editor-tabs__split-toggle--active' : ''
            }`}
            title={splitView ? 'Disable Split View' : 'Enable Split View'}
          >
            {splitView ? '↔️ Split View ON' : '↔️ Split View'}
          </button>
        </div>
      )}
    </div>
  )
}

