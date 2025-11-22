/**
 * Design System Type Definitions
 * Defines types for the design system (glassmorphism, flat, minimal)
 */

export type DesignType = 'glassmorphism' | 'flat' | 'minimal'

export interface DesignEffects {
  blur: number
  borderRadius: number
  backdropFilter: string
  transition: string
}

export interface DesignConfig {
  id: DesignType
  name: string
  description: string
  effects: DesignEffects
  enabled: boolean
  effect?: string // Effect ID (e.g., 'glassmorphism', 'flat', 'minimal')
  backgroundImage?: string // Background image path (e.g., '/assets/galaxy.png')
  defaultLayout?: string // Default GLOBAL layout (display mode) when this design is activated (e.g., 'portfolio', 'dashboard', 'minimal', 'magazine')
  defaultSectionLayouts?: Record<string, string> // Default SECTION layouts (e.g., { projects: 'sidebar-left', skills: 'grid', timeline: 'vertical' })
  // NOTE: defaultLayout is a SUGGESTION - can be overridden by global layout config
  // NOTE: defaultLayout is a DISPLAY MODE (portfolio, dashboard, etc.), not a template
  // NOTE: sidebar-left and sidebar-right are PROJECT layouts, NOT global layouts
}

export interface DesignSystemConfig {
  defaultDesign: DesignType
  designs: Record<DesignType, DesignConfig>
}

