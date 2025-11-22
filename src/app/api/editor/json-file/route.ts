/**
 * JSON File API Route
 * 
 * Handles loading and saving JSON files.
 * Supports both public/data and private/data directories.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { jsonValidator } from '@/features/editor/services/jsonValidator';
import { getSchemaForPath } from '@/features/editor/services/jsonSchema';

const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data');
const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');

/**
 * Validate file path for security
 */
function validateFilePath(filePath: string, baseDir: string): { valid: boolean; fullPath?: string; error?: string } {
  const fullPath = path.join(baseDir, filePath);
  const normalizedPath = path.normalize(fullPath);
  
  // Security check: ensure path is within base directory
  if (!normalizedPath.startsWith(path.normalize(baseDir))) {
    return {
      valid: false,
      error: 'Invalid file path - path traversal detected'
    };
  }
  
  // Check if file is JSON
  if (!filePath.endsWith('.json')) {
    return {
      valid: false,
      error: 'File must be a JSON file'
    };
  }
  
  return {
    valid: true,
    fullPath: normalizedPath
  };
}

/**
 * GET: Load JSON file
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const source = searchParams.get('source') || 'public'; // 'public' or 'private'
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }
    
    const baseDir = source === 'private' ? PRIVATE_DATA_DIR : PUBLIC_DATA_DIR;
    const validation = validateFilePath(filePath, baseDir);
    
    if (!validation.valid || !validation.fullPath) {
      return NextResponse.json(
        { error: validation.error || 'Invalid file path' },
        { status: 400 }
      );
    }
    
    // Check if file exists
    try {
      await fs.access(validation.fullPath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read file content
    const content = await fs.readFile(validation.fullPath, 'utf-8');
    
    // Parse JSON to validate
    let data: any;
    try {
      data = JSON.parse(content);
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON file',
          message: parseError instanceof Error ? parseError.message : 'Parse error'
        },
        { status: 400 }
      );
    }
    
    // Validate against schema
    const schema = getSchemaForPath(filePath);
    const validationResult = jsonValidator.validate(data, schema);
    
    return NextResponse.json({
      content,
      data,
      path: filePath,
      source,
      validation: validationResult,
      size: content.length
    });
    
  } catch (error) {
    console.error('JSON file API GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Save JSON file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: filePath, content, source = 'private' } = body;
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    const baseDir = source === 'private' ? PRIVATE_DATA_DIR : PUBLIC_DATA_DIR;
    const validation = validateFilePath(filePath, baseDir);
    
    if (!validation.valid || !validation.fullPath) {
      return NextResponse.json(
        { error: validation.error || 'Invalid file path' },
        { status: 400 }
      );
    }
    
    // Parse and validate JSON
    let data: any;
    try {
      data = JSON.parse(content);
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON',
          message: parseError instanceof Error ? parseError.message : 'Parse error'
        },
        { status: 400 }
      );
    }
    
    // Validate against schema
    const schema = getSchemaForPath(filePath);
    const validationResult = jsonValidator.validate(data, schema);
    
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          validation: validationResult
        },
        { status: 400 }
      );
    }
    
    // Ensure directory exists
    const dir = path.dirname(validation.fullPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(validation.fullPath, JSON.stringify(data, null, 2), 'utf-8');
    
    // Get file stats
    const stats = await fs.stat(validation.fullPath);
    
    return NextResponse.json({
      success: true,
      path: filePath,
      source,
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
      validation: validationResult
    });
    
  } catch (error) {
    console.error('JSON file API POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

