import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { path: relativePath, content } = await request.json();
    
    console.log('🔍 SAVE API DEBUG:');
    console.log('  - relativePath:', relativePath);
    console.log('  - content length:', content.length);
    console.log('  - content preview:', content.substring(0, 100));
    
    // Kombiniere relativen Pfad mit Base-Directory
    const fullPath = path.join(process.cwd(), 'private/data', relativePath);
    
    console.log('  - fullPath:', fullPath);
    
    // Sicherheitscheck: Nur Dateien innerhalb private/data/
    if (!fullPath.startsWith(path.join(process.cwd(), 'private/data'))) {
      console.log('❌ SECURITY CHECK FAILED');
      return NextResponse.json(
        { error: 'Invalid file path - must be within private/data/' },
        { status: 400 }
      );
    }
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      console.log('📁 Creating directory:', dir);
      fs.mkdirSync(dir, { recursive: true });
    }
    
    console.log('💾 Writing file to:', fullPath);
    fs.writeFileSync(fullPath, content, 'utf8');
    
    // Verify file was written
    if (fs.existsSync(fullPath)) {
      const writtenContent = fs.readFileSync(fullPath, 'utf8');
      console.log('✅ File written successfully, length:', writtenContent.length);
    } else {
      console.log('❌ File was NOT written!');
    }
    
    return NextResponse.json({ success: true, path: fullPath });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
