/**
 * Frontmatter Parser Utility
 * Parses YAML frontmatter from markdown files using gray-matter
 */

import matter from 'gray-matter'
import type { ProjectLayoutConfig, VideoConfig } from '../types'
import { parseVideoUrl } from './videoEmbed'

export interface ParsedFrontmatter {
  layout?: ProjectLayoutConfig
  video?: VideoConfig
  screenshots?: string[]
  [key: string]: any // Allow other frontmatter fields
}

/**
 * Parses frontmatter from markdown content
 */
export function parseFrontmatter(markdown: string): {
  content: string
  frontmatter: ParsedFrontmatter
} {
  const parsed = matter(markdown)
  
  const frontmatter: ParsedFrontmatter = {
    ...parsed.data,
  }

  // Parse layout config if present
  if (parsed.data.layout) {
    frontmatter.layout = parseLayoutConfig(parsed.data.layout)
  }

  // Parse video config if present
  if (parsed.data.video) {
    frontmatter.video = parseVideoConfig(parsed.data.video)
  }

  // Ensure screenshots is an array
  if (parsed.data.screenshots) {
    frontmatter.screenshots = Array.isArray(parsed.data.screenshots)
      ? parsed.data.screenshots
      : [parsed.data.screenshots]
  }

  return {
    content: parsed.content,
    frontmatter,
  }
}

/**
 * Parses layout config from frontmatter
 */
function parseLayoutConfig(layout: any): ProjectLayoutConfig | undefined {
  if (!layout) return undefined

  // If it's already an object with type
  if (typeof layout === 'object' && layout.type) {
    return {
      type: layout.type,
      columns: layout.columns,
      aspectRatio: layout.aspectRatio,
      showThumbnails: layout.showThumbnails,
      autoplay: layout.autoplay,
    }
  }

  // If it's just a string (type only)
  if (typeof layout === 'string') {
    return {
      type: layout as any,
    }
  }

  return undefined
}

/**
 * Parses video config from frontmatter
 */
function parseVideoConfig(video: any): VideoConfig | undefined {
  if (!video) return undefined

  // If it's already a VideoConfig object
  if (typeof video === 'object' && video.type && video.id) {
    return {
      type: video.type,
      id: video.id,
      url: video.url,
    }
  }

  // If it's a URL string, try to parse it
  if (typeof video === 'string') {
    const parsed = parseVideoUrl(video)
    return parsed || undefined
  }

  // If it's an object with url property
  if (typeof video === 'object' && video.url) {
    const parsed = parseVideoUrl(video.url)
    return parsed || undefined
  }

  return undefined
}

