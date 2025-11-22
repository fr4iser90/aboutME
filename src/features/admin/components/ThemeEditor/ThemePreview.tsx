'use client'

import { useState, useEffect, useRef } from 'react'
import { PreviewHeader, PreviewCard, PreviewButtons, PreviewTypography, PreviewFormElements } from './PreviewComponents'
import FullThemePreview from './FullThemePreview'

interface ThemeConfig {
  name: string
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
}

interface ThemePreviewProps {
  themeConfig: ThemeConfig
  design?: string
  backgroundImage?: string
  currentTheme?: 'dark' | 'light'
}

type PreviewTab = 'overview' | 'components' | 'typography' | 'full'
type PreviewViewport = 'desktop' | 'mobile'

export default function ThemePreview({ themeConfig, design, backgroundImage, currentTheme = 'dark' }: ThemePreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('overview')
  const [viewport, setViewport] = useState<PreviewViewport>('desktop')
  const containerRef = useRef<HTMLDivElement>(null)
  const originalThemeRef = useRef<string | null>(null)
  const originalDesignRef = useRef<string | null>(null)

  // Store original theme/design and apply only to preview container
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    // Store original values
    if (originalThemeRef.current === null) {
      originalThemeRef.current = document.documentElement.getAttribute('data-theme') || 'dark'
    }
    if (originalDesignRef.current === null) {
      originalDesignRef.current = document.documentElement.getAttribute('data-design') || 'glassmorphism'
    }

    // Apply to container only (CSS variables will be inherited by children from CSS files)
    if (design && currentTheme) {
      containerRef.current.setAttribute('data-theme', currentTheme)
      containerRef.current.setAttribute('data-design', design)
    }
  }, [design, currentTheme])

  return (
    <div className="theme-preview">
      {/* Preview Tabs */}
      <div className="theme-preview__tabs">
        <div className="theme-preview__tabs-left">
          <button
            className={`theme-preview__tab ${activeTab === 'overview' ? 'theme-preview__tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`theme-preview__tab ${activeTab === 'components' ? 'theme-preview__tab--active' : ''}`}
            onClick={() => setActiveTab('components')}
          >
            Components
          </button>
          <button
            className={`theme-preview__tab ${activeTab === 'typography' ? 'theme-preview__tab--active' : ''}`}
            onClick={() => setActiveTab('typography')}
          >
            Typography
          </button>
          <button
            className={`theme-preview__tab ${activeTab === 'full' ? 'theme-preview__tab--active' : ''}`}
            onClick={() => setActiveTab('full')}
          >
            Full Page
          </button>
        </div>
        <div className="theme-preview__tabs-right">
          <button
            className={`theme-preview__viewport-toggle ${viewport === 'mobile' ? 'theme-preview__viewport-toggle--active' : ''}`}
            onClick={() => setViewport(viewport === 'desktop' ? 'mobile' : 'desktop')}
            title={viewport === 'desktop' ? 'Switch to Mobile View' : 'Switch to Desktop View'}
          >
            {viewport === 'desktop' ? '📱' : '🖥️'}
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        ref={containerRef}
        className={`theme-preview__container theme-preview__container--${viewport}`}
        data-theme={currentTheme}
        data-design={design || 'glassmorphism'}
      >
        {activeTab === 'overview' && (
          <div className="theme-preview__overview">
            <PreviewHeader themeConfig={themeConfig} design={design} />
            <PreviewCard themeConfig={themeConfig} design={design} />
            <PreviewButtons themeConfig={themeConfig} design={design} />
            <PreviewTypography themeConfig={themeConfig} />
            <PreviewFormElements themeConfig={themeConfig} />
          </div>
        )}

        {activeTab === 'components' && (
          <div className="theme-preview__components">
            <div className="theme-preview__component-section">
              <h4 className="theme-preview__section-title">Cards</h4>
              <PreviewCard themeConfig={themeConfig} design={design} />
            </div>
            <div className="theme-preview__component-section">
              <h4 className="theme-preview__section-title">Buttons</h4>
              <PreviewButtons themeConfig={themeConfig} design={design} />
            </div>
            <div className="theme-preview__component-section">
              <h4 className="theme-preview__section-title">Form Elements</h4>
              <PreviewFormElements themeConfig={themeConfig} />
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="theme-preview__typography">
            <PreviewTypography themeConfig={themeConfig} />
          </div>
        )}

        {activeTab === 'full' && (
          <div className="theme-preview__full">
            <FullThemePreview 
              themeConfig={themeConfig} 
              design={design}
              backgroundImage={backgroundImage}
              currentTheme={currentTheme}
            />
          </div>
        )}
      </div>
    </div>
  )
}
