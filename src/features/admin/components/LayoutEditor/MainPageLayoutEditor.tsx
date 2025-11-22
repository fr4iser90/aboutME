'use client'

import { useState, useEffect } from 'react'
import LayoutTemplateSelector from './LayoutTemplateSelector'
import { 
  getMainPageLayout, 
  saveMainPageLayout,
  getGlobalLayout,
  saveGlobalLayout,
  type MainPageLayoutConfig,
  type MainPageLayoutType,
  type GlobalLayoutConfig,
  type PageLayoutType,
  type DisplayMode
} from '@/features/shared/utils/layoutConfig'

interface MainPageLayoutEditorProps {
  onSave?: () => void
}

const mainPageLayouts: Array<{
  id: MainPageLayoutType
  name: string
  description: string
}> = [
  { id: 'portfolio', name: 'Portfolio', description: 'Classic portfolio layout' },
  { id: 'dashboard', name: 'Dashboard', description: 'Compact dashboard view' },
  { id: 'magazine', name: 'Magazine', description: 'Editorial magazine style' },
  { id: 'minimal', name: 'Minimal', description: 'Clean minimal design' },
  { id: 'grid', name: 'Grid', description: 'Masonry grid layout' },
  { id: 'split-screen', name: 'Split Screen', description: '50/50 split layout' },
  { id: 'hero-content', name: 'Hero Content', description: 'Hero section with content' },
  { id: 'carousel', name: 'Carousel', description: 'Carousel-based layout' },
  { id: 'sticky-sidebar', name: 'Sticky Sidebar', description: 'Sticky sidebar navigation' }
]

export default function MainPageLayoutEditor({ onSave }: MainPageLayoutEditorProps) {
  const [config, setConfig] = useState<MainPageLayoutConfig>({
    layout: 'portfolio'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      const loadedConfig = await getMainPageLayout()
      setConfig(loadedConfig)
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load layout configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleLayoutChange = (layout: MainPageLayoutType) => {
    setConfig({ layout })
    setHasChanges(true)
    setSuccess(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      await saveMainPageLayout(config)
      setHasChanges(false)
      setSuccess('Main page layout configuration saved successfully')
      if (onSave) {
        onSave()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    loadConfig()
  }

  if (loading) {
    return (
      <div className="global-layout-editor">
        <div className="global-layout-editor__loading">Loading layout configuration...</div>
      </div>
    )
  }

  return (
    <div className="global-layout-editor">
      <div className="global-layout-editor__header">
        <h2 className="global-layout-editor__title">Main Page Layout Configuration</h2>
        <p className="global-layout-editor__description">
          Configure how the main page is structured (portfolio, dashboard, magazine, etc.)
        </p>
      </div>

      {error && (
        <div className="global-layout-editor__error">
          {error}
        </div>
      )}

      {success && (
        <div className="global-layout-editor__success">
          {success}
        </div>
      )}

      <div className="global-layout-editor__content">
        {/* Main Page Layout Selector */}
        <div className="global-layout-editor__section">
          <h3 className="global-layout-editor__section-title">Main Page Layout</h3>
          <div className="global-layout-editor__display-modes">
            {mainPageLayouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => handleLayoutChange(layout.id)}
                className={`global-layout-editor__mode-card ${
                  config.layout === layout.id ? 'global-layout-editor__mode-card--selected' : ''
                }`}
              >
                <div className="global-layout-editor__mode-name">{layout.name}</div>
                <div className="global-layout-editor__mode-description">{layout.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="global-layout-editor__actions">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="global-layout-editor__btn global-layout-editor__btn--primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleCancel}
          disabled={!hasChanges || saving}
          className="global-layout-editor__btn global-layout-editor__btn--secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

