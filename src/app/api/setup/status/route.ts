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
      // Check for CSS changes
      const hasCSSChanges = await checkCSSChanges();
      if (hasCSSChanges) {
        portfolioStatus = 'building';
      } else {
        // Check if admin is logged in (simplified check)
        const sessionCookie = request.cookies.get('admin_session')?.value;
        if (sessionCookie) {
          portfolioStatus = 'active';
        }
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

/**
 * Check if CSS files have changed since last build
 */
async function checkCSSChanges(): Promise<boolean> {
  try {
    const cssFiles = [
      path.join(process.cwd(), 'src/app/globals.css'),
      path.join(process.cwd(), 'uno.config.ts')
    ];

    const lastBuildTime = await getLastBuildTimestamp();
    
    for (const filePath of cssFiles) {
      try {
        const stats = await fs.stat(filePath);
        if (stats.mtime.getTime() > lastBuildTime) {
          return true;
        }
      } catch {
        // File doesn't exist, skip
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking CSS changes:', error);
    return false;
  }
}

/**
 * Get last build timestamp
 */
async function getLastBuildTimestamp(): Promise<number> {
  const buildInfoPath = path.join(process.cwd(), '.next/build-info.json');
  
  try {
    const buildInfo = JSON.parse(await fs.readFile(buildInfoPath, 'utf8'));
    return buildInfo.lastBuildTime || 0;
  } catch {
    return 0;
  }
}
