import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const response = await fetch(`${config.backendUrl}/api/admin/github`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch github data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Github fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch github data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${config.backendUrl}/api/admin/github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to update github data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Github update error:', error);
    return NextResponse.json(
      { error: 'Failed to update github data' },
      { status: 500 }
    );
  }
} 