/**
 * Validate Files API Route
 * 
 * Validates JSON files against JSON Schema definitions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { jsonValidator, ValidationResult } from '@/features/editor/services/jsonValidator';

// Validate files in private/data (during setup, before publishing)
const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data');

/**
 * GET: Validate all JSON files
 */
export async function GET() {
  try {
    const results: Record<string, ValidationResult> = {};
    const files: string[] = [];

    // Find all JSON files in private/data (during setup, before publishing)
    async function findJsonFiles(dir: string): Promise<string[]> {
      const found: string[] = [];
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            found.push(...(await findJsonFiles(fullPath)));
          } else if (entry.name.endsWith('.json')) {
            found.push(fullPath);
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
      return found;
    }

    // Try private/data first, fallback to public/data if private doesn't exist
    let dataDir = PRIVATE_DATA_DIR;
    try {
      await fs.access(PRIVATE_DATA_DIR);
    } catch {
      dataDir = PUBLIC_DATA_DIR;
    }

    const jsonFiles = await findJsonFiles(dataDir);

    for (const filePath of jsonFiles) {
      try {
        const relativePath = path.relative(dataDir, filePath);
        const result = await jsonValidator.validateFile(filePath);
        results[relativePath] = result;
        files.push(relativePath);
      } catch (error) {
        console.error(`Error validating ${filePath}:`, error);
        results[path.relative(dataDir, filePath)] = {
          isValid: false,
          errors: [{
            path: '/',
            message: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            value: null
          }],
        };
      }
    }

    const validFiles = Object.values(results).filter((r) => r.isValid).length;
    const invalidFiles = Object.values(results).filter((r) => !r.isValid).length;

    return NextResponse.json({
      success: true,
      total: files.length,
      valid: validFiles,
      invalid: invalidFiles,
      results,
      files,
    });
  } catch (error) {
    console.error('Validate files API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Validate specific files
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files: filePaths } = body;

    if (!filePaths || !Array.isArray(filePaths)) {
      return NextResponse.json({ error: 'Files array is required' }, { status: 400 });
    }

    const results: Record<string, ValidationResult> = {};

    // Try private/data first, fallback to public/data if private doesn't exist
    let dataDir = PRIVATE_DATA_DIR;
    try {
      await fs.access(PRIVATE_DATA_DIR);
    } catch {
      dataDir = PUBLIC_DATA_DIR;
    }

    for (const filePath of filePaths) {
      // filePath is relative to data directory, construct full path
      const fullPath = path.join(dataDir, filePath);
      try {
        const result = await jsonValidator.validateFile(fullPath);
        results[filePath] = result;
      } catch (error) {
        console.error(`Error validating ${filePath}:`, error);
        results[filePath] = {
          isValid: false,
          errors: [{
            path: '/',
            message: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            value: null
          }],
        };
      }
    }

    const validFiles = Object.values(results).filter((r) => r.isValid).length;
    const invalidFiles = Object.values(results).filter((r) => !r.isValid).length;

    return NextResponse.json({
      success: true,
      total: filePaths.length,
      valid: validFiles,
      invalid: invalidFiles,
      results,
    });
  } catch (error) {
    console.error('Validate files API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

