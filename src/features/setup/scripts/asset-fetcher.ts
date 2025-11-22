#!/usr/bin/env node

/**
 * Asset Fetcher - Downloads and processes assets from README files
 * 
 * Features:
 * - Detects assets in README content
 * - Downloads assets from GitHub
 * - Validates file types and sizes
 * - Replaces URLs with local paths
 * 
 * Created: 2025-11-15T20:13:40.000Z
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AssetInfo, UrlMapping, AssetDownloadResult } from './types/asset-types';

// Lade .env-Datei
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

// Lade Portfolio-Konfiguration - use runtime loading to avoid build-time errors
// These scripts run at runtime, not build time, so we use environment variables
const config: any = {
  paths: {
    CONTENT_DIR: process.env.CONTENT_DIR || path.join(process.cwd(), 'private/data'),
    OUTPUT_DIR: process.env.OUTPUT_DIR || path.join(process.cwd(), 'public/data'),
  }
};

// ==================== CONFIGURATION ====================

const DEFAULT_CONFIG = {
  assetDir: 'private/data/projects',  // PRIVATE by default - security! Assets bei Projekt-Daten
  maxAssetSize: 10 * 1024 * 1024, // 10MB
  allowedAssetTypes: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.pdf'],
  replaceAssetUrls: true
};

// ==================== INTERFACES ====================

interface ReadmeIntegrationConfig {
  enabled: boolean;
  useAsDefault: boolean;
  fetchAssets: boolean;
  fetchDocs: boolean;
  assetDir: string;
  maxAssetSize: number;
  allowedAssetTypes: string[];
  replaceAssetUrls: boolean;
}

// ==================== MAIN FUNCTIONS ====================

/**
 * Detects assets in README content
 */
export function detectAssetsInReadme(
  readmeContent: string,
  repoUrl: string
): AssetInfo[] {
  const assets: AssetInfo[] = [];
  
  if (!readmeContent || !repoUrl) {
    return assets;
  }
  
  // Extract repository base URL
  const repoBaseUrl = extractRepoBaseUrl(repoUrl);
  
  // Detect Markdown image links: ![alt](url)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = markdownImageRegex.exec(readmeContent)) !== null) {
    const url = match[2];
    const resolvedUrl = resolveUrl(url, repoBaseUrl);
    
    if (resolvedUrl && isAssetUrl(resolvedUrl)) {
      assets.push({
        url: resolvedUrl,
        localPath: '', // Will be set after download
        type: getAssetType(resolvedUrl),
        filename: extractFilename(resolvedUrl)
      });
    }
  }
  
  // Detect HTML image tags: <img src="url">
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  
  while ((match = htmlImageRegex.exec(readmeContent)) !== null) {
    const url = match[1];
    const resolvedUrl = resolveUrl(url, repoBaseUrl);
    
    if (resolvedUrl && isAssetUrl(resolvedUrl)) {
      assets.push({
        url: resolvedUrl,
        localPath: '',
        type: getAssetType(resolvedUrl),
        filename: extractFilename(resolvedUrl)
      });
    }
  }
  
  // Remove duplicates
  const uniqueAssets = Array.from(
    new Map(assets.map(asset => [asset.url, asset])).values()
  );
  
  return uniqueAssets;
}

/**
 * Downloads assets and saves them locally
 * Checks if files already exist and skips download if identical
 */
export async function downloadAssets(
  assets: AssetInfo[],
  projectName: string,
  outputDir: string
): Promise<UrlMapping> {
  const urlMapping: UrlMapping = {};
  const config = getConfig();
  
  if (!config.fetchAssets || assets.length === 0) {
    return urlMapping;
  }
  
  // Create project-specific asset directory
  // Assets are stored in private/data/projects/[repo-name]/assets/
  // This keeps assets together with project markdown files
  const assetBaseDir = config.assetDir.startsWith('private/') 
    ? config.assetDir 
    : `private/${config.assetDir.replace('public/', '')}`;
  
  // Structure: private/data/projects/[repo-name]/assets/
  const projectDir = path.join(
    process.cwd(),
    assetBaseDir,
    sanitizeProjectName(projectName),
    'assets'
  );
  
  // Ensure directory exists
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  
  // Get list of existing files in directory (for cleanup later)
  const existingFiles = fs.existsSync(projectDir) 
    ? fs.readdirSync(projectDir).map(f => path.join(projectDir, f))
    : [];
  const usedFiles = new Set<string>();
  
  // Download each asset
  for (const asset of assets) {
    try {
      const result = await downloadSingleAsset(asset, projectDir, config, existingFiles, usedFiles);
      
      if (result.success && result.localPath) {
        urlMapping[asset.url] = result.localPath;
        asset.localPath = result.localPath;
        // Mark file as used
        const fullPath = path.join(process.cwd(), result.localPath.replace(/^\//, ''));
        usedFiles.add(fullPath);
      } else {
        console.log(`⚠️  Failed to download asset: ${asset.url} - ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`❌ Error downloading asset ${asset.url}:`, (error as Error).message);
    }
  }
  
  // Cleanup: Remove old assets that are no longer in README
  if ((config as any).cleanupOldAssets !== false) {
    const filesToDelete = existingFiles.filter(file => !usedFiles.has(file));
    if (filesToDelete.length > 0) {
      console.log(`🧹 Cleaning up ${filesToDelete.length} old asset(s) for ${projectName}...`);
      for (const file of filesToDelete) {
        try {
          fs.unlinkSync(file);
          console.log(`   🗑️  Deleted: ${path.basename(file)}`);
        } catch (error) {
          console.log(`   ⚠️  Could not delete ${path.basename(file)}: ${(error as Error).message}`);
        }
      }
    }
  }
  
  return urlMapping;
}

/**
 * Replaces asset URLs in README content with local paths
 * Also converts remaining relative paths to local asset paths
 */
export function replaceAssetUrls(
  readmeContent: string,
  urlMapping: UrlMapping,
  projectName?: string
): string {
  if (!readmeContent) {
    return readmeContent;
  }
  
  let content = readmeContent;
  
  // Replace markdown image URLs from urlMapping (downloaded assets)
  if (Object.keys(urlMapping).length > 0) {
    for (const [originalUrl, localPath] of Object.entries(urlMapping)) {
      // Escape special regex characters in URL
      const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Replace in markdown images: ![alt](url)
      content = content.replace(
        new RegExp(`!\\[([^\\]]*)\\]\\(${escapedUrl}\\)`, 'g'),
        `![$1](${localPath})`
      );
      
      // Replace in HTML images: <img src="url">
      content = content.replace(
        new RegExp(`(<img[^>]+src=["'])${escapedUrl}(["'][^>]*>)`, 'gi'),
        `$1${localPath}$2`
      );
    }
  }
  
  // Convert remaining relative image paths to local asset paths
  // This handles cases where assets weren't detected/downloaded but exist locally
  if (projectName) {
    // Match relative image paths: ![alt](relative/path/to/image.png)
    const relativeImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    content = content.replace(relativeImageRegex, (match, altText, imageUrl) => {
      // Skip if already absolute URL or already local path
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
        return match;
      }
      
      // Extract filename from relative path (e.g., docs/assets/icons/big.png -> big.png)
      const filename = imageUrl.split('/').pop() || imageUrl;
      
      // Check if file exists in local assets directory
      const localAssetPath = `/private/data/projects/${projectName}/assets/${filename}`;
      const localAssetFile = path.join(process.cwd(), 'private', 'data', 'projects', projectName, 'assets', filename);
      
      if (fs.existsSync(localAssetFile)) {
        // File exists locally - use local path
        return `![${altText}](${localAssetPath})`;
      }
      
      // File doesn't exist locally - keep original (might be GitHub URL)
      return match;
    });
  }
  
  return content;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Extracts repository base URL from GitHub repository URL
 */
function extractRepoBaseUrl(repoUrl: string): string {
  // Extract owner/repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
  if (match) {
    return `https://raw.githubusercontent.com/${match[1]}`;
  }
  return '';
}

/**
 * Resolves relative or absolute URLs to absolute GitHub URLs
 */
function resolveUrl(url: string, repoBaseUrl: string): string {
  if (!url) return '';
  
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Convert GitHub blob URLs to raw URLs
    if (url.includes('github.com') && url.includes('/blob/')) {
      return url.replace('/blob/', '/').replace('github.com', 'raw.githubusercontent.com');
    }
    return url;
  }
  
  // Relative URL - resolve to absolute
  if (url.startsWith('./') || url.startsWith('../') || !url.startsWith('/')) {
    // Try common branch names
    const branches = ['main', 'master', 'develop', 'dev'];
    for (const branch of branches) {
      const resolved = `${repoBaseUrl}/${branch}/${url.replace(/^\.\//, '')}`;
      // Could validate URL here, but for now return first attempt
      return resolved;
    }
  }
  
  return url;
}

/**
 * Checks if URL points to an asset file
 */
function isAssetUrl(url: string): boolean {
  const config = getConfig();
  const ext = path.extname(url).toLowerCase();
  return config.allowedAssetTypes.includes(ext);
}

/**
 * Gets asset type from URL
 */
function getAssetType(url: string): 'image' | 'doc' | 'other' {
  const ext = path.extname(url).toLowerCase();
  const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  const docExts = ['.pdf', '.md', '.txt'];
  
  if (imageExts.includes(ext)) return 'image';
  if (docExts.includes(ext)) return 'doc';
  return 'other';
}

/**
 * Extracts filename from URL
 */
function extractFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return path.basename(pathname) || 'asset';
  } catch {
    return path.basename(url) || 'asset';
  }
}

/**
 * Calculates file hash for comparison
 */
function calculateFileHash(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Calculates buffer hash
 */
function calculateBufferHash(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Downloads a single asset
 * Checks if file already exists and is identical before downloading
 */
async function downloadSingleAsset(
  asset: AssetInfo,
  projectDir: string,
  config: ReadmeIntegrationConfig,
  existingFiles: string[] = [],
  usedFiles: Set<string> = new Set()
): Promise<AssetDownloadResult> {
  try {
    // Validate file type
    if (!isAssetUrl(asset.url)) {
      return {
        success: false,
        url: asset.url,
        error: 'File type not allowed'
      };
    }
    
    // Generate safe filename
    const safeFilename = sanitizeFilename(asset.filename);
    const filePath = path.join(projectDir, safeFilename);
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      // File exists - check if we should skip or update
      try {
        // Fetch asset to compare
        const response = await fetch(asset.url, {
          headers: {
            'User-Agent': 'Portfolio-Generator/1.0'
          }
        });
        
        if (!response.ok) {
          // If fetch fails, use existing file
          console.log(`   ⏭️  Skipping ${safeFilename} (exists, fetch failed)`);
          const relativePath = '/' + path.relative(process.cwd(), filePath).replace(/\\/g, '/');
          return {
            success: true,
            url: asset.url,
            localPath: relativePath
          };
        }
        
        const buffer = Buffer.from(await response.arrayBuffer());
        const existingHash = calculateFileHash(filePath);
        const newHash = calculateBufferHash(buffer);
        
        if (existingHash === newHash) {
          // File is identical - skip download
          console.log(`   ⏭️  Skipping ${safeFilename} (already exists, identical)`);
          const relativePath = '/' + path.relative(process.cwd(), filePath).replace(/\\/g, '/');
          return {
            success: true,
            url: asset.url,
            localPath: relativePath
          };
        } else {
          // File is different - update it
          console.log(`   🔄 Updating ${safeFilename} (content changed)`);
          fs.writeFileSync(filePath, buffer);
          const relativePath = '/' + path.relative(process.cwd(), filePath).replace(/\\/g, '/');
          return {
            success: true,
            url: asset.url,
            localPath: relativePath
          };
        }
      } catch (error) {
        // If comparison fails, use existing file
        console.log(`   ⏭️  Skipping ${safeFilename} (exists, comparison failed)`);
        const relativePath = '/' + path.relative(process.cwd(), filePath).replace(/\\/g, '/');
        return {
          success: true,
          url: asset.url,
          localPath: relativePath
        };
      }
    }
    
    // File doesn't exist - download it
    const response = await fetch(asset.url, {
      headers: {
        'User-Agent': 'Portfolio-Generator/1.0'
      }
    });
    
    if (!response.ok) {
      return {
        success: false,
        url: asset.url,
        error: `HTTP ${response.status}`
      };
    }
    
    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > config.maxAssetSize) {
      return {
        success: false,
        url: asset.url,
        error: 'File size exceeds limit'
      };
    }
    
    // Read response
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Check size after download
    if (buffer.length > config.maxAssetSize) {
      return {
        success: false,
        url: asset.url,
        error: 'File size exceeds limit'
      };
    }
    
    // Write file
    fs.writeFileSync(filePath, buffer);
    console.log(`   ⬇️  Downloaded ${safeFilename}`);
    
    // Return relative path from project root (private path)
    const relativePath = '/' + path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    
    return {
      success: true,
      url: asset.url,
      localPath: relativePath
    };
    
  } catch (error) {
    return {
      success: false,
      url: asset.url,
      error: (error as Error).message
    };
  }
}

/**
 * Sanitizes project name for use in file paths
 */
function sanitizeProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Sanitizes filename to prevent path traversal
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Gets configuration with defaults
 */
function getConfig(): ReadmeIntegrationConfig {
  const readmeConfig = config.features?.projects?.readmeIntegration || {};
  
  return {
    enabled: readmeConfig.enabled !== false,
    useAsDefault: readmeConfig.useAsDefault !== false,
    fetchAssets: readmeConfig.fetchAssets !== false,
    fetchDocs: readmeConfig.fetchDocs === true,
    assetDir: readmeConfig.assetDir || DEFAULT_CONFIG.assetDir,
    maxAssetSize: readmeConfig.maxAssetSize || DEFAULT_CONFIG.maxAssetSize,
    allowedAssetTypes: readmeConfig.allowedAssetTypes || DEFAULT_CONFIG.allowedAssetTypes,
    replaceAssetUrls: readmeConfig.replaceAssetUrls !== false
  };
}


