/**
 * Project Layout System Types
 * Central type definitions for portfolio feature
 */

// Export block-based layout system types
export * from './types/blocks'
export * from './types/layouts'

export type LayoutType = 'single' | 'grid' | 'gallery' | 'carousel' | 'video' | 'mixed' | 'auto'

export interface ProjectLayoutConfig {
  type?: LayoutType
  columns?: number // For grid layout (2, 3, 4)
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto'
  showThumbnails?: boolean
  autoplay?: boolean // For carousel
}

export interface VideoConfig {
  type: 'youtube' | 'vimeo'
  id: string
  url?: string // Full URL for validation
}

export interface Project {
  id: number
  name: string
  description: string
  githubUrl: string
  language: string
  stars: number
  topics: string[]
  featured: boolean
  category: string
  technologies: string[]
  demoUrl?: string
  difficulty: string
  status: string
  tags: string[]
  longDescription?: string
  htmlLongDescription?: string // Pre-parsed HTML for performance
  screenshots?: string[]
  layout?: ProjectLayoutConfig
  video?: VideoConfig
}

