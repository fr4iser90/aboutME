import { NextRequest, NextResponse } from 'next/server';
import { writeSiteStatus, readSiteStatus } from '@/features/shared/utils/siteStatus';

/**
 * GET: Read build validation status (legacy compatibility)
 * @deprecated Use /api/site/status instead
 */
export async function GET() {
  try {
    const status = await readSiteStatus();
    // Return legacy format for backward compatibility
    return NextResponse.json({
      validated: status.validated,
      validatedAt: status.validatedAt,
      buildTimestamp: status.validatedAt ? new Date(status.validatedAt).getTime() : null
    });
  } catch (error) {
    console.error('Build status error:', error);
    return NextResponse.json({
      validated: false,
      validatedAt: null,
      buildTimestamp: null
    });
  }
}

/**
 * POST: Set build validation status (only for authenticated admins)
 * @deprecated Use /api/site/status POST instead
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { validated = true } = body;

    // Write to site-status.json
    const newStatus = await writeSiteStatus({
      validated,
      validatedAt: validated ? new Date().toISOString() : null
    });

    // Return legacy format for backward compatibility
    return NextResponse.json({
      success: true,
      buildStatus: {
        validated: newStatus.validated,
        validatedAt: newStatus.validatedAt,
        buildTimestamp: newStatus.validatedAt ? new Date(newStatus.validatedAt).getTime() : null
      }
    });
  } catch (error) {
    console.error('Build status error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}

