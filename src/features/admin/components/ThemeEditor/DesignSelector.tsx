'use client'

import type { DesignConfig } from '@/features/shared/types/design'

interface DesignSelectorProps {
  designs: Record<string, DesignConfig>
  selectedDesign: string
  onDesignSelect: (designId: string) => void
  defaultDesign?: string
}

export default function DesignSelector({ designs, selectedDesign, onDesignSelect, defaultDesign }: DesignSelectorProps) {
  const designIcons: Record<string, string> = {
    glassmorphism: '✨',
    flat: '⬜',
    minimal: '▫️'
  }

  return (
    <div className="design-selector">
      <h3 className="design-selector__title">Select Design</h3>
      <div className="design-selector__grid">
        {Object.entries(designs).map(([id, design]) => (
          <button
            key={id}
            type="button"
            className={`design-selector__card ${
              selectedDesign === id ? 'design-selector__card--selected' : ''
            } ${!design.enabled ? 'design-selector__card--disabled' : ''}`}
            onClick={() => design.enabled && onDesignSelect(id)}
            disabled={!design.enabled}
          >
            <div className="design-selector__icon">
              {designIcons[id] || '🎨'}
            </div>
            <div className="design-selector__name">{design.name}</div>
            <div className="design-selector__description">{design.description}</div>
            {defaultDesign === id && (
              <div className="design-selector__badge design-selector__badge--default">Default</div>
            )}
            {!design.enabled && (
              <div className="design-selector__badge design-selector__badge--disabled">Disabled</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

