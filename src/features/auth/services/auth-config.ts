/**
 * Single-admin auth only.
 * One ADMIN_PASSWORD via cookie session — no OAuth / multi-user.
 */

export type AuthMode = 'custom'

export interface AuthConfig {
  mode: AuthMode
  enableCustomAuth: true
  enableGoogleOAuth: false
  adminPassword?: string
}

export function getAuthConfig(): AuthConfig {
  return {
    mode: 'custom',
    enableCustomAuth: true,
    enableGoogleOAuth: false,
    adminPassword: process.env.ADMIN_PASSWORD,
  }
}

export function isCustomAuthEnabled(): boolean {
  return true
}

export function isOAuthEnabled(): boolean {
  return false
}

export function isHybridAuthEnabled(): boolean {
  return false
}

export function validateAuthConfig(): { valid: boolean; errors: string[] } {
  return { valid: true, errors: [] }
}

export function getAvailableAuthModes(): string[] {
  return ['custom']
}

export function getLoginType(): 'custom' {
  return 'custom'
}
