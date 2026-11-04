/**
 * Layout detection — picks a media layout from project content
 * when `project.layout.type` is missing or set to `auto`.
 */

import type { Project, LayoutType, ProjectLayoutConfig } from '../types'

/**
 * Resolve layout type: explicit config wins; otherwise infer from media.
 */
export function detectLayoutType(project: Project): LayoutType {
  const requestedType = project.layout?.type

  if (requestedType && requestedType !== 'auto') {
    return requestedType
  }

  return inferLayoutFromContent(project)
}

function inferLayoutFromContent(project: Project): LayoutType {
  const hasVideo = !!project.video
  const imageCount = project.screenshots?.length || 0

  if (hasVideo && imageCount > 0) return 'mixed'
  if (hasVideo && imageCount === 0) return 'video'
  if (imageCount === 1) return 'single'
  if (imageCount >= 2 && imageCount <= 4) return 'grid'
  if (imageCount >= 5 && imageCount <= 12) return 'gallery'
  if (imageCount > 12) return 'carousel'
  return 'single'
}

/**
 * Full layout config with defaults filled in.
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

function getDefaultColumns(layoutType: LayoutType, imageCount: number): number {
  if (layoutType === 'grid') {
    if (imageCount === 2) return 2
    if (imageCount === 3) return 3
    if (imageCount === 4) return 2
    return 3
  }
  return 3
}
