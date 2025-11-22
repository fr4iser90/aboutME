import { NextRequest, NextResponse } from 'next/server';
import { readSiteStatus, writeSiteStatus, calculateCurrentStatus, type SiteStatus } from '@/features/shared/utils/siteStatus';

/**
 * GET: Read site status
 */
export async function GET() {
  try {
    const status = await readSiteStatus();
    const currentStatus = calculateCurrentStatus(status);
    
    return NextResponse.json({
      ...status,
      currentStatus
    });
  } catch (error) {
    console.error('Site status error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST: Update site status (only for authenticated admins)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Partial<SiteStatus> = {};

    // Allow updating specific fields
    if (body.setupComplete !== undefined) {
      updates.setupComplete = body.setupComplete;
      updates.setupAt = body.setupComplete ? new Date().toISOString() : null;
    }
    if (body.validated !== undefined) {
      updates.validated = body.validated;
      updates.validatedAt = body.validated ? new Date().toISOString() : null;
    }
    if (body.published !== undefined) {
      updates.published = body.published;
      updates.publishedAt = body.published ? new Date().toISOString() : null;
    }

    const newStatus = await writeSiteStatus(updates);
    const currentStatus = calculateCurrentStatus(newStatus);

    return NextResponse.json({
      success: true,
      ...newStatus,
      currentStatus
    });
  } catch (error) {
    console.error('Site status error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}

