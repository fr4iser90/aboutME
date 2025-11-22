import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');
const GENERATED_DATA_DIR = path.join(process.cwd(), 'public/data');

function readJsonFile(filePath: string): any {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    let data = null;
    let filePath = '';

    switch (type) {
      case 'projects':
        filePath = path.join(GENERATED_DATA_DIR, 'projects', 'projects.json');
        break;
      case 'blog':
        filePath = path.join(GENERATED_DATA_DIR, 'blog', 'blog.json');
        break;
      case 'about':
        filePath = path.join(GENERATED_DATA_DIR, 'about', 'about.json');
        break;
      case 'skills':
        filePath = path.join(GENERATED_DATA_DIR, 'skills', 'skills.json');
        break;
      case 'config':
        filePath = path.join(GENERATED_DATA_DIR, 'config', 'config.json');
        break;
      case 'timeline':
        filePath = path.join(GENERATED_DATA_DIR, 'timeline', 'timeline.json');
        break;
      default:
        return NextResponse.json(
          { 
            error: `Invalid data type: ${type}. Available types: projects, blog, about, skills, config, timeline` 
          },
          { status: 400 }
        );
    }

    data = readJsonFile(filePath);

    if (data === null) {
      return NextResponse.json(
        { 
          error: `${type} data not found. Please run build first.` 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    const { type } = await params;
    console.error(`❌ Public data API error for type ${type}:`, error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

