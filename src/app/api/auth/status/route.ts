import { NextRequest, NextResponse } from 'next/server';
import { 
  getAuthConfig, 
  validateAuthConfig, 
  getAvailableAuthModes,
  isCustomAuthEnabled,
  isOAuthEnabled,
  isHybridAuthEnabled
} from '@/features/auth/services/auth-config';
import { validateSecureSession, getCSRFToken } from '@/features/auth/services/auth';

/**
 * AUTH STATUS API
 * 
 * Gibt Auth-Konfiguration und verfügbare Modi zurück
 */
export async function GET(request: NextRequest) {
  try {
    const authConfig = getAuthConfig();
    const authValidation = validateAuthConfig();
    
    // Session-Status prüfen
    const sessionCookie = request.cookies.get('admin_session');
    const isAuthenticated = sessionCookie ? validateSecureSession(sessionCookie.value, request) : false;
    const csrfToken = sessionCookie ? getCSRFToken(sessionCookie.value) : null;
    
    return NextResponse.json({
      isAuthenticated: isAuthenticated,
      authenticated: isAuthenticated, // Backward compatibility
      csrfToken: csrfToken,
      hasPassword: !!process.env.ADMIN_PASSWORD,
      authConfig: {
        mode: authConfig.mode,
        availableModes: getAvailableAuthModes(),
        customAuthEnabled: isCustomAuthEnabled(),
        oauthEnabled: isOAuthEnabled(),
        hybridEnabled: isHybridAuthEnabled()
      },
      validation: authValidation
    });
    
  } catch (error) {
    console.error('Auth status error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
