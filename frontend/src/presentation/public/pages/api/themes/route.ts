import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const response = await fetch(`${config.backendUrl}/api/public/themes`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch themes data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Themes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes data' },
      { status: 500 }
    );
  }
} 