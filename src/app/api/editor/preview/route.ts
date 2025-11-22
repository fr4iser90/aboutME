import { NextRequest, NextResponse } from 'next/server';
import { marked } from 'marked';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    const html = marked(content);
    return NextResponse.json({ 
      html 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
