/**
 * Portfolio Status Detection (Edge Runtime Compatible)
 * 
 * Uses API routes instead of direct file system access
 * for Edge Runtime compatibility.
 */

const SETUP_MODE = process.env.SETUP_MODE;

// Setup-Mode ist nur im Development erlaubt
const ALLOWED_SETUP_ENVIRONMENTS = ['development', 'test'];

/**
 * Prüfe ob Setup-Mode aktiviert werden darf
 */
export function isSetupModeAllowed(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  
  if (!nodeEnv || !ALLOWED_SETUP_ENVIRONMENTS.includes(nodeEnv)) {
    return false;
  }
  
  return SETUP_MODE === 'true';
}

/**
 * Prüfe ob System bereits konfiguriert ist (Edge Runtime Compatible)
 */
export async function isSystemConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/setup/status');
    const data = await response.json();
    return data.isConfigured;
  } catch (error) {
    console.error('Error checking system configuration:', error);
    return false;
  }
}

/**
 * Portfolio Status Detection
 */
export async function getPortfolioStatus(): Promise<'unconfigured' | 'building' | 'active' | null> {
  try {
    const response = await fetch('/api/setup/status');
    const data = await response.json();
    return data.portfolioStatus;
  } catch (error) {
    console.error('Error getting portfolio status:', error);
    return 'unconfigured';
  }
}

/**
 * SICHERE Setup-Mode Detection
 */
export async function isSetupMode(): Promise<boolean> {
  // Setup-Mode nur erlaubt wenn:
  // 1. Environment erlaubt es
  // 2. System ist noch nicht konfiguriert
  
  if (!isSetupModeAllowed()) {
    return false;
  }
  
  const isConfigured = await isSystemConfigured();
  return !isConfigured;
}

/**
 * Prüfe ob Admin-Authentifizierung konfiguriert ist
 */
export function isAdminAuthConfigured(): boolean {
  // Prüfe ob Auth-Konfiguration existiert
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;
  
  return !!(adminPassword && sessionSecret);
}

/**
 * Validiere Setup-Konfiguration
 */
export function validateSetupConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Prüfe Auth-Konfiguration
  if (!isAdminAuthConfigured()) {
    errors.push('Admin authentication not configured');
  }
  
  const nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv || !ALLOWED_SETUP_ENVIRONMENTS.includes(nodeEnv)) {
    errors.push(`NODE_ENV must be one of: ${ALLOWED_SETUP_ENVIRONMENTS.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Erstelle Setup-Konfiguration (Edge Runtime Compatible)
 */
export async function createSetupConfig(config: {
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioAuthor: string;
  githubUsername: string;
}): Promise<void> {
  try {
    const response = await fetch('/api/setup/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create setup config');
    }
  } catch (error) {
    console.error('Error creating setup config:', error);
    throw error;
  }
}

/**
 * Deaktiviere Setup-Mode (Edge Runtime Compatible)
 */
export async function disableSetupMode(): Promise<void> {
  try {
    const response = await fetch('/api/setup/disable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to disable setup mode');
    }
  } catch (error) {
    console.error('Error disabling setup mode:', error);
    throw error;
  }
}
