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

// GET: Read section layout configurations
export async function GET() {
  try {
    const portfolioConfig = readPortfolioConfig()
    const configJson = readConfigJson()
    
    // Get section layouts from portfolio.config.js or config.json
    // NO hardcoded defaults - components have their own defaults
    const sectionLayouts = (await portfolioConfig).layout?.sections || (await configJson).portfolio?.layout?.sections || {}
    
    return NextResponse.json({ 
      config: {
        sectionLayouts
      }
    })
  } catch (error) {
    console.error('Section layouts GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST: Save section layout configurations
export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json()
    
    // Validate config structure
    if (!config || !config.sectionLayouts) {
      return NextResponse.json(
        { error: 'Invalid config structure. Expected { sectionLayouts: { projects, skills, ... } }' },
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
    
    // Update section layouts in config.json
    if (!configJson.portfolio) {
      configJson.portfolio = {}
    }
    if (!configJson.portfolio.layout) {
      configJson.portfolio.layout = {}
    }
    configJson.portfolio.layout.sections = config.sectionLayouts
    
    // Write updated config.json
    await fs.writeFile(configPath, JSON.stringify(configJson, null, 2))
    
    return NextResponse.json({ success: true, message: 'Section layout configurations saved' })
  } catch (error) {
    console.error('Section layouts POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

