// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // IMPORTANT: Replace 'auth_token' with the actual name of your authentication cookie.
  // This cookie should be set upon successful login (ideally as HttpOnly, Secure).
  const authTokenCookie = request.cookies.get('auth_token')?.value;

  if (!authTokenCookie) {
    // If no auth token cookie is found, redirect to the login page.
    // The `matcher` in the config below ensures this middleware only runs for /admin/* routes.
    const loginUrl = new URL('/login', request.url);

    // Optional: You can add a 'from' query parameter to redirect the user back
    // to the originally requested page after successful login.
    // loginUrl.searchParams.set('from', request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  // If the auth token cookie exists, allow the request to proceed.
  return NextResponse.next();
}

export const config = {
  // This matcher applies the middleware to all routes under the /admin path.
  // For example: /admin, /admin/projects, /admin/settings, etc.
  matcher: ['/admin/:path*'],
};
