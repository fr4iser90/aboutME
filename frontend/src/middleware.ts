// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`[Middleware] Processing path: ${path}`);
  
  // Nur Admin-Routen schützen
  if (path.startsWith('/admin')) {
    console.log('[Middleware] Admin route detected');
    const authToken = request.cookies.get('auth_token');
    console.log('[Middleware] Auth token present:', !!authToken);
    
    if (!authToken) {
      console.log('[Middleware] No auth token found, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    try {
      console.log('[Middleware] Validating admin token');
      const response = await fetch('http://localhost:8090/api/auth/validate', {
        headers: {
          Cookie: `auth_token=${authToken.value}`
        }
      });
      
      if (!response.ok) {
        console.log('[Middleware] Token invalid, redirecting to login');
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
      
      console.log('[Middleware] Admin access granted');
    } catch (error) {
      console.error('[Middleware] Error during token validation:', error);
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
