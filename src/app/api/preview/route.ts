import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if user is authenticated
  const sessionCookie = request.cookies.get('admin_session');
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return preview data
  return NextResponse.json({
    message: 'Preview data',
    authenticated: true,
    session: sessionCookie.value
  });
}
