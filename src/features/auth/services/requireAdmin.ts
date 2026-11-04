/**
 * Shared admin auth gate for API routes.
 */
import { NextRequest, NextResponse } from 'next/server';
import { isSecurelyAuthenticated } from '@/features/auth/services/auth';

export function requireAdmin(request: NextRequest): NextResponse | null {
  if (!isSecurelyAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
