import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const response = await fetch(`${config.backendUrl}/api/admin/projects`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin projects data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin projects fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin projects data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${config.backendUrl}/api/admin/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin project creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${config.backendUrl}/api/admin/projects`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to update project');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin project update error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${config.backendUrl}/api/admin/projects?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin project deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 