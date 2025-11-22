import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleFileRequest(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleFileRequest(request, params);
}

async function handleFileRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>
) {
  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join('/');
    const fullPath = path.join(PRIVATE_DATA_DIR, filePath);
    
    // Sicherheitscheck: Nur Dateien innerhalb private/data/
    if (!fullPath.startsWith(PRIVATE_DATA_DIR)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }
    
    // Prüfe ob Datei existiert
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Bestimme Content-Type basierend auf Dateiendung
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'text/markdown; charset=utf-8';
    let isBinary = false;
    
    if (ext === '.svg') {
      contentType = 'image/svg+xml';
    } else if (ext === '.png') {
      contentType = 'image/png';
      isBinary = true;
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
      isBinary = true;
    } else if (ext === '.gif') {
      contentType = 'image/gif';
      isBinary = true;
    } else if (ext === '.webp') {
      contentType = 'image/webp';
      isBinary = true;
    } else if (ext === '.md') {
      contentType = 'text/markdown; charset=utf-8';
    }
    
    // Lade Dateiinhalt (binär für Bilder, UTF-8 für Text)
    const content = isBinary 
      ? fs.readFileSync(fullPath)
      : fs.readFileSync(fullPath, 'utf8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
      },
    });
    
  } catch (error) {
    console.error('❌ Editor file API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
