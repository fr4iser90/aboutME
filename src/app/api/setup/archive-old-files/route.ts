import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');
const ARCHIVE_DIR = path.join(PRIVATE_DATA_DIR, 'archive');

/**
 * Helper: Read config.json to get selectedRepos
 */
async function readConfigJson(): Promise<any> {
  try {
    const configPath = path.join(PRIVATE_DATA_DIR, 'config', 'config.json');
    const content = await fs.readFile(configPath, 'utf-8');
    if (!content || content.trim().length === 0) {
      return {};
    }
    return JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    console.warn('Could not read config.json:', error);
    return {};
  }
}

/**
 * Normalize repo name to match file naming convention
 */
function normalizeRepoName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

/**
 * Find all old project files that are not in selectedRepos
 */
async function findOldProjectFiles(selectedRepos: string[]): Promise<string[]> {
  const oldFiles: string[] = [];
  const selectedRepoNames = selectedRepos.map(normalizeRepoName);
  
  try {
    const projectsDetailsDir = path.join(PRIVATE_DATA_DIR, 'projects', 'details');
    const files = await fs.readdir(projectsDetailsDir);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const projectName = file.replace('.json', '').toLowerCase();
      if (!selectedRepoNames.includes(projectName)) {
        oldFiles.push(path.join(projectsDetailsDir, file));
      }
    }
  } catch (error) {
    // Directory doesn't exist or error reading
    console.warn('Could not read projects/details directory:', error);
  }
  
  return oldFiles;
}

/**
 * POST: Archive old project files
 */
export async function POST(request: NextRequest) {
  try {
    const configJson = await readConfigJson();
    const selectedRepos = configJson.githubFilter?.selectedRepos || [];
    
    if (selectedRepos.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No selected repos found in config. Cannot determine which files are old.'
      }, { status: 400 });
    }
    
    const oldFiles = await findOldProjectFiles(selectedRepos);
    
    if (oldFiles.length === 0) {
      return NextResponse.json({
        success: true,
        archived: 0,
        message: 'No old files to archive'
      });
    }
    
    // Create archive directory with current date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const archiveDateDir = path.join(ARCHIVE_DIR, today);
    await fs.mkdir(archiveDateDir, { recursive: true });
    
    // Create projects/details structure in archive
    const archiveProjectsDir = path.join(archiveDateDir, 'projects', 'details');
    await fs.mkdir(archiveProjectsDir, { recursive: true });
    
    // Move files to archive
    const archivedFiles: string[] = [];
    for (const filePath of oldFiles) {
      try {
        const fileName = path.basename(filePath);
        const archivePath = path.join(archiveProjectsDir, fileName);
        
        // Move file (copy then delete for safety)
        await fs.copyFile(filePath, archivePath);
        await fs.unlink(filePath);
        
        archivedFiles.push(fileName);
      } catch (error) {
        console.error(`Error archiving ${filePath}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      archived: archivedFiles.length,
      files: archivedFiles,
      archivePath: `archive/${today}/projects/details/`,
      message: `Successfully archived ${archivedFiles.length} old project file(s)`
    });
  } catch (error) {
    console.error('Archive old files error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET: Check for old files (without archiving)
 */
export async function GET() {
  try {
    const configJson = await readConfigJson();
    const selectedRepos = configJson.githubFilter?.selectedRepos || [];
    
    if (selectedRepos.length === 0) {
      return NextResponse.json({
        hasOldFiles: false,
        count: 0,
        files: []
      });
    }
    
    const oldFiles = await findOldProjectFiles(selectedRepos);
    
    return NextResponse.json({
      hasOldFiles: oldFiles.length > 0,
      count: oldFiles.length,
      files: oldFiles.map(f => path.basename(f))
    });
  } catch (error) {
    console.error('Check old files error:', error);
    return NextResponse.json({
      hasOldFiles: false,
      count: 0,
      files: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

