import { promises as fs } from 'fs';
import path from 'path';

const SITE_STATUS_FILE = path.join(process.cwd(), 'public/data/config/site-status.json');

export interface SiteStatus {
  setupComplete: boolean;
  validated: boolean;
  published: boolean;
  setupAt: string | null;
  validatedAt: string | null;
  publishedAt: string | null;
}

const DEFAULT_STATUS: SiteStatus = {
  setupComplete: false,
  validated: false,
  published: false,
  setupAt: null,
  validatedAt: null,
  publishedAt: null
};

/**
 * Read site status from file
 */
export async function readSiteStatus(): Promise<SiteStatus> {
  try {
    const content = await fs.readFile(SITE_STATUS_FILE, 'utf8');
    const status = JSON.parse(content) as SiteStatus;
    // Merge with defaults to ensure all fields exist
    return { ...DEFAULT_STATUS, ...status };
  } catch {
    // File doesn't exist = return defaults
    return DEFAULT_STATUS;
  }
}

/**
 * Read site status synchronously (for Edge Runtime)
 * NOTE: This function uses dynamic import to avoid bundling fs in client code
 */
export function readSiteStatusSync(): SiteStatus {
  try {
    // Use require for synchronous file access in Edge Runtime
    const fsSync = require('fs');
    const content = fsSync.readFileSync(SITE_STATUS_FILE, 'utf8');
    const status = JSON.parse(content) as SiteStatus;
    return { ...DEFAULT_STATUS, ...status };
  } catch {
    return DEFAULT_STATUS;
  }
}

/**
 * Write site status to file
 */
export async function writeSiteStatus(
  updates: Partial<SiteStatus>
): Promise<SiteStatus> {
  try {
    // Ensure directory exists
    const dir = path.dirname(SITE_STATUS_FILE);
    await fs.mkdir(dir, { recursive: true });

    // Read existing status
    const currentStatus = await readSiteStatus();

    // Merge updates
    const newStatus: SiteStatus = {
      ...currentStatus,
      ...updates
    };

    // Write to file
    await fs.writeFile(
      SITE_STATUS_FILE,
      JSON.stringify(newStatus, null, 2)
    );

    return newStatus;
  } catch (error) {
    console.error('Error writing site status:', error);
    throw error;
  }
}

/**
 * Calculate current status from site status
 */
export function calculateCurrentStatus(status: SiteStatus): 
  'setup_required' | 'ready_to_build' | 'validated' | 'published' {
  if (!status.setupComplete) {
    return 'setup_required';
  }
  if (status.setupComplete && !status.validated) {
    return 'ready_to_build';
  }
  if (status.validated && !status.published) {
    return 'validated';
  }
  return 'published';
}

