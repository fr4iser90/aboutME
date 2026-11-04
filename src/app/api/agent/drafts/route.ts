/**
 * List agent/content drafts awaiting review.
 * GET /api/agent/drafts
 */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { requireAdmin } from '@/features/auth/services/requireAdmin';

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');

async function readJsonSafe(filePath: string) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const drafts: Array<{
    type: 'blog' | 'project';
    slug: string;
    title: string;
    status: string;
    path: string;
    updatedAt?: string;
  }> = [];

  // Blog posts
  const blogPostsDir = path.join(PRIVATE_DATA_DIR, 'blog', 'posts');
  try {
    const files = await fs.readdir(blogPostsDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const data = await readJsonSafe(path.join(blogPostsDir, file));
      if (!data) continue;
      const status = data.status || (data.draft ? 'draft' : 'published');
      if (status === 'published') continue;
      drafts.push({
        type: 'blog',
        slug: data.slug || file.replace(/\.json$/, ''),
        title: data.title || file,
        status,
        path: `blog/posts/${file}`,
        updatedAt: data.updatedAt,
      });
    }
  } catch {
    /* no blog posts dir */
  }

  // Inactive / draft-like projects
  const detailsDir = path.join(PRIVATE_DATA_DIR, 'projects', 'details');
  try {
    const files = await fs.readdir(detailsDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const data = await readJsonSafe(path.join(detailsDir, file));
      if (!data) continue;
      if (data.status && data.status !== 'active' && data.status !== 'published') {
        drafts.push({
          type: 'project',
          slug: file.replace(/\.json$/, ''),
          title: data.name || file,
          status: data.status,
          path: `projects/details/${file}`,
          updatedAt: data.updatedAt,
        });
      }
    }
  } catch {
    /* no details */
  }

  drafts.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));

  return NextResponse.json({ drafts, total: drafts.length });
}

/**
 * Approve a draft → set status published/active (still needs site Publish to go live).
 * POST { path, action: 'approve' | 'reject' }
 */
export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const relPath = String(body.path || '');
    const action = body.action === 'reject' ? 'reject' : 'approve';

    if (!relPath || relPath.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const fullPath = path.join(PRIVATE_DATA_DIR, relPath);
    if (!fullPath.startsWith(PRIVATE_DATA_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const raw = await fs.readFile(fullPath, 'utf-8');
    const data = JSON.parse(raw);

    if (action === 'reject') {
      data.status = 'archived';
      data.draft = true;
    } else if (relPath.includes('blog/')) {
      data.status = 'published';
      data.draft = false;
    } else {
      data.status = 'active';
    }
    data.updatedAt = new Date().toISOString();
    data.reviewedAt = data.updatedAt;

    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      action,
      path: relPath,
      status: data.status,
      message:
        action === 'approve'
          ? 'Approved — run Publish to push live'
          : 'Marked archived',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
