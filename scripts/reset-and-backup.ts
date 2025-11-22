#!/usr/bin/env ts-node

/**
 * Reset and Backup Script
 * 
 * This script:
 * 1. Creates a backup of all current data
 * 2. Resets everything to initial state (setup needed)
 * 3. Clears all configuration and data files
 * 
 * Usage: npm run reset-and-backup
 *        or: npx ts-node scripts/reset-and-backup.ts
 */

import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public/data');
const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

interface BackupInfo {
  timestamp: string;
  files: string[];
}

/**
 * Create backup of all data
 */
async function createBackup(): Promise<string> {
  const backupPath = path.join(BACKUP_DIR, `backup-${TIMESTAMP}`);
  
  console.log('📦 Creating backup...');
  console.log(`   Backup location: ${backupPath}`);
  
  // Ensure backup directory exists
  await fs.mkdir(backupPath, { recursive: true });
  
  // Copy public/data directory
  const publicDataBackup = path.join(backupPath, 'public-data');
  await copyDirectory(DATA_DIR, publicDataBackup);
  
  // Copy private/data directory (Markdown files!)
  const privateDataBackup = path.join(backupPath, 'private-data');
  if (await directoryExists(PRIVATE_DATA_DIR)) {
    await copyDirectory(PRIVATE_DATA_DIR, privateDataBackup);
  }
  
  // Save backup info
  const publicFiles = await getAllFiles(DATA_DIR);
  const privateFiles = await directoryExists(PRIVATE_DATA_DIR) 
    ? await getAllFiles(PRIVATE_DATA_DIR) 
    : [];
  
  const backupInfo: BackupInfo = {
    timestamp: TIMESTAMP,
    files: [...publicFiles.map(f => `public/${f}`), ...privateFiles.map(f => `private/${f}`)]
  };
  
  await fs.writeFile(
    path.join(backupPath, 'backup-info.json'),
    JSON.stringify(backupInfo, null, 2)
  );
  
  console.log('✅ Backup created successfully');
  return backupPath;
}

/**
 * Copy directory recursively
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Get all files in directory recursively
 */
async function getAllFiles(dir: string, baseDir: string = dir, fileList: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (entry.isDirectory()) {
      await getAllFiles(fullPath, baseDir, fileList);
    } else {
      fileList.push(relativePath);
    }
  }
  
  return fileList;
}

/**
 * Check if directory exists
 */
async function directoryExists(dir: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dir);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Reset all data to initial state
 */
async function resetData(): Promise<void> {
  console.log('🔄 Resetting data...');
  
  // Files and directories to delete/reset (public/data)
  const itemsToDelete = [
    path.join(DATA_DIR, 'config', 'config.json'),
    path.join(DATA_DIR, 'config', 'site-status.json'),
    path.join(DATA_DIR, 'config', 'layout.json'),
    path.join(DATA_DIR, 'user', 'user.json'),
    path.join(DATA_DIR, 'projects', 'projects.json'),
    path.join(DATA_DIR, 'skills', 'skills.json'),
    path.join(DATA_DIR, 'blog', 'blog.json'),
    path.join(DATA_DIR, 'timeline', 'timeline.json'),
    path.join(DATA_DIR, 'about', 'about.json'),
  ];
  
  // Directories to clear (but keep structure) - public/data
  const dirsToClear = [
    path.join(DATA_DIR, 'blog', 'posts'),
    path.join(DATA_DIR, 'projects'),
    path.join(DATA_DIR, 'terminal'),
  ];
  
  // PRIVATE DATA - Markdown files! (the actual fetched data)
  const privateDirsToClear = [
    path.join(PRIVATE_DATA_DIR, 'projects'),
    path.join(PRIVATE_DATA_DIR, 'blog', 'posts'),
    path.join(PRIVATE_DATA_DIR, 'about'),
  ];
  
  const privateFilesToDelete = [
    path.join(PRIVATE_DATA_DIR, 'about', 'about.md'),
    path.join(PRIVATE_DATA_DIR, 'about', 'about_ger.md'),
  ];
  
  // Delete specific files
  for (const filePath of itemsToDelete) {
    try {
      await fs.unlink(filePath);
      console.log(`   ✅ Deleted: ${path.relative(DATA_DIR, filePath)}`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.warn(`   ⚠️  Could not delete ${filePath}: ${error.message}`);
      }
    }
  }
  
  // Clear directories (delete contents but keep directory) - public/data
  for (const dirPath of dirsToClear) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await fs.rm(fullPath, { recursive: true, force: true });
        } else {
          await fs.unlink(fullPath);
        }
      }
      console.log(`   ✅ Cleared: ${path.relative(DATA_DIR, dirPath)}`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.warn(`   ⚠️  Could not clear ${dirPath}: ${error.message}`);
      }
    }
  }
  
  // Delete private Markdown files
  console.log('\n   📝 Clearing private/data (Markdown files)...');
  for (const filePath of privateFilesToDelete) {
    try {
      await fs.unlink(filePath);
      console.log(`   ✅ Deleted: ${path.relative(PRIVATE_DATA_DIR, filePath)}`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.warn(`   ⚠️  Could not delete ${filePath}: ${error.message}`);
      }
    }
  }
  
  // Clear private directories (Markdown files!)
  for (const dirPath of privateDirsToClear) {
    try {
      if (await directoryExists(dirPath)) {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          if (entry.isDirectory()) {
            await fs.rm(fullPath, { recursive: true, force: true });
          } else {
            await fs.unlink(fullPath);
          }
        }
        console.log(`   ✅ Cleared: ${path.relative(PRIVATE_DATA_DIR, dirPath)}`);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.warn(`   ⚠️  Could not clear ${dirPath}: ${error.message}`);
      }
    }
  }
  
  // Reset site-status.json to default
  const siteStatusPath = path.join(DATA_DIR, 'config', 'site-status.json');
  await fs.mkdir(path.dirname(siteStatusPath), { recursive: true });
  await fs.writeFile(
    siteStatusPath,
    JSON.stringify({
      setupComplete: false,
      validated: false,
      published: false,
      setupAt: null,
      validatedAt: null,
      publishedAt: null
    }, null, 2)
  );
  console.log('   ✅ Reset site-status.json');
  
  console.log('✅ Data reset complete');
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🚀 Reset and Backup Script');
  console.log('==========================\n');
  
  try {
    // Step 1: Create backup
    const backupPath = await createBackup();
    console.log('');
    
    // Step 2: Reset data
    await resetData();
    console.log('');
    
    console.log('✅ Reset complete!');
    console.log(`📦 Backup saved to: ${backupPath}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Run: npm start');
    console.log('   2. Go to: http://localhost:3000/setup');
    console.log('   3. Complete the setup wizard');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as resetAndBackup };

