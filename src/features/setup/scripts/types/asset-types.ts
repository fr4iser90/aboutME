/**
 * Asset Types - TypeScript interfaces for asset handling
 * 
 * Created: 2025-11-15T20:13:40.000Z
 */

/**
 * Asset information interface
 */
export interface AssetInfo {
  url: string;           // Original URL
  localPath: string;     // Local path after download
  type: 'image' | 'doc' | 'other';
  filename: string;
  size?: number;         // File size in bytes
  mimeType?: string;     // MIME type
}

/**
 * Readme integration configuration interface
 */
export interface ReadmeIntegrationConfig {
  enabled: boolean;
  useAsDefault: boolean;
  fetchAssets: boolean;
  fetchDocs: boolean;
  assetDir: string;
  maxAssetSize: number;
  allowedAssetTypes: string[];
  replaceAssetUrls: boolean;
  integrateDocs?: 'append' | 'replace' | 'inline';
}

/**
 * URL mapping for asset replacement
 */
export interface UrlMapping {
  [originalUrl: string]: string;  // Maps original URL to local path
}

/**
 * Asset download result
 */
export interface AssetDownloadResult {
  success: boolean;
  url: string;
  localPath?: string;
  error?: string;
}

