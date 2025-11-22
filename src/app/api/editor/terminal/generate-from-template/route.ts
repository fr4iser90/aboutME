/**
 * Terminal Template Generation API Route
 * 
 * Generates all 6 terminal files from templates using TerminalTemplateLoader.
 * Accepts terminal configuration and generates files to public/data/.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  TerminalTemplateLoader,
  TemplateVariables
} from '@/features/terminal/services/templateLoader';

const DATA_DIR = path.join(process.cwd(), 'public', 'data', 'terminal');

/**
 * POST: Generate all terminal files from templates
 */
export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    // Extract terminal configuration
    const variables: TemplateVariables = {
      USERNAME: config.username || config.USERNAME,
      HOSTNAME: config.hostname || config.HOSTNAME,
      PASSWORD_USER: config.password || config.PASSWORD_USER || config.password_user,
      PASSWORD_ROOT: config.rootPassword || config.PASSWORD_ROOT || config.password_root || config.root_password,
      PASSWORD_HINT: config.passwordHint || config.PASSWORD_HINT || config.password_hint || '',
      ROOT_PASSWORD_HINT: config.rootPasswordHint || config.ROOT_PASSWORD_HINT || config.root_password_hint || ''
    };

    // Validate variables
    const loader = new TerminalTemplateLoader();
    const validation = loader.validateVariables(variables);

    if (!validation.valid) {
      return NextResponse.json({
        error: 'Invalid terminal configuration',
        details: validation.errors
      }, { status: 400 });
    }

    // Generate all terminal files from templates
    const generatedFiles = await loader.generateAllTerminalFiles(variables);

    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Save all generated files
    const savedFiles: string[] = [];
    const errors: string[] = [];

    for (const [fileName, fileData] of Object.entries(generatedFiles)) {
      try {
        const filePath = path.join(DATA_DIR, fileName);
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
      message: 'All terminal files generated and saved successfully',
      savedFiles,
      generatedFiles
    });

  } catch (error) {
    console.error('Terminal template generation error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

