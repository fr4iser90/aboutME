/**
 * Theme-Design Combination Utilities
 * Functions to combine themes and designs, parse combinations, and validate
 */

export type ThemeType = 
  | 'dark' 
  | 'light'
  | 'light-alt'
  | 'dark-blue'
  | 'dark-green'
  | 'light-warm'
  | 'light-cool'
  | 'forest'
  | 'ocean'
  | 'sunset'
export type DesignType = 
  | 'glassmorphism' 
  | 'modern-glass' 
  | 'minimal-clean' 
  | 'cyberpunk'
  | 'flat'
  | 'minimal'
  | 'clean'
  | 'neumorphism'
  | 'gradient'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'blue'
  | 'green'
  | 'light-cool'
  | 'light-warm'

export interface ThemeDesignCombination {
  theme: ThemeType
  design: DesignType
  combination: string
}

/**
 * Combines theme and design into a combination string
 * Format: "theme-design" (e.g., "dark-glassmorphism")
 */
export function combineThemeDesign(theme: ThemeType, design: DesignType): string {
  return `${theme}-${design}`
}

/**
 * Parses a combination string into theme and design
 * Supports both "theme-design" format and legacy "theme-design" format
 */
export function parseCombination(combination: string): ThemeDesignCombination | null {
  if (!combination) return null

  // Handle legacy format: "dark-glassmorphism" -> { theme: "dark", design: "glassmorphism" }
  const parts = combination.split('-')
  if (parts.length >= 2) {
    const theme = parts[0] as ThemeType
    const design = parts.slice(1).join('-') as DesignType
    
    if (isValidTheme(theme) && isValidDesign(design)) {
      return {
        theme,
        design,
        combination: combineThemeDesign(theme, design)
      }
    }
  }

  // Handle separate format: "dark" and "glassmorphism" (from data-theme and data-design)
  // This function is called with combination string, so we need to handle both cases
  return null
}

/**
 * Validates if a theme is valid
 */
export function isValidTheme(theme: string): theme is ThemeType {
  const validThemes: ThemeType[] = [
    'dark',
    'light',
    'light-alt',
    'dark-blue',
    'dark-green',
    'light-warm',
    'light-cool',
    'forest',
    'ocean',
    'sunset'
  ]
  return validThemes.includes(theme as ThemeType)
}

/**
 * Validates if a design is valid
 */
export function isValidDesign(design: string): design is DesignType {
  const validDesigns: DesignType[] = [
    'glassmorphism',
    'modern-glass',
    'minimal-clean',
    'cyberpunk',
    'flat',
    'minimal',
    'clean',
    'neumorphism',
    'gradient',
    'sunset',
    'ocean',
    'forest',
    'blue',
    'green',
    'light-cool',
    'light-warm',
    'skeuomorphism',
    'brutalism',
    'soft',
    'sharp'
  ]
  return validDesigns.includes(design as DesignType)
}

/**
 * Gets the current theme from DOM
 */
export function getCurrentTheme(): ThemeType | null {
  if (typeof window === 'undefined') return null
  const theme = document.documentElement.getAttribute('data-theme')
  if (theme && isValidTheme(theme)) {
    return theme
  }
  return null
}

/**
 * Gets the current design from DOM
 */
export function getCurrentDesign(): DesignType | null {
  if (typeof window === 'undefined') return null
  const design = document.documentElement.getAttribute('data-design')
  if (design && isValidDesign(design)) {
    return design
  }
  return null
}

/**
 * Gets the current theme-design combination from DOM
 */
export function getCurrentCombination(): ThemeDesignCombination | null {
  const theme = getCurrentTheme()
  const design = getCurrentDesign()
  
  if (theme && design) {
    return {
      theme,
      design,
      combination: combineThemeDesign(theme, design)
    }
  }
  
  return null
}

/**
 * Maps design to effect
 * Returns which effect a design uses
 * Now reads from config if available, falls back to hardcoded mapping
 */
function getEffectForDesign(design: DesignType): string {
  // Try to get from config (async, but we need sync version for applyThemeDesign)
  // For now, use hardcoded mapping as fallback
  // The config-based version will be used when design config is loaded
  const designToEffect: Record<DesignType, string> = {
    'glassmorphism': 'glassmorphism',
    'modern-glass': 'glassmorphism',
    'sunset': 'glassmorphism',
    'ocean': 'glassmorphism',
    'forest': 'glassmorphism',
    'blue': 'glassmorphism',
    'green': 'glassmorphism',
    'light-cool': 'glassmorphism',
    'light-warm': 'glassmorphism',
    'cyberpunk': 'cyberpunk',
    'flat': 'flat',
    'minimal': 'minimal',
    'clean': 'clean',
    'minimal-clean': 'clean',
    'neumorphism': 'neumorphism',
    'gradient': 'gradient',
  }
  return designToEffect[design] || 'glassmorphism'
}

/**
 * Gets effect for design from config (async version)
 * Falls back to hardcoded mapping if config not available
 */
export async function getEffectForDesignFromConfig(design: DesignType): Promise<string> {
  try {
    const response = await fetch('/api/admin/config/theme')
    if (!response.ok) {
      return getEffectForDesign(design)
    }
    
    const config = await response.json()
    const designConfig = config.config?.designs?.[design]
    
    if (designConfig?.effect) {
      return designConfig.effect
    }
  } catch (error) {
    console.warn('Failed to fetch design config for effect:', error)
  }
  
  // Fallback to hardcoded mapping
  return getEffectForDesign(design)
}

/**
 * Applies theme and design to the document root
 */
export function applyThemeDesign(theme: ThemeType, design: DesignType): void {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  
  // Set data-theme attribute
  root.setAttribute('data-theme', theme)
  
  // Set data-design attribute
  root.setAttribute('data-design', design)
  
  // Set data-effect attribute (for modular effect system)
  const effect = getEffectForDesign(design)
  root.setAttribute('data-effect', effect)
  
  // Update class for backward compatibility
  root.classList.toggle('dark', theme === 'dark')
}

/**
 * Gets all valid combinations from available themes and designs
 */
export function getAllCombinations(
  themes: ThemeType[],
  designs: DesignType[]
): ThemeDesignCombination[] {
  const combinations: ThemeDesignCombination[] = []
  
  for (const theme of themes) {
    for (const design of designs) {
      combinations.push({
        theme,
        design,
        combination: combineThemeDesign(theme, design)
      })
    }
  }
  
  return combinations
}

/**
 * Gets the default layout (display mode) for a design from the API config
 * Falls back to 'portfolio' if design not found or API unavailable
 */
export async function getDefaultLayoutForDesign(design: DesignType | null): Promise<string> {
  if (!design) return 'portfolio'
  
  try {
    const response = await fetch('/api/admin/config/theme')
    if (!response.ok) return 'portfolio'
    
    const config = await response.json()
    const designConfig = config.config?.designs?.[design] || config.designs?.[design]
    
    if (designConfig?.defaultLayout) {
      return designConfig.defaultLayout
    }
  } catch (error) {
    console.warn('Failed to fetch design config for default layout:', error)
  }
  
  // Fallback mapping (if API fails) - using Display Modes, not templates
  const fallbackLayouts: Record<DesignType, string> = {
    'glassmorphism': 'portfolio',
    'modern-glass': 'grid',
    'minimal-clean': 'minimal',
    'cyberpunk': 'dashboard',
    'flat': 'portfolio',
    'minimal': 'dashboard',
    'clean': 'minimal',
    'neumorphism': 'sticky-sidebar',
    'gradient': 'magazine',
    'sunset': 'hero-content',
    'ocean': 'split-screen',
    'forest': 'magazine',
    'blue': 'carousel',
    'green': 'grid',
    'light-cool': 'portfolio',
    'light-warm': 'portfolio',
    'skeuomorphism': 'portfolio',
    'brutalism': 'grid',
    'soft': 'minimal',
    'sharp': 'dashboard'
  }
  
  return fallbackLayouts[design] || 'portfolio'
}

/**
 * Gets the default layout (display mode) for the current design synchronously (uses fallback)
 * For async version, use getDefaultLayoutForDesign()
 */
export function getDefaultLayoutForDesignSync(design: DesignType | null): string {
  if (!design) return 'portfolio'
  
  // Fallback mapping - using Display Modes, not templates
  const fallbackLayouts: Record<DesignType, string> = {
    'glassmorphism': 'portfolio',
    'modern-glass': 'grid',
    'minimal-clean': 'minimal',
    'cyberpunk': 'dashboard',
    'flat': 'portfolio',
    'minimal': 'dashboard',
    'clean': 'minimal',
    'neumorphism': 'sticky-sidebar',
    'gradient': 'magazine',
    'sunset': 'hero-content',
    'ocean': 'split-screen',
    'forest': 'magazine',
    'blue': 'carousel',
    'green': 'grid',
    'light-cool': 'portfolio',
    'light-warm': 'portfolio',
    'skeuomorphism': 'portfolio',
    'brutalism': 'grid',
    'soft': 'minimal',
    'sharp': 'dashboard'
  }
  
  return fallbackLayouts[design] || 'portfolio'
}

