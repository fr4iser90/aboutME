/**
 * FLEXIBLE AUTH-MODE SYSTEM
 * 
 * Unterstützt verschiedene Authentifizierungs-Modi:
 * - Custom Auth (Admin-Password)
 * - OAuth (Google, GitHub, etc.)
 * - Hybrid (Beide)
 */

export type AuthMode = 'custom' | 'oauth' | 'both';

export interface AuthConfig {
  mode: AuthMode;
  enableGoogleOAuth: boolean;
  enableCustomAuth: boolean;
  adminPassword?: string;
  googleClientId?: string;
  googleClientSecret?: string;
}

/**
 * Auth-Mode Detection
 */
export function getAuthConfig(): AuthConfig {
  const authMode = (process.env.AUTH_MODE as AuthMode) || 'custom';
  
  return {
    mode: authMode,
    enableGoogleOAuth: authMode === 'oauth' || authMode === 'both',
    enableCustomAuth: authMode === 'custom' || authMode === 'both',
    adminPassword: process.env.ADMIN_PASSWORD,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
  };
}

/**
 * Prüft ob Custom Auth aktiviert ist
 */
export function isCustomAuthEnabled(): boolean {
  const config = getAuthConfig();
  // Custom Auth ist aktiviert wenn der Mode 'custom' oder 'both' ist
  // Das Passwort wird dynamisch generiert wenn nicht in .env gesetzt
  return config.enableCustomAuth;
}

/**
 * Prüft ob OAuth aktiviert ist
 */
export function isOAuthEnabled(): boolean {
  const config = getAuthConfig();
  return config.enableGoogleOAuth && !!config.googleClientId && !!config.googleClientSecret;
}

/**
 * Prüft ob beide Auth-Modi verfügbar sind
 */
export function isHybridAuthEnabled(): boolean {
  return isCustomAuthEnabled() && isOAuthEnabled();
}

/**
 * Validiert Auth-Konfiguration
 */
export function validateAuthConfig(): { valid: boolean; errors: string[] } {
  const config = getAuthConfig();
  const errors: string[] = [];
  
  // Prüfe Auth-Mode
  if (!['custom', 'oauth', 'both'].includes(config.mode)) {
    errors.push('AUTH_MODE must be: custom, oauth, or both');
  }
  
  // Prüfe Custom Auth - Passwort wird dynamisch generiert wenn nicht in .env gesetzt
  // Keine Validierung nötig da generateSecurePassword() automatisch ein Passwort erstellt
  
  // Prüfe OAuth
  if (config.enableGoogleOAuth) {
    if (!config.googleClientId) {
      errors.push('GOOGLE_CLIENT_ID is required for OAuth');
    }
    if (!config.googleClientSecret) {
      errors.push('GOOGLE_CLIENT_SECRET is required for OAuth');
    }
  }
  
  // Prüfe ob mindestens ein Auth-Mode konfiguriert ist
  if (!config.enableCustomAuth && !config.enableGoogleOAuth) {
    errors.push('At least one auth mode must be enabled');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Gibt verfügbare Auth-Modi zurück
 */
export function getAvailableAuthModes(): string[] {
  const modes: string[] = [];
  
  if (isCustomAuthEnabled()) {
    modes.push('custom');
  }
  
  if (isOAuthEnabled()) {
    modes.push('oauth');
  }
  
  return modes;
}

/**
 * Login-Type Detection für UI
 */
export function getLoginType(): 'custom' | 'oauth' | 'hybrid' {
  if (isHybridAuthEnabled()) {
    return 'hybrid';
  }
  
  if (isOAuthEnabled()) {
    return 'oauth';
  }
  
  return 'custom';
}
