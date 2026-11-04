import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { requireAdmin } from '@/features/auth/services/requireAdmin'

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data')
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data')
const PORTFOLIO_CONFIG_FILE = path.join(process.cwd(), 'portfolio.config.js')

async function readPortfolioConfig(): Promise<any> {
  try {
    const configContent = await fs.readFile(PORTFOLIO_CONFIG_FILE, 'utf-8')
    const moduleMatch = configContent.match(/module\.exports\s*=\s*({[\s\S]*});?\s*$/)
    if (moduleMatch) {
      const configStr = moduleMatch[1]
      return eval(`(function() { const path = require('path'); return (${configStr}); })()`)
    }
    return {}
  } catch {
    return {}
  }
}

async function readConfigJson(baseDir: string): Promise<any> {
  try {
    const configPath = path.join(baseDir, 'config', 'config.json')
    return JSON.parse(await fs.readFile(configPath, 'utf-8'))
  } catch {
    return {}
  }
}

function normalizeGlobalLayout(raw: any) {
  const layout = raw?.layout || raw?.displayMode || 'portfolio'
  return {
    layout,
    displayMode: layout,
    template: raw?.template || 'sidebar-left',
  }
}

export async function GET() {
  try {
    const portfolioConfig = await readPortfolioConfig()
    const privateJson = await readConfigJson(PRIVATE_DATA_DIR)
    const publicJson = await readConfigJson(PUBLIC_DATA_DIR)

    const layoutConfig = normalizeGlobalLayout(
      portfolioConfig.layout?.global ||
        privateJson.portfolio?.layout?.global ||
        publicJson.portfolio?.layout?.global ||
        { displayMode: 'portfolio' }
    )

    return NextResponse.json({
      config: {
        globalLayout: layoutConfig,
      },
    })
  } catch (error) {
    console.error('Layout config GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const { config } = await request.json()

    if (!config || !config.globalLayout) {
      return NextResponse.json(
        { error: 'Invalid config structure. Expected { globalLayout: { layout|displayMode } }' },
        { status: 400 }
      )
    }

    const globalLayout = normalizeGlobalLayout(config.globalLayout)

    for (const baseDir of [PRIVATE_DATA_DIR, PUBLIC_DATA_DIR]) {
      const configDir = path.join(baseDir, 'config')
      await fs.mkdir(configDir, { recursive: true })
      const configPath = path.join(configDir, 'config.json')
      let configJson: any = {}
      try {
        configJson = JSON.parse(await fs.readFile(configPath, 'utf-8'))
      } catch {
        /* new */
      }
      if (!configJson.portfolio) configJson.portfolio = {}
      if (!configJson.portfolio.layout) configJson.portfolio.layout = {}
      configJson.portfolio.layout.global = globalLayout
      await fs.writeFile(configPath, JSON.stringify(configJson, null, 2))
    }

    return NextResponse.json({
      success: true,
      message: 'Global layout configuration saved',
      globalLayout,
    })
  } catch (error) {
    console.error('Layout config POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
