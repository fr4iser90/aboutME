/**
 * JSON Files Listing API Route
 * 
 * Lists all JSON files in public/data and private/data directories.
 * Supports filtering by category and search.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data');
const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');

interface JSONFileInfo {
  name: string;
  path: string;
  category: string;
  size: number;
  lastModified: string;
  source: 'public' | 'private';
}

/**
 * Recursively find all JSON files in a directory
 */
async function findJSONFiles(dir: string, baseDir: string, source: 'public' | 'private'): Promise<JSONFileInfo[]> {
  const files: JSONFileInfo[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = await findJSONFiles(fullPath, baseDir, source);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        // Get relative path from base directory
        const relativePath = path.relative(baseDir, fullPath);
        const normalizedPath = relativePath.replace(/\\/g, '/'); // Normalize path separators
        
        // Determine category from first directory in path
        // Structure: {category}/{file.json} or {category}/{subdir}/{file.json}
        const pathParts = normalizedPath.split('/');
        const firstDir = pathParts[0];
        
        // Valid categories based on actual directory structure
        const validCategories = ['user', 'about', 'projects', 'blog', 'skills', 'config', 'terminal'];
        const category = validCategories.includes(firstDir) ? firstDir : null;
        
        // Skip files that don't match known categories
        if (!category) {
          continue;
        }
        
        // Get file stats
        const stats = await fs.stat(fullPath);
        
        files.push({
          name: entry.name,
          path: relativePath,
          category,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          source
        });
      }
    }
  } catch (error) {
    // Directory might not exist, that's okay
    console.warn(`Could not read directory ${dir}:`, error);
  }
  
  return files;
}

/**
 * GET: List all JSON files
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const source = searchParams.get('source'); // 'public', 'private', or 'all'
    
    // Find JSON files in both directories
    const allFiles: JSONFileInfo[] = [];
    
    if (!source || source === 'public' || source === 'all') {
      if (await fs.access(PUBLIC_DATA_DIR).then(() => true).catch(() => false)) {
        const publicFiles = await findJSONFiles(PUBLIC_DATA_DIR, PUBLIC_DATA_DIR, 'public');
        allFiles.push(...publicFiles);
      }
    }
    
    if (!source || source === 'private' || source === 'all') {
      if (await fs.access(PRIVATE_DATA_DIR).then(() => true).catch(() => false)) {
        const privateFiles = await findJSONFiles(PRIVATE_DATA_DIR, PRIVATE_DATA_DIR, 'private');
        allFiles.push(...privateFiles);
      }
    }
    
    // Filter by category if specified
    let filteredFiles = allFiles;
    if (category) {
      filteredFiles = filteredFiles.filter(file => file.category === category);
    }
    
    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase();
      filteredFiles = filteredFiles.filter(file => 
        file.name.toLowerCase().includes(searchLower) ||
        file.path.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by last modified (newest first)
    filteredFiles.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
    
    return NextResponse.json({
      files: filteredFiles,
      total: filteredFiles.length,
      categories: [...new Set(allFiles.map(f => f.category))],
      sources: ['public', 'private']
    });
    
  } catch (error) {
    console.error('JSON files API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

