/**
 * Agent content ingest API
 *
 * POST /api/agent/ingest
 * Body: { type: 'blog'|'project', slug?, title, content, status?: 'draft'|'review'|'published', metadata? }
 *
 * Writes validated drafts under private/data for human review before publish.
 */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { requireAdmin } from '@/features/auth/services/requireAdmin';
import { jsonValidator } from '@/features/editor/services/jsonValidator';
import { blogPostSchema, projectSchema } from '@/features/editor/services/jsonSchema';

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || `draft-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const type = body.type === 'project' ? 'project' : 'blog';
    const status = ['draft', 'review', 'published'].includes(body.status)
      ? body.status
      : 'draft';
    const title = String(body.title || '').trim();
    const content = String(body.content || '').trim();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title and content are required' },
        { status: 400 }
      );
    }

    const slug = slugify(String(body.slug || title));
    const now = new Date().toISOString();

    if (type === 'blog') {
      const post = {
        id: slug,
        title,
        content,
        htmlContent: null,
        excerpt: content.slice(0, 180),
        publishedAt: now,
        updatedAt: now,
        author: body.author || 'agent',
        category: body.category || 'general',
        tags: Array.isArray(body.tags) ? body.tags : [],
        featured: false,
        draft: status !== 'published',
        slug,
        readingTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 200)),
        image: null,
        status,
        ...(body.metadata && typeof body.metadata === 'object' ? body.metadata : {}),
      };

      const validation = jsonValidator.validate(post, blogPostSchema);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: 'Schema validation failed', details: validation.errors },
          { status: 400 }
        );
      }

      const dir = path.join(PRIVATE_DATA_DIR, 'blog', 'posts');
      await fs.mkdir(dir, { recursive: true });
      const filePath = path.join(dir, `${slug}.json`);
      await fs.writeFile(filePath, JSON.stringify(post, null, 2), 'utf-8');

      // Update blog index
      const indexPath = path.join(PRIVATE_DATA_DIR, 'blog', 'blog.json');
      let index: { blog: any[]; lastUpdated?: string } = { blog: [] };
      try {
        index = JSON.parse(await fs.readFile(indexPath, 'utf-8'));
        if (!Array.isArray(index.blog)) index.blog = [];
      } catch {
        index = { blog: [] };
      }
      index.blog = [
        { slug, title, status, updatedAt: now },
        ...index.blog.filter((p: any) => p.slug !== slug),
      ];
      index.lastUpdated = now;
      await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');

      return NextResponse.json({
        success: true,
        type: 'blog',
        status,
        path: `blog/posts/${slug}.json`,
        slug,
        message: status === 'published'
          ? 'Ingested as published (run Publish to go live)'
          : 'Ingested as draft — review in Content editor, then Publish',
      });
    }

    // project
    const project = {
      id: Date.now() / 1000,
      name: title,
      description: content.slice(0, 280),
      content,
      htmlContent: null,
      githubUrl: body.githubUrl || '',
      homepage: body.homepage ?? null,
      demoUrl: body.demoUrl ?? null,
      language: body.language ?? null,
      stars: 0,
      forks: 0,
      topics: Array.isArray(body.tags) ? body.tags : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      updatedAt: now,
      createdAt: now,
      size: 0,
      featured: false,
      category: body.category || 'project',
      technologies: Array.isArray(body.technologies) ? body.technologies : [],
      difficulty: 'intermediate',
      status: status === 'published' ? 'active' : 'inactive',
      contributors: 0,
      screenshots: [],
      techStack: { languages: {}, frameworks: [], tools: [], confidence: 0, summary: '' },
      techStackSummary: null,
      readme: null,
      longDescription: content,
      ...(body.metadata && typeof body.metadata === 'object' ? body.metadata : {}),
    };

    const validation = jsonValidator.validate(project, projectSchema);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Schema validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const detailsDir = path.join(PRIVATE_DATA_DIR, 'projects', 'details');
    await fs.mkdir(detailsDir, { recursive: true });
    const filePath = path.join(detailsDir, `${slug}.json`);
    await fs.writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      type: 'project',
      status,
      path: `projects/details/${slug}.json`,
      slug,
      message: 'Ingested project detail — review in Content editor, then Publish',
    });
  } catch (error) {
    console.error('Agent ingest error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/agent/ingest',
    method: 'POST',
    auth: 'admin_session cookie required',
    body: {
      type: 'blog | project',
      title: 'string',
      content: 'string',
      slug: 'optional',
      status: 'draft | review | published',
      tags: 'string[] optional',
    },
  });
}
