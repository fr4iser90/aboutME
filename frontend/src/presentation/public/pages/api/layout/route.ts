import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const response = await fetch(`${config.backendUrl}/api/public/layout`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch layout data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Layout fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layout data' },
      { status: 500 }
    );
  }
} 