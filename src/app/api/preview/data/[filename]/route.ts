import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public/data');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    console.log('Preview API: Loading file:', filename);
    
    const filePath = path.join(DATA_DIR, filename);
    console.log('Preview API: File path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('Preview API: File not found:', filePath);
      return NextResponse.json({ 
        error: 'File not found' 
      });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('Preview API: File loaded successfully, size:', content.length);
    
    return NextResponse.json({ 
      content: JSON.parse(content) // Parse JSON for preview
    });
  } catch (error) {
    console.error('Preview API: Error loading file:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
