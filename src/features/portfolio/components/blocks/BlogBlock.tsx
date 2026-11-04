'use client'

import { TerminalSection } from '@/features/terminal'
import { BlogSection } from '@/features/blog'
import type { BlogPost } from '@/features/blog/types'

interface BlogBlockProps {
  posts: BlogPost[]
  config?: {
    enabled?: boolean
  }
  onPostClick?: (post: BlogPost) => void
}

export default function BlogBlock({ posts, config, onPostClick }: BlogBlockProps) {
  if (!config?.enabled || posts.length === 0) return null
  
  return (
    <TerminalSection id="blog" title="Blog Posts">
      <BlogSection posts={posts} onPostClick={onPostClick ?? (() => {})} />
    </TerminalSection>
  )
}

