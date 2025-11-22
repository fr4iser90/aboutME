/**
 * Terminal Data API Route
 * 
 * Handles CRUD operations for terminal data files:
 * - GET: Load terminal data (check if files exist)
 * - POST: Save terminal data (all 6 files)
 * - PUT: Update terminal data
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data', 'terminal');
const TERMINAL_FILES = [
  'terminal-user-info.json',
  'terminal-commands.json',
  'terminal.json',
  'fake-os-structure.json',
  'permission-rules.json',
  'puzzle-files.json'
];

/**
 * GET: Check if terminal files exist and load them
 */
export async function GET() {
  try {
    const filesStatus: Record<string, boolean> = {};
    const filesData: Record<string, any> = {};

    // Ensure terminal directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Check each terminal file
    for (const fileName of TERMINAL_FILES) {
      const filePath = path.join(DATA_DIR, fileName);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        filesStatus[fileName] = true;
        filesData[fileName] = JSON.parse(content);
      } catch {
        filesStatus[fileName] = false;
      }
    }

    const allFilesExist = Object.values(filesStatus).every(exists => exists);

    return NextResponse.json({
      filesExist: allFilesExist,
      filesStatus,
      files: allFilesExist ? filesData : null
    });

  } catch (error) {
    console.error('Terminal data GET error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST: Save all terminal data files
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate that all 6 files are provided
    const missingFiles = TERMINAL_FILES.filter(file => !data[file]);
    if (missingFiles.length > 0) {
      return NextResponse.json({
        error: `Missing terminal files: ${missingFiles.join(', ')}`,
        missingFiles
      }, { status: 400 });
    }

    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Save each file
    const savedFiles: string[] = [];
    const errors: string[] = [];

    for (const fileName of TERMINAL_FILES) {
      try {
        const filePath = path.join(DATA_DIR, fileName);
        const fileData = data[fileName];

        // Validate JSON
        try {
          JSON.parse(JSON.stringify(fileData));
        } catch {
          errors.push(`${fileName}: Invalid JSON data`);
          continue;
        }

        await fs.writeFile(
          filePath,
          JSON.stringify(fileData, null, 2),
          'utf-8'
        );
        savedFiles.push(fileName);
      } catch (error) {
        errors.push(
          `${fileName}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Some files failed to save',
        savedFiles,
        errors
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'All terminal files saved successfully',
      savedFiles
    });

  } catch (error) {
    console.error('Terminal data POST error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * PUT: Update terminal data files
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Update only provided files
    const updatedFiles: string[] = [];
    const errors: string[] = [];

    for (const fileName of TERMINAL_FILES) {
      if (data[fileName] !== undefined) {
        try {
          const filePath = path.join(DATA_DIR, fileName);
          const fileData = data[fileName];

          // Validate JSON
          try {
            JSON.parse(JSON.stringify(fileData));
          } catch {
            errors.push(`${fileName}: Invalid JSON data`);
            continue;
          }

          await fs.writeFile(
            filePath,
            JSON.stringify(fileData, null, 2),
            'utf-8'
          );
          updatedFiles.push(fileName);
        } catch (error) {
          errors.push(
            `${fileName}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Some files failed to update',
        updatedFiles,
        errors
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Terminal files updated successfully',
      updatedFiles
    });

  } catch (error) {
    console.error('Terminal data PUT error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

