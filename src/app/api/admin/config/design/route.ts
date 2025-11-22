import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'public/data')
const PORTFOLIO_CONFIG_FILE = path.join(process.cwd(), 'portfolio.config.js')

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

// GET: Read design configuration
export async function GET() {
  try {
    const portfolioConfig = await readPortfolioConfig()
    const configJson = await readConfigJson()
    
    // Get design config from portfolio.config.js or config.json (same as theme route)
    // Use same default as theme route to ensure consistency
    const designConfig = portfolioConfig.features?.theme?.designs || configJson.portfolio?.features?.theme?.designs || {
      glassmorphism: {
        id: 'glassmorphism',
        name: 'Glassmorphism',
        description: 'EFFECT: Glassmorphism | LAYOUT: Default (sidebar-left) | BACKGROUND: Galaxy image',
        enabled: true,
        defaultLayout: 'sidebar-left'
      },
      'modern-glass': {
        id: 'modern-glass',
        name: 'Modern Glass',
        description: 'EFFECT: Glassmorphism | LAYOUT: Full-width | BACKGROUND: Galaxy image',
        enabled: true,
        defaultLayout: 'full-width'
      },
      'minimal-clean': {
        id: 'minimal-clean',
        name: 'Minimal Clean',
        description: 'EFFECT: Clean | LAYOUT: Centered | BACKGROUND: White (no image)',
        enabled: true,
        defaultLayout: 'centered'
      },
      cyberpunk: {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: 'EFFECT: Cyberpunk | LAYOUT: Sidebar-left | BACKGROUND: Neon image',
        enabled: true,
        defaultLayout: 'sidebar-left'
      },
      flat: {
        id: 'flat',
        name: 'Flat',
        description: 'EFFECT: Flat | LAYOUT: Default (sidebar-left) | BACKGROUND: Theme background',
        enabled: true,
        defaultLayout: 'sidebar-left'
      },
      minimal: {
        id: 'minimal',
        name: 'Minimal',
        description: 'EFFECT: Minimal | LAYOUT: Two-column | BACKGROUND: Transparent (shows theme)',
        enabled: true,
        defaultLayout: 'two-column'
      },
      clean: {
        id: 'clean',
        name: 'Clean',
        description: 'EFFECT: Clean | LAYOUT: Centered | BACKGROUND: White (no image)',
        enabled: true,
        defaultLayout: 'centered'
      },
      neumorphism: {
        id: 'neumorphism',
        name: 'Neumorphism',
        description: 'EFFECT: Neumorphism | LAYOUT: Sidebar-right | BACKGROUND: Gradient (no image)',
        enabled: true,
        defaultLayout: 'sidebar-right'
      },
      gradient: {
        id: 'gradient',
        name: 'Gradient',
        description: 'EFFECT: Gradient | LAYOUT: Masonry | BACKGROUND: Animated gradient (no image)',
        enabled: true,
        defaultLayout: 'masonry'
      }
    }
    
    const defaultDesign = portfolioConfig.features?.theme?.defaultDesign || configJson.portfolio?.features?.theme?.defaultDesign || 'glassmorphism'
    
    return NextResponse.json({ 
      config: {
        defaultDesign,
        designs: designConfig
      }
    })
  } catch (error) {
    console.error('Design config GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST: Save design configuration
export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json()
    
    // Validate config structure
    if (!config || !config.designs) {
      return NextResponse.json(
        { error: 'Invalid config structure' },
        { status: 400 }
      )
    }
    
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
    
    // Update design config in config.json
    if (!configJson.portfolio) {
      configJson.portfolio = {}
    }
    if (!configJson.portfolio.features) {
      configJson.portfolio.features = {}
    }
    if (!configJson.portfolio.features.theme) {
      configJson.portfolio.features.theme = {}
    }
    configJson.portfolio.features.theme.designs = config.designs
    if (config.defaultDesign) {
      configJson.portfolio.features.theme.defaultDesign = config.defaultDesign
    }
    
    // Write updated config.json
    await fs.writeFile(configPath, JSON.stringify(configJson, null, 2))
    
    return NextResponse.json({ success: true, message: 'Design configuration saved' })
  } catch (error) {
    console.error('Design config POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

