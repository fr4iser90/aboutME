/**
 * MIME Type Constants
 * 
 * Allowed MIME types for file uploads by category
 */

export const ALLOWED_MIME_TYPES = {
  // Image MIME types
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  
  // Video MIME types
  videos: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime'
  ],
  
  // Document MIME types
  documents: [
    'application/pdf',
    'text/plain',
    'text/markdown'
  ]
} as const;

export const MIME_TYPE_TO_EXTENSION: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/ogg': ['.ogv'],
  'video/quicktime': ['.mov'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md']
};

export const EXTENSION_TO_MIME_TYPE: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown'
};

export function getMimeTypeFromExtension(extension: string): string | null {
  return EXTENSION_TO_MIME_TYPE[extension.toLowerCase()] || null;
}

export function getExtensionsFromMimeType(mimeType: string): string[] {
  return MIME_TYPE_TO_EXTENSION[mimeType] || [];
}

export function isValidMimeType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType.toLowerCase());
}

