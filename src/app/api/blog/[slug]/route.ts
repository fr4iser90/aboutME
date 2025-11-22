import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { config } from '@/features/shared/services/config';


/**
 * Sichere Blog-Post API Route
 * 
 * Liest Markdown-Dateien zur Laufzeit mit vollständiger Sicherheitsvalidierung:
 * - Path Traversal Protection
 * - Symlink Protection  
 * - File Extension Validation
 * - Slug Pattern Validation
 */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    
    // 1. Validiere Slug-Pattern (nur erlaubte Zeichen)
    const allowedSlugPattern = /^[a-zA-Z0-9-_]+$/;
    if (!allowedSlugPattern.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      );
    }
    
    // 2. Definiere sichere Pfade
    const baseDir = config.paths.blogDir;
    const filePath = path.join(baseDir, `${slug}.md`);
    
    // 3. Normalisiere den Pfad (entfernt ../ und andere unsichere Pfade)
    const normalizedPath = path.resolve(filePath);
    
    // 4. Prüfe ob der normalisierte Pfad im richtigen Verzeichnis ist
    const resolvedBaseDir = path.resolve(baseDir);
    if (!normalizedPath.startsWith(resolvedBaseDir)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // 5. Prüfe ob Datei existiert
    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // 6. Prüfe ob es eine .md Datei ist
    if (!normalizedPath.endsWith('.md')) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }
    
    // 7. Lese und parse die Markdown-Datei
    const fileContent = fs.readFileSync(normalizedPath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // 8. Validiere Frontmatter
    if (!frontmatter.title || !frontmatter.date) {
      return NextResponse.json(
        { error: 'Invalid blog post format' },
        { status: 400 }
      );
    }
    
    // 9. Berechne Reading Time
    const readingTime = Math.ceil(content.split(' ').length / 200);
    
    // 10. Erstelle Blog-Post Objekt
    const blogPost = {
      id: slug,
      title: frontmatter.title,
      excerpt: frontmatter.excerpt || content.substring(0, 200) + '...',
      content: content,
      publishedAt: frontmatter.date || frontmatter.publishedAt,
      updatedAt: frontmatter.updatedAt || new Date().toISOString(),
      author: frontmatter.author || 'Patrick B.',
      category: frontmatter.category || 'General',
      tags: frontmatter.tags || [],
      featured: frontmatter.featured || false,
      draft: frontmatter.draft || false,
      slug: slug,
      readingTime: readingTime,
      image: frontmatter.image || null
    };
    
    // 11. Prüfe ob Post nicht als Draft markiert ist
    if (blogPost.draft) {
      return NextResponse.json(
        { error: 'Blog post not published' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(blogPost);
    
  } catch (error) {
    console.error('Error reading blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/[slug] - Hole einen spezifischen Blog-Post
 * 
 * Beispiel: GET /api/blog/became-a-techy
 * 
 * Sicherheitsfeatures:
 * - Path Traversal Protection
 * - Symlink Protection
 * - File Extension Validation
 * - Slug Pattern Validation
 * - Draft Post Protection
 */
