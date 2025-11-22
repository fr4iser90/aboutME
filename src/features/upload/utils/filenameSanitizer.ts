/**
 * Filename Sanitization
 * 
 * Sanitizes filenames to prevent security issues
 */

const BLOCKED_NAMES = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
];

const BLOCKED_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;
const MAX_FILENAME_LENGTH = 255;

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory separators and path traversal attempts
  let sanitized = filename
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[\/\\]/g, '_') // Replace path separators
    .replace(BLOCKED_CHARS, '_') // Replace blocked characters
    .trim();
  
  // Remove trailing dots and spaces (Windows issue)
  sanitized = sanitized.replace(/[\.\s]+$/, '');
  
  // Check for blocked names (Windows reserved names)
  const nameWithoutExt = sanitized.split('.')[0].toUpperCase();
  if (BLOCKED_NAMES.includes(nameWithoutExt)) {
    sanitized = `file_${sanitized}`;
  }
  
  // Ensure filename is not empty
  if (!sanitized || sanitized.length === 0) {
    sanitized = 'file';
  }
  
  // Limit length
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = getExtension(sanitized);
    const nameWithoutExt = sanitized.slice(0, MAX_FILENAME_LENGTH - ext.length);
    sanitized = nameWithoutExt + ext;
  }
  
  return sanitized;
}

/**
 * Get file extension
 */
export function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) {
    return '';
  }
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Generate unique filename if file exists
 */
export function generateUniqueFilename(
  basePath: string,
  filename: string,
  existingFiles: string[]
): string {
  const sanitized = sanitizeFilename(filename);
  const ext = getExtension(sanitized);
  const nameWithoutExt = sanitized.slice(0, sanitized.length - ext.length);
  
  let counter = 1;
  let uniqueFilename = sanitized;
  
  while (existingFiles.includes(uniqueFilename)) {
    uniqueFilename = `${nameWithoutExt}_${counter}${ext}`;
    counter++;
    
    if (counter > 1000) {
      // Fallback: use timestamp
      uniqueFilename = `${nameWithoutExt}_${Date.now()}${ext}`;
      break;
    }
  }
  
  return uniqueFilename;
}

/**
 * Validate filename
 */
export function validateFilename(filename: string): { valid: boolean; error?: string } {
  if (!filename || filename.length === 0) {
    return { valid: false, error: 'Filename cannot be empty' };
  }
  
  if (filename.length > MAX_FILENAME_LENGTH) {
    return { valid: false, error: `Filename too long (max ${MAX_FILENAME_LENGTH} characters)` };
  }
  
  if (BLOCKED_CHARS.test(filename)) {
    return { valid: false, error: 'Filename contains invalid characters' };
  }
  
  const nameWithoutExt = filename.split('.')[0].toUpperCase();
  if (BLOCKED_NAMES.includes(nameWithoutExt)) {
    return { valid: false, error: 'Filename is a reserved name' };
  }
  
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { valid: false, error: 'Filename cannot contain path separators' };
  }
  
  return { valid: true };
}

