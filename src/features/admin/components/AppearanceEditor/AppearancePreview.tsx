'use client'

import ThemePreview from '../ThemeEditor/ThemePreview'
import LayoutPreview from '../LayoutEditor/LayoutPreview'
import type { DetailLayoutConfig } from '@/features/portfolio/types/layouts'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

interface ThemeConfig {
  name: string
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
}

interface AppearancePreviewProps {
  previewType: 'theme' | 'layout'
  themeConfig?: ThemeConfig
  design?: string
  backgroundImage?: string
  currentTheme?: 'dark' | 'light'
  layoutConfig?: DetailLayoutConfig | null
  markdownSections?: MarkdownSection[]
}

export default function AppearancePreview({
  previewType,
  themeConfig,
  design,
  backgroundImage,
  currentTheme = 'dark',
  layoutConfig,
  markdownSections = []
}: AppearancePreviewProps) {
  // Theme Preview - ThemePreview already has tabs including "Full Page"
  if (previewType === 'theme' && themeConfig) {
    return (
      <div className="appearance-preview">
        <div className="appearance-preview__content">
          <ThemePreview
            themeConfig={themeConfig}
            design={design}
            backgroundImage={backgroundImage}
            currentTheme={currentTheme}
          />
        </div>
      </div>
    )
  }

  // Layout Preview
  if (previewType === 'layout' && layoutConfig) {
    return (
      <div className="appearance-preview">
        <div className="appearance-preview__header">
          <h3 className="appearance-preview__title">Layout Preview</h3>
        </div>
        <div className="appearance-preview__content">
          <LayoutPreview
            config={layoutConfig}
            markdownSections={markdownSections}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="appearance-preview">
      <div className="appearance-preview__empty">
        <p>Select a tab to see preview</p>
      </div>
    </div>
  )
}

