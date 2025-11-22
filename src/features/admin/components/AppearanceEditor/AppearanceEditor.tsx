'use client'

import { useState, useEffect } from 'react'
import AppearanceTabs from './AppearanceTabs'
import AppearancePreview from './AppearancePreview'
import ThemeSelector from '../ThemeEditor/ThemeSelector'
import ColorPicker from '../ThemeEditor/ColorPicker'
import TypographyEditor from '../ThemeEditor/TypographyEditor'
import EffectSlider from '../ThemeEditor/EffectSlider'
import DesignEditor from '../ThemeEditor/DesignEditor'
import DesignSelector from '../ThemeEditor/DesignSelector'
import BackgroundEditor from '../ThemeEditor/BackgroundEditor'
import PublicSwitcherConfig from '../ThemeEditor/PublicSwitcherConfig'
import ThemeCreator from '../Creator/ThemeCreator'
import EffectCreator from '../Creator/EffectCreator'
import MainPageLayoutEditor from '../LayoutEditor/MainPageLayoutEditor'
import SectionLayoutEditor from '../LayoutEditor/SectionLayoutEditor'
import CategoryTabs from '../LayoutEditor/CategoryTabs'
import { applyThemeDesign, getCurrentTheme } from '@/features/shared/utils/themeDesign'
import type { DesignConfig } from '@/features/shared/types/design'
import type { DetailPageLayoutConfig, DetailLayoutConfig } from '@/features/portfolio/types/layouts'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'
import '@/features/admin/styles/theme-editor.css'
import '@/features/admin/styles/theme-preview.css'
import '@/features/admin/styles/layout-editor.css'
import '@/features/admin/styles/appearance-editor.css'

interface ThemeConfig {
  name: string
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
}

interface GlobalThemeConfig {
  enabled: boolean
  defaultTheme: string
  defaultDesign?: string
  themes: {
    dark: ThemeConfig
    light: ThemeConfig
  }
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

export default function AppearanceEditor() {
  const [activeTab, setActiveTab] = useState<string>('design')
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark')
  const [selectedDesign, setSelectedDesign] = useState<string>('glassmorphism')
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)
  const [globalConfig, setGlobalConfig] = useState<GlobalThemeConfig | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Layout Editor State
  const [activeCategory, setActiveCategory] = useState<string>('global')
  const [layoutConfig, setLayoutConfig] = useState<DetailPageLayoutConfig | DetailLayoutConfig | null>(null)
  const [markdownSections, setMarkdownSections] = useState<MarkdownSection[]>([])
  
  // Creator State
  const [creatorType, setCreatorType] = useState<'theme' | 'effect'>('theme')

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
    localStorage.setItem('portfolio-design', selectedDesign)
    localStorage.setItem('portfolio-theme', theme)
    
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
    // If value is an object (full config), use it directly
    if (field === '' && typeof value === 'object' && value !== null) {
      setGlobalConfig({
        ...globalConfig,
        publicSwitcher: value
      })
    } else {
      // Otherwise, update specific field
      setGlobalConfig({
        ...globalConfig,
        publicSwitcher: {
          ...globalConfig.publicSwitcher,
          [field]: value
        } as any
      })
    }
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
      <div className="appearance-editor__loading">
        <p>Loading appearance configuration...</p>
      </div>
    )
  }

  if (!themeConfig || !globalConfig) {
    return (
      <div className="appearance-editor__error">
        <p>Failed to load appearance configuration.</p>
      </div>
    )
  }

  return (
    <div className="appearance-editor">
      {error && (
        <div className="appearance-editor__error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <AppearanceTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="appearance-editor__split-view">
        {/* Left Panel: Configuration */}
        <div className="appearance-editor__config-panel">
          <div className="appearance-editor__config-content">
            {/* Design System Tab */}
            {activeTab === 'design' && globalConfig.designs && (
              <>
                <div className="appearance-editor__section">
                  <div className="appearance-editor__section-header">
                    <h2 className="appearance-editor__section-title">Design System</h2>
                    <button
                      onClick={handleApplyDesign}
                      className="appearance-editor__btn appearance-editor__btn--apply"
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

                <div className="appearance-editor__section">
                  <h2 className="appearance-editor__section-title">Design Editor</h2>
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

            {/* Themes Tab */}
            {activeTab === 'themes' && (
              <>
                <div className="appearance-editor__section">
                  <h2 className="appearance-editor__section-title">Theme Selection</h2>
                  <ThemeSelector
                    currentTheme={currentTheme}
                    onThemeChange={handleThemeChange}
                  />
                </div>

                <div className="appearance-editor__section">
                  <h2 className="appearance-editor__section-title">Colors</h2>
                  <ColorPicker
                    themeConfig={themeConfig}
                    onColorChange={handleColorChange}
                  />
                </div>

                <div className="appearance-editor__section">
                  <h2 className="appearance-editor__section-title">Typography</h2>
                  <TypographyEditor />
                </div>

                <div className="appearance-editor__section">
                  <h2 className="appearance-editor__section-title">Background</h2>
                  <BackgroundEditor onBackgroundChange={handleBackgroundChange} />
                </div>

                <div className="appearance-editor__section">
                  <h2 className="appearance-editor__section-title">Public Switcher</h2>
                  <div className="appearance-editor__field">
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
                      <div className="appearance-editor__field">
                        <label>
                          <input
                            type="checkbox"
                            checked={globalConfig.publicSwitcher?.allowThemeSwitch || false}
                            onChange={(e) => handlePublicSwitcherChange('allowThemeSwitch', e.target.checked)}
                          />
                          Allow Theme Switch
                        </label>
                      </div>
                      <div className="appearance-editor__field">
                        <label>
                          <input
                            type="checkbox"
                            checked={globalConfig.publicSwitcher?.allowDesignSwitch || false}
                            onChange={(e) => handlePublicSwitcherChange('allowDesignSwitch', e.target.checked)}
                          />
                          Allow Design Switch
                        </label>
                      </div>
                      <div className="appearance-editor__field">
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
                      <div className="appearance-editor__field">
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
              </>
            )}

            {/* Layout Settings Tab */}
            {activeTab === 'layout' && (
              <>
                <CategoryTabs 
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />

                {activeCategory === 'global' && (
                  <MainPageLayoutEditor onSave={() => setHasChanges(false)} />
                )}

                {activeCategory !== 'global' && activeCategory !== 'projects' && (
                  <SectionLayoutEditor onSave={() => setHasChanges(false)} />
                )}

                {activeCategory === 'projects' && (
                  <div className="appearance-editor__section">
                    <h2 className="appearance-editor__section-title">Project Layouts</h2>
                    <p>Project-specific layout configuration is available in the Layout Editor.</p>
                    <p>This section will be integrated in a future update.</p>
                  </div>
                )}
              </>
            )}

            {/* Public Switcher Tab */}
            {activeTab === 'switcher' && globalConfig && (
              <div className="appearance-editor__section">
                <h2 className="appearance-editor__section-title">Public Switcher Configuration</h2>
                <PublicSwitcherConfig
                  config={globalConfig.publicSwitcher || {
                    enabled: false,
                    allowThemeSwitch: true,
                    allowDesignSwitch: true,
                    switcherType: 'combined',
                    position: 'top-right'
                  }}
                  availableThemes={Object.keys(globalConfig.themes || {})}
                  availableDesigns={Object.keys(globalConfig.designs || {}).filter(
                    id => globalConfig.designs?.[id]?.enabled !== false
                  )}
                  onConfigChange={(newConfig) => {
                    handlePublicSwitcherChange('', newConfig)
                  }}
                />
              </div>
            )}

            {/* Creator Tab */}
            {activeTab === 'creator' && (
              <div className="appearance-editor__section">
                <div className="creator-tabs">
                  <button
                    onClick={() => setCreatorType('theme')}
                    className={`creator-tabs__tab ${creatorType === 'theme' ? 'creator-tabs__tab--active' : ''}`}
                  >
                    Create Theme
                  </button>
                  <button
                    onClick={() => setCreatorType('effect')}
                    className={`creator-tabs__tab ${creatorType === 'effect' ? 'creator-tabs__tab--active' : ''}`}
                  >
                    Create Effect
                  </button>
                </div>
                
                {creatorType === 'theme' && (
                  <ThemeCreator
                    onThemeCreated={() => {
                      // Reload theme config to show new theme
                      window.location.reload()
                    }}
                  />
                )}
                
                {creatorType === 'effect' && (
                  <EffectCreator
                    onEffectCreated={() => {
                      // Reload to show new effect
                      window.location.reload()
                    }}
                  />
                )}
              </div>
            )}

            {/* Effects Tab */}
            {activeTab === 'effects' && (
              <div className="appearance-editor__section">
                <h2 className="appearance-editor__section-title">Effects</h2>
                <EffectSlider />
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="appearance-editor__section">
                <h2 className="appearance-editor__section-title">Preview</h2>
                <p>Preview is shown in the right panel.</p>
              </div>
            )}
          </div>

          {/* Save/Cancel Buttons */}
          <div className="appearance-editor__actions">
            <button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className="appearance-editor__btn appearance-editor__btn--primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={!hasChanges || loading}
              className="appearance-editor__btn appearance-editor__btn--secondary"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="appearance-editor__preview-panel">
          <div className="appearance-editor__preview-header">
            <h2 className="appearance-editor__section-title">Preview</h2>
          </div>
          <div className="appearance-editor__preview-content">
            {activeTab === 'preview' || activeTab === 'design' || activeTab === 'themes' || activeTab === 'effects' ? (
              themeConfig && (
                <AppearancePreview
                  previewType="theme"
                  themeConfig={themeConfig}
                  design={selectedDesign}
                  backgroundImage={backgroundImage}
                  currentTheme={currentTheme}
                />
              )
            ) : activeTab === 'layout' ? (
              layoutConfig ? (
                <AppearancePreview
                  previewType="layout"
                  layoutConfig={layoutConfig}
                  markdownSections={markdownSections}
                />
              ) : (
                <div className="appearance-preview__empty">
                  <p>No layout configuration available</p>
                </div>
              )
            ) : (
              themeConfig && (
                <AppearancePreview
                  previewType="theme"
                  themeConfig={themeConfig}
                  design={selectedDesign}
                  backgroundImage={backgroundImage}
                  currentTheme={currentTheme}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

