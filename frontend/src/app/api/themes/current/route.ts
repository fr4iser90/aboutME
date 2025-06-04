import { NextResponse } from 'next/server';
import { config } from '@/domain/shared/utils/config';

export async function GET() {
  try {
    const response = await fetch(`${config.backendUrl}/public/themes`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch theme');
    }

    const theme = await response.json();
    return NextResponse.json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    );
  }
} 