/**
 * Video Embed Utilities
 * Parses and validates video URLs for YouTube and Vimeo
 */

import type { VideoConfig } from '../types'

/**
 * YouTube URL patterns
 */
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
]

/**
 * Vimeo URL patterns
 */
const VIMEO_PATTERNS = [
  /vimeo\.com\/(\d+)/,
  /vimeo\.com\/video\/(\d+)/,
]

/**
 * Extracts YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

/**
 * Extracts Vimeo video ID from URL
 */
export function extractVimeoId(url: string): string | null {
  for (const pattern of VIMEO_PATTERNS) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

/**
 * Validates if URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}

/**
 * Validates if URL is a valid Vimeo URL
 */
export function isValidVimeoUrl(url: string): boolean {
  return extractVimeoId(url) !== null
}

/**
 * Generates YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Generates Vimeo embed URL from video ID
 */
export function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`
}

/**
 * Parses video URL and returns VideoConfig
 */
export function parseVideoUrl(url: string): VideoConfig | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  // Try YouTube first
  const youtubeId = extractYouTubeId(url)
  if (youtubeId) {
    return {
      type: 'youtube',
      id: youtubeId,
      url,
    }
  }

  // Try Vimeo
  const vimeoId = extractVimeoId(url)
  if (vimeoId) {
    return {
      type: 'vimeo',
      id: vimeoId,
      url,
    }
  }

  return null
}

/**
 * Validates VideoConfig
 */
export function validateVideoConfig(config: VideoConfig): boolean {
  if (!config || !config.type || !config.id) {
    return false
  }

  if (config.type === 'youtube') {
    // YouTube IDs are 11 characters
    return /^[a-zA-Z0-9_-]{11}$/.test(config.id)
  }

  if (config.type === 'vimeo') {
    // Vimeo IDs are numeric
    return /^\d+$/.test(config.id)
  }

  return false
}

/**
 * Gets embed URL from VideoConfig
 */
export function getEmbedUrl(config: VideoConfig): string | null {
  if (!validateVideoConfig(config)) {
    return null
  }

  if (config.type === 'youtube') {
    return getYouTubeEmbedUrl(config.id)
  }

  if (config.type === 'vimeo') {
    return getVimeoEmbedUrl(config.id)
  }

  return null
}

