import { NextRequest, NextResponse } from 'next/server'
import {
  getAuthConfig,
  validateAuthConfig,
  getAvailableAuthModes,
  isCustomAuthEnabled,
} from '@/features/auth/services/auth-config'
import { validateSecureSession, getCSRFToken } from '@/features/auth/services/auth'

/**
 * Auth status — single-admin password session.
 */
export async function GET(request: NextRequest) {
  try {
    const authConfig = getAuthConfig()
    const authValidation = validateAuthConfig()

    const sessionCookie = request.cookies.get('admin_session')
    const isAuthenticated = sessionCookie
      ? validateSecureSession(sessionCookie.value, request)
      : false
    const csrfToken = sessionCookie ? getCSRFToken(sessionCookie.value) : null

    return NextResponse.json({
      isAuthenticated,
      authenticated: isAuthenticated,
      csrfToken,
      hasPassword: !!process.env.ADMIN_PASSWORD,
      singleAdmin: true,
      authConfig: {
        mode: authConfig.mode,
        availableModes: getAvailableAuthModes(),
        customAuthEnabled: isCustomAuthEnabled(),
        oauthEnabled: false,
        hybridEnabled: false,
      },
      validation: authValidation,
    })
  } catch (error) {
    console.error('Auth status error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
