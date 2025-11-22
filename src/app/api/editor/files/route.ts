import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'private/data');

export async function GET() {
  try {
    console.log('API: Loading files from:', DATA_DIR);
    const files = [];

    // Check for Markdown files in new structure
    const markdownDirs = [
      { path: path.join(DATA_DIR, 'about'), category: 'about' },
      { path: path.join(DATA_DIR, 'blog', 'posts'), category: 'blog' },
      { path: path.join(DATA_DIR, 'projects'), category: 'projects' }
    ];

    for (const dir of markdownDirs) {
      if (fs.existsSync(dir.path)) {
        console.log('API: Scanning directory:', dir.path);
        const dirFiles = fs.readdirSync(dir.path);
        const mdFiles = dirFiles.filter(file => file.endsWith('.md'));
        
        for (const file of mdFiles) {
          const filePath = path.join(dir.path, file);
          const stats = fs.statSync(filePath);
          
          console.log('API: Processing Markdown file:', file, 'category:', dir.category);
          
          files.push({
            category: dir.category,
            filename: file,
            name: file.replace('.md', ''),
            size: stats.size,
            modified: stats.mtime.toISOString(),
            path: filePath,
            type: 'markdown'
          });
        }
      }
    }

    console.log('API: Processed files:', files.length);

    const result = { 
      files: files.sort((a, b) => b.modified.localeCompare(a.modified))
    };
    
    console.log('API: Returning result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API: Error loading files:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
