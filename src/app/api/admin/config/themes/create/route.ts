import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { generateThemeCSS, validateThemeId, type ThemeConfig } from '@/features/shared/utils/themeGenerator'

const THEMES_DIR = path.join(process.cwd(), 'src/styles/themes')

// POST: Create a new theme
export async function POST(request: NextRequest) {
  try {
    const config: ThemeConfig = await request.json()
    
    // Validate theme ID
    const validation = validateThemeId(config.id)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check if theme already exists
    const themePath = path.join(THEMES_DIR, `${config.id}.css`)
    try {
      await fs.access(themePath)
      return NextResponse.json(
        { error: `Theme "${config.id}" already exists` },
        { status: 409 }
      )
    } catch {
      // File doesn't exist, which is good
    }

    // Ensure themes directory exists
    await fs.mkdir(THEMES_DIR, { recursive: true })

    // Generate CSS content
    const cssContent = generateThemeCSS(config)

    // Write theme file
    await fs.writeFile(themePath, cssContent, 'utf-8')

    return NextResponse.json({
      success: true,
      message: `Theme "${config.name}" created successfully`,
      theme: {
        id: config.id,
        name: config.name
      }
    })
  } catch (error) {
    console.error('Theme creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

