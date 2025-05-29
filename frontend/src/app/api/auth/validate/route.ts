import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const authToken = request.headers.get('cookie')?.match(/auth_token=([^;]+)/)?.[1];
    
    if (!authToken) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const response = await fetch(`${config.backendUrl}/api/auth/validate`, {
      headers: {
        Cookie: `auth_token=${authToken}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { error: 'Authentication validation failed' },
      { status: 500 }
    );
  }
} 