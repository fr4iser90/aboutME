import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Setup Disable API Route
 * 
 * Disables setup mode after successful configuration.
 * Updates config.json to mark setup as completed.
 */

const DATA_DIR = path.join(process.cwd(), 'public/data');

export async function POST(request: NextRequest) {
  try {
    const configPath = path.join(DATA_DIR, 'config', 'config.json');
    
    // Check if config file exists
    try {
      await fs.access(configPath);
    } catch {
      return NextResponse.json({
        error: 'Config file not found. Setup must be completed first.'
      }, { status: 404 });
    }
    
    // Read existing config
    const existingConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
    
    existingConfig.setup.completed = true;
    existingConfig.setup.completedAt = new Date().toISOString();
    existingConfig.security.setupModeDisabled = true;
    
    await fs.writeFile(configPath, JSON.stringify(existingConfig, null, 2));
    
    return NextResponse.json({
      message: 'Setup mode disabled successfully',
      config: {
        completed: true,
        completedAt: existingConfig.setup.completedAt,
        setupModeDisabled: true
      }
    });
    
  } catch (error) {
    console.error('Setup disable API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
