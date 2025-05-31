import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const response = await fetch(`${config.backendUrl}/api/public/skills`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch skills data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Skills fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills data' },
      { status: 500 }
    );
  }
} 