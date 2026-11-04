import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Setup Status API Route
 * 
 * Provides setup mode detection for Edge Runtime compatibility.
 * Checks configuration files and returns current setup status.
 */

const DATA_DIR = path.join(process.cwd(), 'public/data');

export async function GET(request: NextRequest) {
  try {
    // Check if critical configuration files exist (verschachtelte Struktur)
    const configFiles = [
      path.join(DATA_DIR, 'config', 'config.json'),
      path.join(DATA_DIR, 'user', 'user.json'),
      path.join(DATA_DIR, 'projects', 'projects.json')
    ];
    
    const fileChecks = await Promise.all(
      configFiles.map(async (filePath) => {
        try {
          await fs.access(filePath);
          return true;
        } catch {
          return false;
        }
      })
    );
    
    const allFilesExist = fileChecks.every(exists => exists);
    
    // Check if setup mode is allowed
    const setupModeAllowed = process.env.NODE_ENV === 'development' || 
                             process.env.NODE_ENV === 'test';
    
    const setupModeEnabled = process.env.SETUP_MODE === 'true';
    
    // Determine portfolio status
    let portfolioStatus: 'unconfigured' | 'building' | 'active' | null = null;
    
    if (!allFilesExist && setupModeAllowed && setupModeEnabled) {
      portfolioStatus = 'unconfigured';
    } else if (allFilesExist) {
      try {
        const statusRaw = await fs.readFile(
          path.join(DATA_DIR, 'config', 'site-status.json'),
          'utf8'
        );
        const siteStatus = JSON.parse(statusRaw);
        portfolioStatus =
          siteStatus.published || siteStatus.validated ? 'active' : 'building';
      } catch {
        portfolioStatus = 'building';
      }
    }
    
    return NextResponse.json({
      isConfigured: allFilesExist,
      setupModeAllowed,
      setupModeEnabled,
      portfolioStatus,
      configFiles: {
        config: fileChecks[0],
        user: fileChecks[1],
        projects: fileChecks[2]
      }
    });
    
  } catch (error) {
    console.error('Setup status API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      isConfigured: false,
      portfolioStatus: 'unconfigured'
    }, { status: 500 });
  }
}
