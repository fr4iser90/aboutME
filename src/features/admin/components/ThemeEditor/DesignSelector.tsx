'use client'

import { useMemo, useState } from 'react'
import { THEME_PRESETS } from '@/features/shared/utils/themePresets'
import type { DesignConfig } from '@/features/shared/types/design'

interface DesignSelectorProps {
  designs: Record<string, DesignConfig>
  selectedDesign: string
  onDesignSelect: (designId: string) => void
  defaultDesign?: string
}

const PRESET_DESIGN_IDS = new Set<string>(
  THEME_PRESETS.map((p) => p.design)
)

export default function DesignSelector({ designs, selectedDesign, onDesignSelect, defaultDesign }: DesignSelectorProps) {
  const [showAll, setShowAll] = useState(false)

  const designIcons: Record<string, string> = {
    glassmorphism: 'Gl',
    flat: 'Fl',
    minimal: 'Mi',
    clean: 'Cl',
  }

  const entries = useMemo(() => {
    return Object.entries(designs)
      .filter(([id]) => showAll || PRESET_DESIGN_IDS.has(id) || id === selectedDesign || id === defaultDesign)
      .sort(([a], [b]) => {
        const aProd = PRESET_DESIGN_IDS.has(a)
        const bProd = PRESET_DESIGN_IDS.has(b)
        if (aProd && !bProd) return -1
        if (!aProd && bProd) return 1
        return a.localeCompare(b)
      })
  }, [designs, showAll, selectedDesign, defaultDesign])

  const archivedCount = Object.keys(designs).length - PRESET_DESIGN_IDS.size

  return (
    <div className="design-selector">
      <div className="design-selector__header" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 className="design-selector__title" style={{ margin: 0 }}>Select Design</h3>
        {archivedCount > 0 && (
          <button
            type="button"
            className="appearance-editor__btn"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? 'Show presets only' : `Show all (${archivedCount} extra)`}
          </button>
        )}
      </div>
      <div className="design-selector__grid">
        {entries.map(([id, design]) => (
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
              {designIcons[id] || '·'}
            </div>
            <div className="design-selector__name">{design.name}</div>
            <div className="design-selector__description">{design.description}</div>
            {PRESET_DESIGN_IDS.has(id) && (
              <div className="design-selector__badge">Preset</div>
            )}
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
