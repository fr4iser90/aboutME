'use client'

import { useState } from 'react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  author: string
  category: string
  tags: string[]
  featured: boolean
  slug: string
  readingTime: number
  image?: string
}

interface BlogSectionProps {
  posts: BlogPost[]
  onPostClick: (post: BlogPost) => void
}

export default function BlogSection({ posts, onPostClick }: BlogSectionProps) {
  const [filter, setFilter] = useState<'all' | 'featured'>('all')

  const filteredPosts = filter === 'featured' 
    ? posts.filter(post => post.featured)
    : posts

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <section id="blog" className="blog-section">
      <div className="blog-section__container">
        <div className="blog-section__header">
          <h2 className="blog-section__title neon-text">
            Latest Posts
          </h2>
          <p className="blog-section__subtitle">
            Thoughts, tutorials, and insights from my development journey
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="blog-filters">
          <button
            onClick={() => setFilter('all')}
            className={`btn-neon blog-filters__btn ${filter === 'all' ? 'blog-filters__btn--active' : ''}`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`btn-neon blog-filters__btn ${filter === 'featured' ? 'blog-filters__btn--active' : ''}`}
          >
            Featured
          </button>
        </div>

        {/* Blog Posts Grid */}
        <div className="projects-grid">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="glass-card glass-card--hover cursor-pointer"
              onClick={() => onPostClick(post)}
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="blog-post__image"
                />
              )}
              
              <div className="blog-post__meta">
                <span className="blog-post__category">
                  {post.category}
                </span>
                {post.featured && (
                  <span className="blog-post__featured-badge">
                    Featured
                  </span>
                )}
              </div>

              <h3 className="blog-post__title">
                {post.title}
              </h3>

              <p className="blog-post__excerpt">
                {post.excerpt}
              </p>

              <div className="blog-post__info">
                <span className="blog-post__date">{formatDate(post.publishedAt)}</span>
                <span className="blog-post__reading-time">{post.readingTime} min read</span>
              </div>

              {post.tags.length > 0 && (
                <div className="blog-post__tags">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="blog-post__tag"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}
