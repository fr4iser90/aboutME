import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { generateEffectCSS, validateEffectId, type EffectConfig } from '@/features/shared/utils/effectGenerator'

const EFFECTS_DIR = path.join(process.cwd(), 'src/styles/effects')

// POST: Create a new effect
export async function POST(request: NextRequest) {
  try {
    const config: EffectConfig = await request.json()
    
    // Validate effect ID
    const validation = validateEffectId(config.id)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check if effect already exists
    const effectPath = path.join(EFFECTS_DIR, `${config.id}.css`)
    try {
      await fs.access(effectPath)
      return NextResponse.json(
        { error: `Effect "${config.id}" already exists` },
        { status: 409 }
      )
    } catch {
      // File doesn't exist, which is good
    }

    // Ensure effects directory exists
    await fs.mkdir(EFFECTS_DIR, { recursive: true })

    // Generate CSS content
    const cssContent = generateEffectCSS(config)

    // Write effect file
    await fs.writeFile(effectPath, cssContent, 'utf-8')

    return NextResponse.json({
      success: true,
      message: `Effect "${config.name}" created successfully`,
      effect: {
        id: config.id,
        name: config.name
      }
    })
  } catch (error) {
    console.error('Effect creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

