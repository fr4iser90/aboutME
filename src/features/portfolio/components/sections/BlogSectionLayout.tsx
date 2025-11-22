'use client'

import { TerminalSection } from '@/features/terminal'
import { BlogSection } from '@/features/blog'

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  content?: string
  tags?: string[]
}

interface BlogSectionLayoutProps {
  posts: BlogPost[]
  config?: {
    enabled?: boolean
  }
  layout?: {
    template?: 'grid' | 'list' | 'magazine' | 'compact'
  }
  onPostClick?: (post: BlogPost) => void
}

export default function BlogSectionLayout({ 
  posts, 
  config, 
  layout,
  onPostClick 
}: BlogSectionLayoutProps) {
  const template = layout?.template || 'list'
  
  if (!config?.enabled || posts.length === 0) return null
  
  // List Layout (default)
  if (template === 'list') {
    return (
      <TerminalSection id="blog" title="Blog Posts">
        <BlogSection posts={posts} onPostClick={onPostClick} />
      </TerminalSection>
    )
  }
  
  // Grid Layout
  if (template === 'grid') {
    return (
      <TerminalSection id="blog" title="Blog Posts">
        <div className="blog-grid">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="blog-card blog-card--grid"
              onClick={() => onPostClick?.(post)}
            >
              <h3 className="blog-card__title">{post.title}</h3>
              <p className="blog-card__excerpt">{post.excerpt}</p>
              <time className="blog-card__date">{post.date}</time>
            </article>
          ))}
        </div>
      </TerminalSection>
    )
  }
  
  // Magazine Layout
  if (template === 'magazine') {
    const featuredPost = posts[0]
    const otherPosts = posts.slice(1)
    
    return (
      <TerminalSection id="blog" title="Blog Posts">
        <div className="blog-magazine">
          {featuredPost && (
            <article 
              className="blog-card blog-card--featured"
              onClick={() => onPostClick?.(featuredPost)}
            >
              <h2 className="blog-card__title blog-card__title--large">{featuredPost.title}</h2>
              <p className="blog-card__excerpt blog-card__excerpt--large">{featuredPost.excerpt}</p>
              <time className="blog-card__date">{featuredPost.date}</time>
            </article>
          )}
          <div className="blog-magazine__grid">
            {otherPosts.map((post) => (
              <article 
                key={post.id} 
                className="blog-card blog-card--magazine"
                onClick={() => onPostClick?.(post)}
              >
                <h3 className="blog-card__title">{post.title}</h3>
                <p className="blog-card__excerpt">{post.excerpt}</p>
                <time className="blog-card__date">{post.date}</time>
              </article>
            ))}
          </div>
        </div>
      </TerminalSection>
    )
  }
  
  // Compact Layout
  return (
    <TerminalSection id="blog" title="Blog Posts">
      <div className="blog-compact">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="blog-card blog-card--compact"
            onClick={() => onPostClick?.(post)}
          >
            <h3 className="blog-card__title">{post.title}</h3>
            <time className="blog-card__date">{post.date}</time>
          </article>
        ))}
      </div>
    </TerminalSection>
  )
}

