export interface BlogPost {
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
