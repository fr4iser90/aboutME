import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getAuthConfig, isCustomAuthEnabled, validateAuthConfig } from '@/features/auth/services/auth-config';
import { verifyAdminPassword, createSecureSession, getCSRFToken, deleteSecureSession, validateSecureSession } from '@/features/auth/services/auth';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Portfolio Status Detection für Backend-driven Redirects
 */
async function getPortfolioStatus(): Promise<'unconfigured' | 'building' | 'active'> {
  try {
    const DATA_DIR = path.join(process.cwd(), 'public/data');
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
    
    if (!allFilesExist) {
      return 'unconfigured';
    }
    
    // Check for CSS changes
    const hasCSSChanges = await checkCSSChanges();
    if (hasCSSChanges) {
      return 'building';
    }
    
    return 'active';
  } catch (error) {
    console.error('Portfolio status detection error:', error);
    return 'unconfigured';
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

/**
 * SICHERE Login API
 * 
 * Features:
 * - Brute-Force Protection
 * - IP-basierte Rate Limiting
 * - Timing-Attack Protection
 * - CSRF-Token Generation
 * - Sichere Session-Verwaltung
 */
export async function POST(request: NextRequest) {
  try {
    // Auth-Konfiguration prüfen
    const authValidation = validateAuthConfig();
    if (!authValidation.valid) {
      return NextResponse.json({
        error: 'Auth configuration invalid',
        details: authValidation.errors
      }, { status: 400 });
    }
    
    const authConfig = getAuthConfig();
    
    // Prüfe ob Custom Auth aktiviert ist
    if (!isCustomAuthEnabled()) {
      return NextResponse.json({
        error: 'Custom auth is not enabled'
      }, { status: 400 });
    }
    
    // Request Body parsen
    const { password } = await request.json();
    
    // Passwort validieren mit zentralem Auth-Service
    if (verifyAdminPassword(password)) {
      // SICHERE Session erstellen mit CSRF-Token
      const sessionId = createSecureSession(request);
      
      // CSRF-Token für Session abrufen
      const csrfToken = getCSRFToken(sessionId);
      
      // BACKEND-DRIVEN REDIRECT: Portfolio Status bestimmen
      const portfolioStatus = await getPortfolioStatus();
      let redirectPath: string;
      
      switch (portfolioStatus) {
        case 'unconfigured':
          redirectPath = '/admin/setup';
          break;
        case 'building':
          redirectPath = '/admin/content';
          break;
        case 'active':
          redirectPath = '/admin/content';
          break;
        default:
          redirectPath = '/admin/setup';
      }
      
      // Session-Cookie setzen
      const response = NextResponse.json({
        message: 'Login successful',
        redirect: redirectPath,
        portfolioStatus: portfolioStatus,
        csrfToken: csrfToken // Echter CSRF-Token
      });
      
      // Session-Cookie setzen
      response.cookies.set('admin_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure in Production
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 8 * 60 * 60, // 8 Stunden
        path: '/'
      });
      
      return response;
    } else {
      return NextResponse.json({
        error: 'Invalid password'
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * SICHERE Logout API
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('admin_session');
    
    if (sessionCookie) {
      deleteSecureSession(sessionCookie.value);
    }
    
    // Session-Cookie löschen
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    
    return NextResponse.json({
      success: true,
      message: 'Logout successful',
      redirect: '/'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * SICHERE Auth-Status API
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('admin_session');
    
    if (!sessionCookie) {
      return NextResponse.json({
        authenticated: false,
        message: 'No session found'
      });
    }
    
    // SICHERE Session-Validierung mit IP-Check
    const isValid = validateSecureSession(sessionCookie.value, request);
    
    if (!isValid) {
      return NextResponse.json({
        authenticated: false,
        message: 'Session expired or invalid'
      });
    }
    
    // CSRF-Token für weitere Requests
    const csrfToken = getCSRFToken(sessionCookie.value);
    
    return NextResponse.json({
      authenticated: true,
      message: 'Authenticated',
      csrfToken: csrfToken
    });
    
  } catch (error) {
    console.error('Auth status error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
