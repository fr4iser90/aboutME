import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { writeSiteStatus } from '@/features/shared/utils/siteStatus';
import { requireAdmin } from '@/features/auth/services/requireAdmin';

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data');
const BACKUP_ROOT = path.join(process.cwd(), 'backups');
const BACKUPS_TO_KEEP = 10;

const SKIP_DIRS = new Set(['archive', 'backups', '.git']);

/**
 * Snapshots the currently published JSON before it is overwritten.
 * Naming follows scripts/reset-and-backup.ts (backups/<timestamp>/public-data).
 * Returns the backup directory, or null when there is nothing published yet.
 */
async function backupPublishedJson(
  sourceDir: string,
  targetDir: string
): Promise<number> {
  let copied = 0;
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true });
      copied += await backupPublishedJson(sourcePath, targetPath);
    } else if (entry.name.endsWith('.json')) {
      await fs.copyFile(sourcePath, targetPath);
      copied++;
    }
  }

  return copied;
}

async function createPublishBackup(): Promise<string | null> {
  const published = await countJsonFiles(PUBLIC_DATA_DIR);
  if (published === 0) return null;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = path.join(BACKUP_ROOT, timestamp, 'public-data');
  await fs.mkdir(backupPath, { recursive: true });
  await backupPublishedJson(PUBLIC_DATA_DIR, backupPath);

  const keep = (await fs.readdir(BACKUP_ROOT, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()
    .reverse()
    .slice(BACKUPS_TO_KEEP);

  for (const stale of keep) {
    await fs.rm(path.join(BACKUP_ROOT, stale), { recursive: true, force: true });
  }

  return backupPath;
}

async function countJsonFiles(dir: string): Promise<number> {
  let total = 0;
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) total += await countJsonFiles(path.join(dir, entry.name));
      else if (entry.name.endsWith('.json')) total++;
    }
  } catch {
    return 0;
  }
  return total;
}

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

    // Published data is overwritten in place, so keep a restore point first.
    // Fails closed: without it a bad draft store would replace the live site.
    let backupPath: string | null = null;
    try {
      backupPath = await createPublishBackup();
    } catch (backupError) {
      console.error('Publish aborted, published data could not be backed up:', backupError);
      return NextResponse.json(
        {
          error: 'Publish aborted: could not back up the published data',
          message: backupError instanceof Error ? backupError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

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
      backupPath,
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
