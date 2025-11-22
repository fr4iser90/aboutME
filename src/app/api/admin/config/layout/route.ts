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

// GET: Read global layout configuration
export async function GET() {
  try {
    const portfolioConfig = await readPortfolioConfig()
    const configJson = await readConfigJson()
    
    // Get layout config from portfolio.config.js or config.json
    const layoutConfig = portfolioConfig.layout?.global || configJson.portfolio?.layout?.global || {
      template: 'sidebar-left',
      displayMode: 'portfolio'
    }
    
    return NextResponse.json({ 
      config: {
        globalLayout: layoutConfig
      }
    })
  } catch (error) {
    console.error('Layout config GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST: Save global layout configuration
export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json()
    
    // Validate config structure
    if (!config || !config.globalLayout) {
      return NextResponse.json(
        { error: 'Invalid config structure. Expected { globalLayout: { template, displayMode } }' },
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
    
    // Update layout config in config.json
    if (!configJson.portfolio) {
      configJson.portfolio = {}
    }
    if (!configJson.portfolio.layout) {
      configJson.portfolio.layout = {}
    }
    configJson.portfolio.layout.global = config.globalLayout
    
    // Write updated config.json
    await fs.writeFile(configPath, JSON.stringify(configJson, null, 2))
    
    return NextResponse.json({ success: true, message: 'Global layout configuration saved' })
  } catch (error) {
    console.error('Layout config POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

