/**
 * Publish API Route
 * 
 * Copies JSON files from private/data to public/data to make portfolio publicly available.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data');

/**
 * POST: Publish data by copying JSON files from private/data to public/data
 */
export async function POST(request: NextRequest) {
  try {
    const copiedFiles: string[] = [];
    const errors: string[] = [];

    // Ensure public/data directory exists
    await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });

    // Copy JSON files from private/data to public/data
    async function copyJsonFiles(sourceDir: string, targetDir: string, relativePath: string = '') {
      try {
        const entries = await fs.readdir(sourceDir, { withFileTypes: true });
        
        for (const entry of entries) {
          const sourcePath = path.join(sourceDir, entry.name);
          const targetPath = path.join(targetDir, entry.name);
          
          if (entry.isDirectory()) {
            // Recursively copy subdirectories
            await fs.mkdir(targetPath, { recursive: true });
            await copyJsonFiles(sourcePath, targetPath, path.join(relativePath, entry.name));
          } else if (entry.name.endsWith('.json')) {
            // Copy JSON files
            try {
              const content = await fs.readFile(sourcePath, 'utf-8');
              await fs.writeFile(targetPath, content, 'utf-8');
              copiedFiles.push(path.join(relativePath, entry.name));
            } catch (error) {
              errors.push(`Failed to copy ${sourcePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
        console.warn(`Could not copy from ${sourceDir}:`, error);
      }
    }

    // Copy all JSON files
    await copyJsonFiles(PRIVATE_DATA_DIR, PUBLIC_DATA_DIR);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          copiedFiles,
          errors,
          message: 'Some files failed to copy',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      copiedFiles,
      message: `Successfully published ${copiedFiles.length} files`,
    });
  } catch (error) {
    console.error('Publish API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

