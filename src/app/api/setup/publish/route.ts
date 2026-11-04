import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { writeSiteStatus } from '@/features/shared/utils/siteStatus';
import { requireAdmin } from '@/features/auth/services/requireAdmin';

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data');

const SKIP_DIRS = new Set(['archive', 'backups', '.git']);

function normalizePublishedJson(relativePath: string, content: string): string {
  const normalized = relativePath.replace(/\\/g, '/');
  if (
    normalized === 'projects/projects.json' ||
    normalized === 'projects.json'
  ) {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return JSON.stringify(
          {
            projects: data,
            totalCount: data.length,
            lastUpdated: new Date().toISOString(),
            generatedBy: 'aboutme-publish',
          },
          null,
          2
        );
      }
      if (data && Array.isArray(data.projects)) {
        return JSON.stringify(data, null, 2);
      }
    } catch {
      /* keep original */
    }
  }
  return content;
}

/**
 * POST: Publish data by copying JSON files from private/data to public/data
 */
export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const copiedFiles: string[] = [];
    const errors: string[] = [];

    await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });

    async function copyJsonFiles(
      sourceDir: string,
      targetDir: string,
      relativePath: string = ''
    ) {
      try {
        const entries = await fs.readdir(sourceDir, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) {
            continue;
          }

          const sourcePath = path.join(sourceDir, entry.name);
          const targetPath = path.join(targetDir, entry.name);

          if (entry.isDirectory()) {
            await fs.mkdir(targetPath, { recursive: true });
            await copyJsonFiles(
              sourcePath,
              targetPath,
              path.join(relativePath, entry.name)
            );
          } else if (entry.name.endsWith('.json')) {
            try {
              const raw = await fs.readFile(sourcePath, 'utf-8');
              const rel = path.join(relativePath, entry.name);
              const content = normalizePublishedJson(rel, raw);
              await fs.writeFile(targetPath, content, 'utf-8');
              copiedFiles.push(rel);
            } catch (error) {
              errors.push(
                `Failed to copy ${sourcePath}: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`
              );
            }
          }
        }
      } catch (error) {
        console.warn(`Could not copy from ${sourceDir}:`, error);
      }
    }

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

    const now = new Date().toISOString();
    const siteStatus = await writeSiteStatus({
      setupComplete: true,
      validated: true,
      published: true,
      setupAt: now,
      validatedAt: now,
      publishedAt: now,
    });

    // Allow public site on next request without full process restart
    process.env.SETUP_MODE = 'false';

    return NextResponse.json({
      success: true,
      copiedFiles,
      siteStatus,
      message: `Successfully published ${copiedFiles.length} files`,
      setupMode: false,
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
