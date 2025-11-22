import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Save to private/data during editing, will be published to public/data later
const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data')
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data')
const PORTFOLIO_CONFIG_FILE = path.join(process.cwd(), 'portfolio.config.js')
const DESIGNS_DIR = path.join(process.cwd(), 'src/styles/designs')
const THEMES_DIR = path.join(process.cwd(), 'src/styles/themes')

// Helper function to read portfolio.config.js
async function readPortfolioConfig(): Promise<any> {
  try {
    const configContent = await fs.readFile(PORTFOLIO_CONFIG_FILE, 'utf-8')
    const moduleMatch = configContent.match(/module\.exports\s*=\s*({[\s\S]*});?\s*$/)
    if (moduleMatch) {
      const configStr = moduleMatch[1]
      return eval(`(function() { const path = require('path'); return (${configStr}); })()`)
    }
    return {}
  } catch (error) {
    console.warn('Could not read portfolio.config.js:', error)
    return {}
  }
}

// Helper function to read config.json
async function readConfigJson(): Promise<any> {
  try {
    const configPath = path.join(DATA_DIR, 'config', 'config.json')
    const configContent = await fs.readFile(configPath, 'utf-8')
    return JSON.parse(configContent)
  } catch (error) {
    console.warn('Could not read config.json:', error)
    return {}
  }
}

// Helper function to discover themes from CSS files
// ALL data comes from CSS - NO hardcoded mappings!
async function discoverThemesFromCSS(): Promise<Record<string, any>> {
  const themes: Record<string, any> = {}
  
  try {
    const files = await fs.readdir(THEMES_DIR)
    const cssFiles = files.filter(file => file.endsWith('.css'))
    
    for (const file of cssFiles) {
      const themeId = file.replace('.css', '')
      
      // Generate name from ID (capitalize, replace dashes)
      const name = themeId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      themes[themeId] = {
        name,
        enabled: true
      }
    }
  } catch (error) {
    console.warn('Could not discover themes from CSS:', error)
  }
  
  return themes
}

// Helper function to discover designs from CSS files
// ALL data comes from CSS - NO hardcoded mappings!
async function discoverDesignsFromCSS(): Promise<Record<string, any>> {
  const designs: Record<string, any> = {}
  
  try {
    const files = await fs.readdir(DESIGNS_DIR)
    const cssFiles = files.filter(file => file.endsWith('.css'))
    
    for (const file of cssFiles) {
      const designId = file.replace('.css', '')
      const filePath = path.join(DESIGNS_DIR, file)
      const content = await fs.readFile(filePath, 'utf-8')
      
      // Extract effect from CSS
      let effect = designId // default: use design ID as effect
      if (content.includes('--effect-glass') || content.includes('glassmorphism')) {
        effect = 'glassmorphism'
      } else if (content.includes('--effect-cyberpunk') || content.includes('cyberpunk')) {
        effect = 'cyberpunk'
      } else if (content.includes('--effect-flat') || content.includes('flat')) {
        effect = 'flat'
      } else if (content.includes('--effect-minimal') || content.includes('minimal')) {
        effect = 'minimal'
      } else if (content.includes('--effect-clean') || content.includes('clean')) {
        effect = 'clean'
      } else if (content.includes('--effect-neumorphism') || content.includes('neumorphism')) {
        effect = 'neumorphism'
      } else if (content.includes('--effect-gradient') || content.includes('gradient')) {
        effect = 'gradient'
      }
      
      // Extract background image from CSS
      let backgroundImage = ''
      const bgUrlMatch = content.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/)
      if (bgUrlMatch && bgUrlMatch[1]) {
        backgroundImage = bgUrlMatch[1]
      }
      
      // Extract global layout from CSS (--global-layout-type)
      let defaultLayout = 'portfolio' // fallback
      const globalLayoutMatch = content.match(/--global-layout-type:\s*([a-z-]+)/)
      if (globalLayoutMatch && globalLayoutMatch[1]) {
        defaultLayout = globalLayoutMatch[1].toLowerCase()
        // Handle special cases
        if (defaultLayout === 'default') {
          defaultLayout = 'portfolio'
        }
      } else {
        // Fallback: try old --layout-type for backwards compatibility
        const oldLayoutMatch = content.match(/--layout-type:\s*([a-z-]+)/)
        if (oldLayoutMatch && oldLayoutMatch[1]) {
          defaultLayout = oldLayoutMatch[1].toLowerCase()
          if (defaultLayout === 'default') {
            defaultLayout = 'portfolio'
          }
        }
      }
      
      // Extract section layout defaults from CSS
      const sectionLayouts: Record<string, string> = {}
      const sectionMatches = [
        { key: 'projects', pattern: /--section-projects-layout:\s*([a-z-]+)/ },
        { key: 'skills', pattern: /--section-skills-layout:\s*([a-z-]+)/ },
        { key: 'timeline', pattern: /--section-timeline-layout:\s*([a-z-]+)/ },
        { key: 'blog', pattern: /--section-blog-layout:\s*([a-z-]+)/ },
        { key: 'aboutMe', pattern: /--section-aboutme-layout:\s*([a-z-]+)/ },
        { key: 'contact', pattern: /--section-contact-layout:\s*([a-z-]+)/ }
      ]
      
      sectionMatches.forEach(({ key, pattern }) => {
        const match = content.match(pattern)
        if (match && match[1]) {
          sectionLayouts[key] = match[1].toLowerCase()
        }
      })
      
      // Generate name from ID
      const name = designId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      designs[designId] = {
        id: designId,
        name,
        description: `Design: ${name}`,
        enabled: true,
        effect,
        backgroundImage: backgroundImage || undefined,
        defaultLayout,
        defaultSectionLayouts: Object.keys(sectionLayouts).length > 0 ? sectionLayouts : undefined
      }
    }
  } catch (error) {
    console.warn('Could not discover designs from CSS:', error)
  }
  
  return designs
}

// GET: Read theme configuration
export async function GET() {
  try {
    const portfolioConfig = await readPortfolioConfig()
    const configJson = await readConfigJson()
    
    // Get layout config
    const layoutConfig = portfolioConfig.layout || configJson.portfolio?.layout || {}
    
    // Discover themes and designs from CSS files (NO hardcoded data!)
    const discoveredThemes = await discoverThemesFromCSS()
    const discoveredDesigns = await discoverDesignsFromCSS()
    
    // Get theme config from portfolio.config.js or config.json
    // Themes and designs come from CSS files, config only overrides/extends
    const existingThemeConfig = portfolioConfig.features?.theme || configJson.portfolio?.features?.theme
    const themeConfig = existingThemeConfig || {
      enabled: true,
      defaultTheme: 'dark',
      defaultDesign: 'glassmorphism',
      themes: {},
      designs: {},
      persistChoice: true,
      publicSwitcher: {
        enabled: false,
        allowThemeSwitch: true,
        allowDesignSwitch: true,
        // availableThemes: Optional - wenn nicht gesetzt, werden alle enabled themes verwendet
        // availableDesigns: Optional - wenn nicht gesetzt, werden alle enabled designs verwendet
        // Admin kann hier explizit einschränken, welche Themes/Designs im Public Switcher erscheinen
        // undefined oder nicht gesetzt = alle enabled Themes/Designs werden verwendet
        switcherType: 'combined',
        position: 'top-right'
      }
    }
    
    // Merge discovered themes with config (config overrides discovered)
    const mergedThemes = { ...discoveredThemes }
    if (existingThemeConfig?.themes) {
      Object.keys(existingThemeConfig.themes).forEach(themeId => {
        mergedThemes[themeId] = {
          ...discoveredThemes[themeId],
          ...existingThemeConfig.themes[themeId]
        }
      })
    }
    themeConfig.themes = mergedThemes
    
    // Merge discovered designs with config (config overrides discovered)
    const mergedDesigns = { ...discoveredDesigns }
    if (existingThemeConfig?.designs) {
      Object.keys(existingThemeConfig.designs).forEach(designId => {
        mergedDesigns[designId] = {
          ...discoveredDesigns[designId],
          ...existingThemeConfig.designs[designId]
        }
      })
    }
    themeConfig.designs = mergedDesigns
    
    // Include layout settings in response
    const responseConfig = {
      ...themeConfig,
      layout: {
        global: layoutConfig.global || {
          template: 'sidebar-left',
          displayMode: 'portfolio'
        },
        sections: layoutConfig.sections || {
          projects: { template: 'grid' },
          skills: { template: 'grid' },
          timeline: { template: 'vertical' },
          blog: { template: 'list' },
          aboutMe: { template: 'centered' },
          contact: { template: 'centered' }
        }
      }
    }
    
    return NextResponse.json({ config: responseConfig })
  } catch (error) {
    console.error('Theme config GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST: Save theme configuration
export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json()
    
    // Read existing config.json
    const configDir = path.join(DATA_DIR, 'config')
    await fs.mkdir(configDir, { recursive: true })
    
    const configPath = path.join(configDir, 'config.json')
    let configJson: any = {}
    
    try {
      const existingContent = await fs.readFile(configPath, 'utf-8')
      configJson = JSON.parse(existingContent)
    } catch {
      // File doesn't exist, start with empty object
    }
    
    // Update theme config in config.json
    if (!configJson.portfolio) {
      configJson.portfolio = {}
    }
    if (!configJson.portfolio.features) {
      configJson.portfolio.features = {}
    }
    configJson.portfolio.features.theme = config
    
    // Write updated config.json
    await fs.writeFile(configPath, JSON.stringify(configJson, null, 2))
    
    return NextResponse.json({ success: true, message: 'Theme configuration saved' })
  } catch (error) {
    console.error('Theme config POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

