'use client'

import { useState, useEffect } from 'react'
import ThemeSelector from './ThemeSelector'
import ColorPicker from './ColorPicker'
import TypographyEditor from './TypographyEditor'
import EffectSlider from './EffectSlider'
import ThemePreview from './ThemePreview'
import DesignEditor from './DesignEditor'
import DesignSelector from './DesignSelector'
import BackgroundEditor from './BackgroundEditor'
import { applyThemeDesign, getCurrentTheme } from '@/features/shared/utils/themeDesign'
import type { DesignConfig } from '@/features/shared/types/design'
import '@/features/admin/styles/theme-editor.css'
import '@/features/admin/styles/theme-preview.css'

interface ThemeConfig {
  name: string
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
}

interface ThemeData {
  dark: ThemeConfig
  light: ThemeConfig
}

interface GlobalThemeConfig {
  enabled: boolean
  defaultTheme: string
  defaultDesign?: string
  themes: ThemeData
  designs?: Record<string, DesignConfig>
  persistChoice: boolean
  publicSwitcher?: {
    enabled: boolean
    allowThemeSwitch: boolean
    allowDesignSwitch: boolean
    availableThemes: string[]
    availableDesigns: string[]
    switcherType: 'separate' | 'combined'
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  }
}

export default function ThemeEditor() {
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark')
  const [selectedDesign, setSelectedDesign] = useState<string>('glassmorphism')
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)
  const [globalConfig, setGlobalConfig] = useState<GlobalThemeConfig | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Load theme configuration
  useEffect(() => {
    async function loadThemeConfig() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/admin/config/theme')
        if (!response.ok) throw new Error('Failed to load theme config')
        const data = await response.json()
        setGlobalConfig(data.config)
        setThemeConfig(data.config.themes[currentTheme])
        if (data.config.defaultDesign) {
          setSelectedDesign(data.config.defaultDesign)
        }
        
        // Load background config
        try {
          const bgResponse = await fetch('/data/config/config.json')
          if (bgResponse.ok) {
            const bgData = await bgResponse.json()
            const bgConfig = bgData.portfolio?.features?.background || bgData.features?.background
            if (bgConfig) {
              const bgImg = bgConfig.useDefault 
                ? bgConfig.defaultImage || '/assets/galaxy.png'
                : bgConfig.customImage
              setBackgroundImage(bgImg)
            }
          }
        } catch (bgErr) {
          // Background loading is optional, don't fail if it fails
          console.warn('Could not load background config:', bgErr)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load theme config')
      } finally {
        setLoading(false)
      }
    }
    loadThemeConfig()
  }, [])

  // Update theme config when current theme changes
  useEffect(() => {
    if (globalConfig) {
      setThemeConfig(globalConfig.themes[currentTheme])
      setHasChanges(false)
    }
  }, [currentTheme, globalConfig])

  // Update background image when design changes (for preview)
  useEffect(() => {
    // Background updates are handled by handleBackgroundChange
    // This effect ensures preview updates when design changes
  }, [selectedDesign])

  const handleThemeChange = (theme: 'dark' | 'light') => {
    setCurrentTheme(theme)
  }

  const handleColorChange = (colorKey: keyof ThemeConfig, value: string) => {
    if (!themeConfig || !globalConfig) return
    const updatedTheme = { ...themeConfig, [colorKey]: value }
    setThemeConfig(updatedTheme)
    setGlobalConfig({
      ...globalConfig,
      themes: {
        ...globalConfig.themes,
        [currentTheme]: updatedTheme
      }
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!globalConfig) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/config/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: globalConfig })
      })

      if (!response.ok) throw new Error('Failed to save')
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reload config to discard changes
    window.location.reload()
  }

  const handleDesignChange = (design: DesignConfig) => {
    if (!globalConfig) return
    setGlobalConfig({
      ...globalConfig,
      designs: {
        ...globalConfig.designs,
        [design.id]: design
      }
    })
    setHasChanges(true)
  }

  const handleSetDefaultDesign = () => {
    if (!globalConfig) return
    setGlobalConfig({
      ...globalConfig,
      defaultDesign: selectedDesign
    })
    setHasChanges(true)
  }

  const handleApplyDesign = () => {
    if (!selectedDesign) return
    const theme = getCurrentTheme() || currentTheme || 'dark'
    applyThemeDesign(theme, selectedDesign as any)
    // Also save to localStorage for persistence
    localStorage.setItem('portfolio-design', selectedDesign)
    localStorage.setItem('portfolio-theme', theme)
    
    // Optionally also set as default in config
    if (globalConfig) {
      setGlobalConfig({
        ...globalConfig,
        defaultDesign: selectedDesign
      })
      setHasChanges(true)
    }
  }

  const handlePublicSwitcherChange = (field: string, value: any) => {
    if (!globalConfig) return
    setGlobalConfig({
      ...globalConfig,
      publicSwitcher: {
        ...globalConfig.publicSwitcher,
        [field]: value
      } as any
    })
    setHasChanges(true)
  }

  const handleBackgroundChange = (bgConfig: { useDefault: boolean; defaultImage?: string; customImage?: string }) => {
    const bgImg = bgConfig.useDefault 
      ? bgConfig.defaultImage || '/assets/galaxy.png'
      : bgConfig.customImage
    setBackgroundImage(bgImg)
    setHasChanges(true)
  }

  if (loading && !themeConfig) {
    return (
      <div className="theme-editor__loading">
        <p>Loading theme configuration...</p>
      </div>
    )
  }

  if (!themeConfig || !globalConfig) {
    return (
      <div className="theme-editor__error">
        <p>Failed to load theme configuration.</p>
      </div>
    )
  }

  return (
    <div className="theme-editor">
      {error && (
        <div className="theme-editor__error">
          <p>Error: {error}</p>
        </div>
      )}

      <div className="theme-editor__split-view">
        {/* Left Panel: Configuration */}
        <div className="theme-editor__config-panel">
          <div className="theme-editor__config-content">
            {/* Design System - ZUERST */}
            {globalConfig.designs && (
              <>
                <div className="theme-editor__section">
                  <div className="theme-editor__section-header">
                    <h2 className="theme-editor__section-title">Design System</h2>
                    <button
                      onClick={handleApplyDesign}
                      className="theme-editor__btn theme-editor__btn--apply"
                      title="Apply this design globally (works immediately)"
                    >
                      ✓ Apply Design
                    </button>
                  </div>
                  <DesignSelector
                    designs={globalConfig.designs}
                    selectedDesign={selectedDesign}
                    onDesignSelect={setSelectedDesign}
                    defaultDesign={globalConfig.defaultDesign}
                  />
                </div>

                <div className="theme-editor__section">
                  <h2 className="theme-editor__section-title">Design Editor</h2>
                  {globalConfig.designs[selectedDesign] && (
                    <DesignEditor
                      design={globalConfig.designs[selectedDesign]}
                      onDesignChange={handleDesignChange}
                      onSetDefault={handleSetDefaultDesign}
                      isDefault={globalConfig.defaultDesign === selectedDesign}
                    />
                  )}
                </div>
              </>
            )}

            {/* Themes - DANACH */}
            <div className="theme-editor__section">
              <h2 className="theme-editor__section-title">Theme Selection</h2>
              <ThemeSelector
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
              />
            </div>

            <div className="theme-editor__section">
              <h2 className="theme-editor__section-title">Colors</h2>
              <ColorPicker
                themeConfig={themeConfig}
                onColorChange={handleColorChange}
              />
            </div>

            {/* Typography & Effects */}
            <div className="theme-editor__section">
              <h2 className="theme-editor__section-title">Typography</h2>
              <TypographyEditor />
            </div>

            <div className="theme-editor__section">
              <h2 className="theme-editor__section-title">Effects</h2>
              <EffectSlider />
            </div>

            {/* Background Configuration */}
            <div className="theme-editor__section">
              <h2 className="theme-editor__section-title">Background</h2>
              <BackgroundEditor onBackgroundChange={handleBackgroundChange} />
            </div>

            {/* Public Switcher Configuration */}
            <div className="theme-editor__section">
              <h2 className="theme-editor__section-title">Public Switcher</h2>
              <div className="theme-editor__field">
                <label>
                  <input
                    type="checkbox"
                    checked={globalConfig.publicSwitcher?.enabled || false}
                    onChange={(e) => handlePublicSwitcherChange('enabled', e.target.checked)}
                  />
                  Enable Public Switcher
                </label>
              </div>
              {globalConfig.publicSwitcher?.enabled && (
                <>
                  <div className="theme-editor__field">
                    <label>
                      <input
                        type="checkbox"
                        checked={globalConfig.publicSwitcher?.allowThemeSwitch || false}
                        onChange={(e) => handlePublicSwitcherChange('allowThemeSwitch', e.target.checked)}
                      />
                      Allow Theme Switch
                    </label>
                  </div>
                  <div className="theme-editor__field">
                    <label>
                      <input
                        type="checkbox"
                        checked={globalConfig.publicSwitcher?.allowDesignSwitch || false}
                        onChange={(e) => handlePublicSwitcherChange('allowDesignSwitch', e.target.checked)}
                      />
                      Allow Design Switch
                    </label>
                  </div>
                  <div className="theme-editor__field">
                    <label>
                      Switcher Type:
                      <select
                        value={globalConfig.publicSwitcher?.switcherType || 'combined'}
                        onChange={(e) => handlePublicSwitcherChange('switcherType', e.target.value)}
                      >
                        <option value="separate">Separate</option>
                        <option value="combined">Combined</option>
                      </select>
                    </label>
                  </div>
                  <div className="theme-editor__field">
                    <label>
                      Position:
                      <select
                        value={globalConfig.publicSwitcher?.position || 'top-right'}
                        onChange={(e) => handlePublicSwitcherChange('position', e.target.value)}
                      >
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                      </select>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="theme-editor__actions">
            <button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className="theme-editor__btn theme-editor__btn--primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={!hasChanges || loading}
              className="theme-editor__btn theme-editor__btn--secondary"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="theme-editor__preview-panel">
          <div className="theme-editor__preview-header">
            <h2 className="theme-editor__section-title">Preview</h2>
          </div>
          <div className="theme-editor__preview-content">
            {themeConfig && (
              <ThemePreview 
                themeConfig={themeConfig} 
                design={selectedDesign}
                backgroundImage={backgroundImage}
                currentTheme={currentTheme}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

