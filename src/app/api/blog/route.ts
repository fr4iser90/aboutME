import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import matter from 'gray-matter';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Try to load from JSON first (pre-parsed)
    const jsonPath = path.join(process.cwd(), 'public/data/blog/blog.json');
    
    try {
      const jsonContent = await fs.readFile(jsonPath, 'utf8');
      const blogData = JSON.parse(jsonContent);
      
      // Return the pre-parsed JSON data
      return NextResponse.json(blogData);
    } catch (jsonError) {
      console.log('JSON not found, falling back to Markdown parsing...');
    }
    
    // Fallback to Markdown parsing
    const blogDir = path.join(process.cwd(), 'public/data/blog/posts');
    
    // Test ob Verzeichnis existiert
    try {
      await fs.access(blogDir);
    } catch {
      return NextResponse.json({ posts: [], totalCount: 0, error: 'Directory not found' });
    }
    
    // Lese alle .md Dateien
    const files = await fs.readdir(blogDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    const posts = [];
    
    for (const file of mdFiles) {
      try {
        const filePath = `${blogDir}/${file}`;
        const content = await fs.readFile(filePath, 'utf8');
        const { data: frontmatter } = matter(content);
        
        const slug = file.replace('.md', '');
        
        // Überspringe Draft-Posts
        if (frontmatter.draft) {
          continue;
        }
        
        posts.push({
          id: slug,
          slug: slug,
          title: frontmatter.title || 'Untitled',
          excerpt: frontmatter.excerpt || 'No excerpt',
          publishedAt: frontmatter.date || '2025-01-19',
          author: frontmatter.author || 'Unknown',
          category: frontmatter.category || 'General',
          tags: frontmatter.tags || [],
          featured: frontmatter.featured || false,
          draft: frontmatter.draft || false,
          readingTime: Math.ceil(content.split(' ').length / 200)
        });
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
    
    // Sortiere nach Datum (neueste zuerst)
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    return NextResponse.json({ 
      posts: posts,
      totalCount: posts.length
    });
    
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}