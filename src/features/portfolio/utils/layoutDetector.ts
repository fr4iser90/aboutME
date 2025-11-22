/**
 * Layout Detection Utility
 * Auto-detects layout type based on project content
 */

import type { Project, LayoutType, ProjectLayoutConfig } from '../types'
import { parseVideoUrl } from './videoEmbed'

/**
 * Detects layout type based on project content
 * Priority: manual config > auto-detection
 * 
 * Auto-detection is a convenience feature for backward compatibility.
 * For production use, explicit layout config is recommended.
 */
export function detectLayoutType(project: Project): LayoutType {
  const requestedType = project.layout?.type

  // If explicit layout type is set (and not 'auto'), use it
  if (requestedType && requestedType !== 'auto') {
    return requestedType
  }

  // If type is explicitly 'auto' or not set, perform auto-detection
  return performAutoDetection(project)
}

/**
 * Performs auto-detection based on content
 * This is a convenience feature - explicit config is preferred
 */
function performAutoDetection(project: Project): LayoutType {
  const hasVideo = !!project.video
  const imageCount = project.screenshots?.length || 0

  // Mixed: video + images
  if (hasVideo && imageCount > 0) {
    return 'mixed'
  }

  // Video only
  if (hasVideo && imageCount === 0) {
    return 'video'
  }

  // Single image
  if (imageCount === 1) {
    return 'single'
  }

  // Grid: 2-4 images
  if (imageCount >= 2 && imageCount <= 4) {
    return 'grid'
  }

  // Gallery: 5-12 images
  if (imageCount >= 5 && imageCount <= 12) {
    return 'gallery'
  }

  // Carousel: many images
  if (imageCount > 12) {
    return 'carousel'
  }

  // Default fallback (no content)
  return 'single'
}

/**
 * Gets layout config with defaults
 * 
 * Note: Auto-detection is used as a fallback for backward compatibility.
 * For new projects, explicit layout config is recommended.
 */
export function getLayoutConfig(project: Project): ProjectLayoutConfig {
  const finalType = detectLayoutType(project)
  
  return {
    type: finalType,
    columns: project.layout?.columns ?? getDefaultColumns(finalType, project.screenshots?.length || 0),
    aspectRatio: project.layout?.aspectRatio ?? 'auto',
    showThumbnails: project.layout?.showThumbnails ?? true,
    autoplay: project.layout?.autoplay ?? false,
  }
}

/**
 * Gets default column count based on layout type and image count
 */
function getDefaultColumns(layoutType: LayoutType, imageCount: number): number {
  if (layoutType === 'grid') {
    if (imageCount === 2) return 2
    if (imageCount === 3) return 3
    if (imageCount === 4) return 2
    return 3
  }
  return 3
}

