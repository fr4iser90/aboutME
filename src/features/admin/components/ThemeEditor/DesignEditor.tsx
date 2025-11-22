'use client'

import { useState, useEffect } from 'react'
import type { DesignConfig } from '@/features/shared/types/design'
import EffectSelector from './EffectSelector'
import BackgroundImageSelector from './BackgroundImageSelector'

interface DesignEditorProps {
  design: DesignConfig
  onDesignChange: (design: DesignConfig) => void
  onSetDefault?: () => void
  isDefault?: boolean
}

const layoutOptions = [
  { value: 'sidebar-left', label: 'Sidebar Left' },
  { value: 'sidebar-right', label: 'Sidebar Right' },
  { value: 'full-width', label: 'Full Width' },
  { value: 'two-column', label: 'Two Column' },
  { value: 'centered', label: 'Centered' },
  { value: 'masonry', label: 'Masonry' },
  { value: 'split-screen', label: 'Split Screen' },
  { value: 'hero-content', label: 'Hero Content' },
  { value: 'carousel-layout', label: 'Carousel Layout' },
  { value: 'sticky-sidebar', label: 'Sticky Sidebar' }
]

export default function DesignEditor({ design, onDesignChange, onSetDefault, isDefault }: DesignEditorProps) {
  const [localDesign, setLocalDesign] = useState(design)

  useEffect(() => {
    setLocalDesign(design)
  }, [design])

  const handleChange = (field: keyof DesignConfig, value: any) => {
    const updated = { ...localDesign, [field]: value }
    setLocalDesign(updated)
    onDesignChange(updated)
  }

  return (
    <div className="design-editor">
      <div className="design-editor__header">
        <h3 className="design-editor__title">{design.name}</h3>
        {isDefault && (
          <span className="design-editor__badge">Default</span>
        )}
        {onSetDefault && !isDefault && (
          <button
            onClick={onSetDefault}
            className="design-editor__btn design-editor__btn--secondary"
          >
            Set as Default
          </button>
        )}
      </div>

      <div className="design-editor__content">
        <div className="design-editor__field">
          <label className="design-editor__label">Name</label>
          <input
            type="text"
            value={localDesign.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="design-editor__input"
          />
        </div>

        <div className="design-editor__field">
          <label className="design-editor__label">Description</label>
          <textarea
            value={localDesign.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="design-editor__textarea"
            rows={3}
          />
        </div>

        <div className="design-editor__field">
          <label className="design-editor__label">
            <input
              type="checkbox"
              checked={localDesign.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="design-editor__checkbox"
            />
            Enabled
          </label>
        </div>

        <div className="design-editor__field">
          <EffectSelector
            value={localDesign.effect || 'glassmorphism'}
            onChange={(effect) => handleChange('effect', effect)}
          />
        </div>

        <div className="design-editor__field">
          <BackgroundImageSelector
            value={localDesign.backgroundImage || ''}
            onChange={(image) => handleChange('backgroundImage', image)}
          />
        </div>

        <div className="design-editor__field">
          <label className="design-editor__label">
            Default Layout:
            <select
              value={localDesign.defaultLayout || 'sidebar-left'}
              onChange={(e) => handleChange('defaultLayout', e.target.value)}
              className="design-editor__select"
            >
              {layoutOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}

