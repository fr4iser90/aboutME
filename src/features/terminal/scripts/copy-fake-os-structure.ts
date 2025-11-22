#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import scriptsConfig from '../../shared/scripts/config.js';

// Ordner die ausgeschlossen werden sollen (aus Config)
const EXCLUDE_DIRS = scriptsConfig.terminal.osScan.excludeDirs;

// Dateien die ausgeschlossen werden sollen (aus Config)
const EXCLUDE_FILES = scriptsConfig.terminal.osScan.excludeFiles;

interface SystemInfo {
  hostname: string;
  username: string;
  platform: string;
  arch: string;
  release: string;
}

interface OsStructure {
  system: SystemInfo;
  filesystem: Record<string, any>;
}

function shouldExclude(name: string): boolean {
  // Prüfe ob Ordner/Datei ausgeschlossen werden soll
  if (EXCLUDE_DIRS.includes(name)) return true;
  if (EXCLUDE_FILES.some(pattern => name.includes(pattern))) return true;
  
  // Versteckte Dateien/Ordner (außer wichtige Konfigurationen)
  if (name.startsWith('.') && !scriptsConfig.terminal.osScan.includeHidden.includes(name)) {
    return true;
  }
  
  return false;
}

function scanDirectory(dirPath: string, maxDepth: number | null = null, currentDepth: number = 0): Record<string, any> {
  const actualMaxDepth = maxDepth || scriptsConfig.terminal.osScan.maxDepth;
  if (currentDepth >= actualMaxDepth) return {};
  
  try {
    const items = fs.readdirSync(dirPath);
    const result: Record<string, any> = {};
    
    for (const item of items) {
      if (shouldExclude(item)) continue;
      
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const subDir = scanDirectory(fullPath, maxDepth, currentDepth + 1);
        if (Object.keys(subDir).length > 0) {
          result[item] = subDir;
        }
      } else {
        result[item] = 'file';
      }
    }
    
    return result;
  } catch (error) {
    console.warn(`Fehler beim Scannen von ${dirPath}:`, (error as Error).message);
    return {};
  }
}

function main(): void {
  console.log('Scanne deine OS-Struktur...');
  
  // Hole den aktuellen Username
  const username = os.userInfo().username;
  console.log('Username:', username);
  
  // Scanne verschiedene wichtige Bereiche
  const structure = {
    home: scanDirectory('/home', 4),
    usr: scanDirectory('/usr', 3),
    var: scanDirectory('/var', 3),
    etc: scanDirectory('/etc', 3),
    opt: scanDirectory('/opt', 3),
    tmp: scanDirectory('/tmp', 2),
    root: scanDirectory('/root', 2),
    boot: scanDirectory('/boot', 2),
    dev: scanDirectory('/dev', 2),
    proc: scanDirectory('/proc', 2),
    sys: scanDirectory('/sys', 2)
  };
  
  // Entferne leere Bereiche
  Object.keys(structure).forEach(key => {
    if (Object.keys((structure as any)[key]).length === 0) {
      delete (structure as any)[key];
    }
  });
  
  // Füge System-Informationen hinzu
  const systemInfo = {
    hostname: os.hostname(),
    username: os.userInfo().username,
    platform: os.platform(),
    arch: os.arch(),
    release: os.release()
  };
  
  // Erstelle das finale Objekt mit System-Info und Struktur
  const finalStructure = {
    system: systemInfo,
    filesystem: structure
  };
  
  // Speichere als JSON
  const outputPath = path.join(__dirname, '../../frontend/public/data/fake-os-structure.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalStructure, null, 2));
  
  console.log(`Struktur gespeichert in: ${outputPath}`);
  console.log('System Info:', systemInfo);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scanDirectory, shouldExclude };
