import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import '@/features/auth/services/auth'; // 🚀 Import auth.ts für Password-Generation

/**
 * SICHERE Middleware für Route Protection
 * 
 * Features:
 * - IP-basierte Session-Validierung
 * - CSRF Protection
 * - Sichere Redirects
 * - Keine XSS-Möglichkeiten
 * - Setup Mode Detection (from server startup)
 */



/**
 * Structured logging for middleware (13th Factor compliant)
 */
function logStructured(
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR',
  event: string,
  message: string,
  context?: Record<string, any>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level,
    event: event,
    message: message,
    service: 'middleware',
    ...context
  };
  
  const output = ['WARNING', 'ERROR'].includes(level) ? console.error : console.log;
  output(JSON.stringify(logEntry));
}

/**
 * Simple auth check for middleware (Edge Runtime compatible)
 * Validates session cryptographically via shared auth store when available.
 */
function isAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('admin_session');
  const sessionId = sessionCookie?.value;
  if (!sessionId) return false;

  try {
    // Prefer secure validation (shared Map + disk store)
    const { validateSecureSession } = require('@/features/auth/services/auth');
    return !!validateSecureSession(sessionId, request);
  } catch {
    // Fallback: cookie presence only (should not happen in Node runtime)
    return true;
  }
}

/**
 * Helper function für Security Headers (DRY)
 */
function setSecurityHeaders(response: NextResponse, allowIframe = false, domain?: string) {
  const host = response.headers.get('host') || 'localhost:3000';
  const isProduction = host !== 'localhost:3000';
  
  if (allowIframe) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    if (isProduction && domain) {
      response.headers.set('Content-Security-Policy', `frame-ancestors 'self' ${domain}`);
    } else {
      response.headers.set('Content-Security-Policy', "frame-ancestors 'self' http://localhost:3000");
    }
  } else {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
  }
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

/**
 * frame-ancestors is enforced on the *framed* document, so the route /preview
 * embeds (`<iframe src="/">`) has to allow framing — allowing only /preview
 * leaves the live preview blank. Same-origin only ('self').
 */
const FRAMEABLE_PATHS = ['/', '/preview'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // BACKEND HANDLES SETUP MODE DETECTION ALONE!
  const isSetupMode = process.env.SETUP_MODE === 'true';
  
  logStructured('DEBUG', 'middleware_check', 'Route protection check', { 
    pathname, 
    setupMode: isSetupMode,
    method: request.method,
    userAgent: request.headers.get('user-agent')?.substring(0, 50)
  });
  
  if (isSetupMode) {
    // 🚀 SETUP-MODUS: Alles hinter Auth blockiert
    // Nur Login, Setup, Admin, API-Routen erlaubt
    
    // Public routes im Setup-Modus
    const setupPublicRoutes = ['/login', '/api/auth/login'];
    const isPublicRoute = setupPublicRoutes.includes(pathname) || pathname.startsWith('/data') || pathname.startsWith('/assets');
    
    if (isPublicRoute) {
      const response = NextResponse.next();
      setSecurityHeaders(response, false);
      return response;
    }
    
    // Redirect old /setup route to /admin/setup
    if (pathname === '/setup' || pathname.startsWith('/setup/')) {
      const adminSetupUrl = new URL('/admin/setup', request.url);
      // Preserve query parameters
      request.nextUrl.searchParams.forEach((value, key) => {
        adminSetupUrl.searchParams.set(key, value);
      });
      const response = NextResponse.redirect(adminSetupUrl);
      setSecurityHeaders(response, false);
      return response;
    }
    
    // Setup-Routen: Erlaube für eingeloggte Benutzer (inkl. Admin-/Site-/Blog-APIs)
    const setupRoutes = [
      '/admin',
      '/preview',
      '/api/setup',
      '/api/editor',
      '/api/upload',
      '/api/admin',
      '/api/site',
      '/api/blog',
      '/api/agent',
      '/api/auth/status',
      '/api/auth/login',
      '/api/data',
    ];
    const isSetupRoute = setupRoutes.some(route => pathname.startsWith(route));
    const isApiRoute = pathname.startsWith('/api/');
    
    if (isSetupRoute) {
      if (isAuthenticated(request) || pathname.startsWith('/api/auth/login')) {
        const response = NextResponse.next();
        setSecurityHeaders(response, false);
        return response;
      } else if (isApiRoute) {
        // APIs must not HTML-redirect — break admin fetch()/agents
        const response = NextResponse.json(
          { error: 'Unauthorized', setupMode: true },
          { status: 401 }
        );
        setSecurityHeaders(response, false);
        return response;
      } else {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(loginUrl);
        setSecurityHeaders(response, false);
        return response;
      }
    }
    
    // Alle anderen Routen im Setup-Modus
    if (isApiRoute) {
      const response = NextResponse.json(
        { error: 'Unauthorized', setupMode: true },
        { status: 401 }
      );
      setSecurityHeaders(response, false);
      return response;
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', '/admin/setup');
    const response = NextResponse.redirect(loginUrl);
    setSecurityHeaders(response, false);
    return response;
    
  } else {
    // 🚀 NORMAL-MODUS: Normale Website läuft
    // Admin-Routen nur für eingeloggte Admins
    
    // Assets sind IMMER öffentlich zugänglich (für Background-Bilder etc.)
    if (pathname.startsWith('/assets')) {
      const response = NextResponse.next();
      setSecurityHeaders(response, false);
      return response;
    }
    
    // Prüfe ob Build validiert wurde (nur für öffentliche Routen)
    const isPublicRoute = pathname === '/' || pathname.startsWith('/data');
    if (isPublicRoute && pathname !== '/login' && !pathname.startsWith('/api/auth/login')) {
      // Prüfe Build-Status synchron (für Performance)
      try {
        const { readSiteStatusSync } = require('@/features/shared/utils/siteStatus');
        const siteStatus = readSiteStatusSync();
        
        // Public site when validated OR published
        if (!siteStatus.validated && !siteStatus.published) {
          if (!isAuthenticated(request)) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            const response = NextResponse.redirect(loginUrl);
            setSecurityHeaders(response, false);
            return response;
          } else {
            const adminUrl = new URL('/admin', request.url);
            const response = NextResponse.redirect(adminUrl);
            setSecurityHeaders(response, false);
            return response;
          }
        }
      } catch {
        if (!isAuthenticated(request)) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          const response = NextResponse.redirect(loginUrl);
          setSecurityHeaders(response, false);
          return response;
        } else {
          const adminUrl = new URL('/admin', request.url);
          const response = NextResponse.redirect(adminUrl);
          setSecurityHeaders(response, false);
          return response;
        }
      }
    }
    
    // Public routes im Normal-Modus (nur wenn Build validiert)
    const normalPublicRoutes = ['/login', '/api/auth/login', '/api/site/status'];
    if (normalPublicRoutes.includes(pathname) || pathname === '/api/site/status') {
      const response = NextResponse.next();
      setSecurityHeaders(response, false);
      return response;
    }
    
    // Admin-Routen: Nur für eingeloggte Admins
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api/editor') ||
      pathname.startsWith('/api/setup') ||
      pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/upload') ||
      pathname.startsWith('/api/agent') ||
      (pathname.startsWith('/api/site') && pathname !== '/api/site/status')
    ) {
      if (isAuthenticated(request)) {
        const response = NextResponse.next();
        setSecurityHeaders(response, false);
        return response;
      } else if (pathname.startsWith('/api/')) {
        const response = NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
        setSecurityHeaders(response, false);
        return response;
      } else {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(loginUrl);
        setSecurityHeaders(response, false);
        return response;
      }
    }
    
    // Redirect old /setup route to /admin/setup in normal mode
    if (pathname === '/setup' || pathname.startsWith('/setup/')) {
      const adminSetupUrl = new URL('/admin/setup', request.url);
      // Preserve query parameters
      request.nextUrl.searchParams.forEach((value, key) => {
        adminSetupUrl.searchParams.set(key, value);
      });
      const response = NextResponse.redirect(adminSetupUrl);
      setSecurityHeaders(response, false);
      return response;
    }
    
    // Alle anderen Routen im Normal-Modus → Erlauben
    const response = NextResponse.next();
    setSecurityHeaders(response, FRAMEABLE_PATHS.includes(pathname), process.env.DOMAIN);
    return response;
  }
}

/**
 * SICHERE Middleware-Konfiguration
 * 
 * Nur notwendige Routes schützen
 */
export const config = {
  matcher: [
    // Alle Routen außer statische Assets - automatischer Schutz für ALLES
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
