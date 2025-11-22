/**
 * File Header Magic Numbers
 * 
 * Magic numbers for file type verification
 * Used to detect actual file type regardless of extension
 */

export interface MagicNumber {
  offset: number;
  bytes: number[];
  mimeType: string;
}

export const MAGIC_NUMBERS: MagicNumber[] = [
  // JPEG
  { offset: 0, bytes: [0xFF, 0xD8, 0xFF], mimeType: 'image/jpeg' },
  
  // PNG
  { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], mimeType: 'image/png' },
  
  // GIF
  { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38], mimeType: 'image/gif' },
  
  // WebP
  { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46], mimeType: 'image/webp' },
  { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50], mimeType: 'image/webp' },
  
  // SVG (text-based, check for XML declaration)
  { offset: 0, bytes: [0x3C, 0x3F, 0x78, 0x6D, 0x6C], mimeType: 'image/svg+xml' },
  
  // MP4
  { offset: 4, bytes: [0x66, 0x74, 0x79, 0x70], mimeType: 'video/mp4' },
  
  // WebM
  { offset: 0, bytes: [0x1A, 0x45, 0xDF, 0xA3], mimeType: 'video/webm' },
  
  // PDF
  { offset: 0, bytes: [0x25, 0x50, 0x44, 0x46], mimeType: 'application/pdf' }
];

/**
 * Verify file type by checking magic numbers
 */
export function verifyFileType(buffer: Buffer, expectedMimeType: string): boolean {
  const matchingMagic = MAGIC_NUMBERS.find(magic => magic.mimeType === expectedMimeType);
  
  if (!matchingMagic) {
    // No magic number check available for this type
    return true;
  }
  
  if (buffer.length < matchingMagic.offset + matchingMagic.bytes.length) {
    return false;
  }
  
  const headerBytes = buffer.slice(
    matchingMagic.offset,
    matchingMagic.offset + matchingMagic.bytes.length
  );
  
  for (let i = 0; i < matchingMagic.bytes.length; i++) {
    if (headerBytes[i] !== matchingMagic.bytes[i]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Detect file type from magic numbers
 */
export function detectFileType(buffer: Buffer): string | null {
  for (const magic of MAGIC_NUMBERS) {
    if (buffer.length < magic.offset + magic.bytes.length) {
      continue;
    }
    
    const headerBytes = buffer.slice(
      magic.offset,
      magic.offset + magic.bytes.length
    );
    
    let matches = true;
    for (let i = 0; i < magic.bytes.length; i++) {
      if (headerBytes[i] !== magic.bytes[i]) {
        matches = false;
        break;
      }
    }
    
    if (matches) {
      return magic.mimeType;
    }
  }
  
  return null;
}

