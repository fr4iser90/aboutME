/**
 * AUTOMATISCHE SECRET-GENERIERUNG
 * 
 * Generiert sichere Secrets für Production
 * - SESSION_SECRET (32 bytes hex)
 * - NEXTAUTH_SECRET (32 bytes hex)
 * - CSRF-Token (32 bytes hex)
 */

import crypto from 'crypto';

export interface GeneratedSecrets {
  SESSION_SECRET: string;
  NEXTAUTH_SECRET: string;
  CSRF_SECRET: string;
}

/**
 * Generiert sichere Secrets für Production
 */
export function generateSecrets(): GeneratedSecrets {
  return {
    SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
    NEXTAUTH_SECRET: crypto.randomBytes(32).toString('hex'),
    CSRF_SECRET: crypto.randomBytes(32).toString('hex')
  };
}

/**
 * Prüft ob Secrets bereits gesetzt sind
 */
export function hasSecrets(): boolean {
  return !!(
    process.env.SESSION_SECRET && 
    process.env.NEXTAUTH_SECRET
  );
}

/**
 * Validiert Secret-Stärke
 */
export function validateSecret(secret: string, name: string): boolean {
  if (!secret) {
    throw new Error(`${name} is required`);
  }
  
  if (secret.length < 32) {
    throw new Error(`${name} must be at least 32 characters long`);
  }
  
  return true;
}

/**
 * Initialisiert Secrets falls nicht vorhanden
 */
export function initializeSecrets(): GeneratedSecrets | null {
  if (hasSecrets()) {
    return null; // Secrets bereits vorhanden
  }
  
  const secrets = generateSecrets();
  
  // Setze Environment-Variablen
  process.env.SESSION_SECRET = secrets.SESSION_SECRET;
  process.env.NEXTAUTH_SECRET = secrets.NEXTAUTH_SECRET;
  process.env.CSRF_SECRET = secrets.CSRF_SECRET;
  
  console.log('🔐 Generated new secrets for production');
  
  return secrets;
}
