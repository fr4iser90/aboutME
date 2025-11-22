/**
 * Layout Configuration Utilities
 * 
 * Provides functions to get and save layout configurations
 * for global layout and section layouts.
 */

import type { SectionDetailLayoutType, SectionMediaLayoutType } from '../types/sectionLayouts'

/**
 * Main Page Layout Type
 * Defines how the main page is structured (portfolio, dashboard, magazine, etc.)
 */
export type MainPageLayoutType = 
  | 'portfolio'
  | 'dashboard'
  | 'magazine'
  | 'minimal'
  | 'grid'
  | 'split-screen'
  | 'hero-content'
  | 'carousel'
  | 'sticky-sidebar'

/**
 * @deprecated Use MainPageLayoutType instead
 */
export type DisplayMode = MainPageLayoutType

/**
 * @deprecated Use MainPageLayoutType instead
 */
export type PageLayoutType = 'sidebar-left' | 'sidebar-right' | 'full-width' | 'two-column' | 'centered' | 'masonry' | 'split-screen' | 'hero-content' | 'carousel-layout' | 'sticky-sidebar'

export type SectionType = 
  | 'projects'
  | 'skills'
  | 'timeline'
  | 'blog'
  | 'aboutMe'
  | 'contact'

/**
 * Main Page Layout Configuration
 * Defines the global layout for the main page
 */
export interface MainPageLayoutConfig {
  layout: MainPageLayoutType
}

/**
 * @deprecated Use MainPageLayoutConfig instead
 */
export interface GlobalLayoutConfig {
  template: PageLayoutType
  displayMode: DisplayMode
}

/**
 * Section Style Type
 * Defines how sections are displayed on the main page (grid, list, masonry, etc.)
 */
export type SectionStyleType = 
  | 'grid'
  | 'masonry'
  | 'carousel'
  | 'list'
  | 'card-grid'
  | 'tags'
  | 'compact'
  | 'vertical'
  | 'horizontal'
  | 'cards'
  | 'centered'
  | 'split'
  | 'full-width'
  | string // Allow custom section-specific layouts


/**
 * Section Layout Configuration
 * Defines layouts for a section (style, detail, media)
 */
export interface SectionLayoutConfig {
  style: SectionStyleType
  styleColumns?: number
  detailLayout?: SectionDetailLayoutType
  mediaLayout?: SectionMediaLayoutType
  mediaColumns?: number
  [key: string]: any
}

export interface SectionLayoutsConfig {
  projects?: SectionLayoutConfig
  skills?: SectionLayoutConfig
  timeline?: SectionLayoutConfig
  blog?: SectionLayoutConfig
  aboutMe?: SectionLayoutConfig
  contact?: SectionLayoutConfig
}

/**
 * Get current main page layout configuration
 */
export async function getMainPageLayout(): Promise<MainPageLayoutConfig> {
  try {
    const response = await fetch('/api/admin/config/layout')
    if (!response.ok) {
      throw new Error(`Failed to fetch main page layout: ${response.statusText}`)
    }
    const data = await response.json()
    // Support both old and new format
    const globalLayout = data.config.globalLayout
    if (globalLayout?.layout) {
      return { layout: globalLayout.layout }
    }
    if (globalLayout?.displayMode) {
      return { layout: globalLayout.displayMode }
    }
    return { layout: 'portfolio' }
  } catch (error) {
    console.error('Error fetching main page layout:', error)
    return { layout: 'portfolio' }
  }
}

/**
 * @deprecated Use getMainPageLayout instead
 */
export async function getGlobalLayout(): Promise<GlobalLayoutConfig> {
  const mainPageLayout = await getMainPageLayout()
  // Map to old format for backward compatibility
  const displayModeToTemplate: Record<MainPageLayoutType, PageLayoutType> = {
    'dashboard': 'two-column',
    'magazine': 'masonry',
    'minimal': 'centered',
    'grid': 'masonry',
    'split-screen': 'split-screen',
    'hero-content': 'hero-content',
    'carousel': 'carousel-layout',
    'sticky-sidebar': 'sticky-sidebar',
    'portfolio': 'sidebar-left'
  }
  return {
    template: displayModeToTemplate[mainPageLayout.layout] || 'sidebar-left',
    displayMode: mainPageLayout.layout
  }
}

/**
 * Get layout configuration for a specific section
 */
export async function getSectionLayout(section: SectionType): Promise<SectionLayoutConfig> {
  try {
    const response = await fetch('/api/admin/config/sections')
    if (!response.ok) {
      throw new Error(`Failed to fetch section layouts: ${response.statusText}`)
    }
    const data = await response.json()
    const sectionLayouts = data.config.sectionLayouts || {}
    const sectionConfig = sectionLayouts[section]
    if (!sectionConfig) {
      return { style: 'grid' }
    }
    return sectionConfig
  } catch (error) {
    console.error(`Error fetching section layout for ${section}:`, error)
    return { style: 'grid' }
  }
}

/**
 * Get all section layout configurations
 */
export async function getAllSectionLayouts(): Promise<SectionLayoutsConfig> {
  try {
    const response = await fetch('/api/admin/config/sections')
    if (!response.ok) {
      throw new Error(`Failed to fetch section layouts: ${response.statusText}`)
    }
    const data = await response.json()
    const sectionLayouts = data.config.sectionLayouts || {}
    return sectionLayouts as SectionLayoutsConfig
  } catch (error) {
    console.error('Error fetching section layouts:', error)
    return {}
  }
}

/**
 * Save main page layout configuration
 */
export async function saveMainPageLayout(config: MainPageLayoutConfig): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/config/layout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config: {
          globalLayout: {
            layout: config.layout,
            // Keep old format for backward compatibility
            displayMode: config.layout
          }
        }
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to save main page layout: ${response.statusText}`)
    }
    
    return true
  } catch (error) {
    console.error('Error saving main page layout:', error)
    throw error
  }
}

/**
 * @deprecated Use saveMainPageLayout instead
 */
export async function saveGlobalLayout(config: GlobalLayoutConfig): Promise<boolean> {
  const mainPageConfig: MainPageLayoutConfig = {
    layout: config.displayMode
  }
  return saveMainPageLayout(mainPageConfig)
}

/**
 * Save section layout configuration
 */
export async function saveSectionLayout(section: SectionType, config: SectionLayoutConfig): Promise<boolean> {
  try {
    // First get all section layouts
    const allLayouts = await getAllSectionLayouts()
    
    // Update the specific section
    const updatedLayouts = {
      ...allLayouts,
      [section]: config
    }
    
    const response = await fetch('/api/admin/config/sections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config: {
          sectionLayouts: updatedLayouts
        }
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to save section layout: ${response.statusText}`)
    }
    
    return true
  } catch (error) {
    console.error(`Error saving section layout for ${section}:`, error)
    throw error
  }
}

/**
 * Save all section layout configurations
 */
export async function saveAllSectionLayouts(configs: SectionLayoutsConfig): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/config/sections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config: {
          sectionLayouts: configs
        }
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to save section layouts: ${response.statusText}`)
    }
    
    return true
  } catch (error) {
    console.error('Error saving section layouts:', error)
    throw error
  }
}

