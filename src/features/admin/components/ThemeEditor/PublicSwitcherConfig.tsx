'use client'

import { useState, useEffect } from 'react'
import '@/features/admin/styles/public-switcher-config.css'

interface PublicSwitcherConfigProps {
  config: {
    enabled: boolean
    allowThemeSwitch: boolean
    allowDesignSwitch: boolean
    availableThemes?: string[]
    availableDesigns?: string[]
    switcherType: 'separate' | 'combined'
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  }
  availableThemes: string[]
  availableDesigns: string[]
  onConfigChange: (config: any) => void
}

export default function PublicSwitcherConfig({
  config,
  availableThemes,
  availableDesigns,
  onConfigChange
}: PublicSwitcherConfigProps) {
  const [localConfig, setLocalConfig] = useState(config)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleChange = (field: string, value: any) => {
    const newConfig = {
      ...localConfig,
      [field]: value
    }
    setLocalConfig(newConfig)
    onConfigChange(newConfig)
  }

  const handleThemeToggle = (themeId: string) => {
    const currentThemes = localConfig.availableThemes || []
    const newThemes = currentThemes.includes(themeId)
      ? currentThemes.filter(t => t !== themeId)
      : [...currentThemes, themeId]
    handleChange('availableThemes', newThemes)
  }

  const handleDesignToggle = (designId: string) => {
    const currentDesigns = localConfig.availableDesigns || []
    const newDesigns = currentDesigns.includes(designId)
      ? currentDesigns.filter(d => d !== designId)
      : [...currentDesigns, designId]
    handleChange('availableDesigns', newDesigns)
  }

  const selectedThemes = localConfig.availableThemes || []
  const selectedDesigns = localConfig.availableDesigns || []

  return (
    <div className="public-switcher-config">
      <div className="public-switcher-config__section">
        <div className="public-switcher-config__header">
          <h3 className="public-switcher-config__title">Public Switcher</h3>
          <label className="public-switcher-config__toggle">
            <input
              type="checkbox"
              checked={localConfig.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
            />
            <span className="public-switcher-config__toggle-label">
              {localConfig.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
        <p className="public-switcher-config__description">
          Allow visitors to switch themes and designs on the public site.
        </p>
      </div>

      {localConfig.enabled && (
        <>
          {/* Switcher Type */}
          <div className="public-switcher-config__section">
            <label className="public-switcher-config__label">
              Switcher Type
            </label>
            <div className="public-switcher-config__radio-group">
              <label className="public-switcher-config__radio">
                <input
                  type="radio"
                  name="switcherType"
                  value="combined"
                  checked={localConfig.switcherType === 'combined'}
                  onChange={(e) => handleChange('switcherType', e.target.value)}
                />
                <span>Combined (Themes + Designs together)</span>
              </label>
              <label className="public-switcher-config__radio">
                <input
                  type="radio"
                  name="switcherType"
                  value="separate"
                  checked={localConfig.switcherType === 'separate'}
                  onChange={(e) => handleChange('switcherType', e.target.value)}
                />
                <span>Separate (Themes and Designs separately)</span>
              </label>
            </div>
          </div>

          {/* Position Selector */}
          <div className="public-switcher-config__section">
            <label className="public-switcher-config__label">
              Position
            </label>
            <select
              value={localConfig.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="public-switcher-config__select"
            >
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </div>

          {/* Allow Theme Switch */}
          <div className="public-switcher-config__section">
            <label className="public-switcher-config__toggle">
              <input
                type="checkbox"
                checked={localConfig.allowThemeSwitch}
                onChange={(e) => handleChange('allowThemeSwitch', e.target.checked)}
              />
              <span className="public-switcher-config__toggle-label">
                Allow Theme Switching
              </span>
            </label>
            <p className="public-switcher-config__help">
              Enable visitors to switch between themes (e.g., dark/light).
            </p>
          </div>

          {/* Allow Design Switch */}
          <div className="public-switcher-config__section">
            <label className="public-switcher-config__toggle">
              <input
                type="checkbox"
                checked={localConfig.allowDesignSwitch}
                onChange={(e) => handleChange('allowDesignSwitch', e.target.checked)}
              />
              <span className="public-switcher-config__toggle-label">
                Allow Design Switching
              </span>
            </label>
            <p className="public-switcher-config__help">
              Enable visitors to switch between designs (e.g., glassmorphism, cyberpunk).
            </p>
          </div>

          {/* Available Themes (only if allowThemeSwitch is enabled) */}
          {localConfig.allowThemeSwitch && (
            <div className="public-switcher-config__section">
              <label className="public-switcher-config__label">
                Available Themes
              </label>
              <p className="public-switcher-config__help">
                Select which themes visitors can choose from. Leave empty to show all enabled themes.
              </p>
              <div className="public-switcher-config__checkbox-group">
                {availableThemes.map((themeId) => (
                  <label key={themeId} className="public-switcher-config__checkbox">
                    <input
                      type="checkbox"
                      checked={selectedThemes.includes(themeId)}
                      onChange={() => handleThemeToggle(themeId)}
                    />
                    <span>{themeId.charAt(0).toUpperCase() + themeId.slice(1)}</span>
                  </label>
                ))}
              </div>
              {selectedThemes.length === 0 && (
                <p className="public-switcher-config__info">
                  All enabled themes will be available.
                </p>
              )}
            </div>
          )}

          {/* Available Designs (only if allowDesignSwitch is enabled) */}
          {localConfig.allowDesignSwitch && (
            <div className="public-switcher-config__section">
              <label className="public-switcher-config__label">
                Available Designs
              </label>
              <p className="public-switcher-config__help">
                Select which designs visitors can choose from. Leave empty to show all enabled designs.
              </p>
              <div className="public-switcher-config__checkbox-group">
                {availableDesigns.map((designId) => (
                  <label key={designId} className="public-switcher-config__checkbox">
                    <input
                      type="checkbox"
                      checked={selectedDesigns.includes(designId)}
                      onChange={() => handleDesignToggle(designId)}
                    />
                    <span>{designId.charAt(0).toUpperCase() + designId.slice(1).replace(/-/g, ' ')}</span>
                  </label>
                ))}
              </div>
              {selectedDesigns.length === 0 && (
                <p className="public-switcher-config__info">
                  All enabled designs will be available.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

