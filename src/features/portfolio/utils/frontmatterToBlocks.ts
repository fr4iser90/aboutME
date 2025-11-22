/**
 * Frontmatter to Blocks Converter
 * Converts frontmatter to block-based layout configuration
 * Supports both new block structure and legacy frontmatter
 * 
 * WICHTIG: Diese Funktion wird NUR aufgerufen wenn `useBlockSystem: true` im Frontmatter steht!
 * Bestehende Projekte OHNE `useBlockSystem: true` verwenden weiterhin das alte Layout.
 * 
 * Created: 2025-11-16
 */

import type { DetailPageLayoutConfig, DetailLayoutConfig, DetailPageLayoutTemplate, DetailLayoutTemplate } from '../types/layouts'
import type { Block, ScreenshotBlock, VideoBlock, MarkdownBlock, SectionBlock } from '../types/blocks'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'
import type { ParsedFrontmatter } from './frontmatterParser'
import { getCurrentDesign, getDefaultLayoutForDesignSync } from '@/features/shared/utils/themeDesign'

/**
 * Converts frontmatter to block-based layout configuration
 * 
 * @param frontmatter - Parsed frontmatter from markdown file
 * @param markdownSections - Parsed markdown sections
 * @returns DetailPageLayoutConfig with blocks organized in slots
 */
export function frontmatterToBlocks(
  frontmatter: ParsedFrontmatter | any,
  markdownSections: MarkdownSection[] = []
): DetailPageLayoutConfig | DetailLayoutConfig {
  // Check for new block structure
  if (frontmatter.layout?.slots) {
    // New structure: return directly
    return {
      template: frontmatter.pageLayout || 'sidebar-left',
      slots: frontmatter.layout.slots,
    }
  }

  // Legacy structure: convert to blocks
  const blocks: Block[] = []

  // WICHTIG: Screenshots werden NICHT automatisch hinzugefügt!
  // Sie müssen explizit im Frontmatter als Block definiert werden.
  // Nur wenn explizit gewünscht (z.B. in neuem Block-System Format)

  // Convert video to VideoBlock (nur wenn explizit vorhanden)
  if (frontmatter.video && frontmatter.video.type && frontmatter.video.id) {
    const videoBlock: VideoBlock = {
      id: 'video-main',
      type: 'video',
      source: frontmatter.video.type,
      videoId: frontmatter.video.id, // Video ID (YouTube/Vimeo)
      autoplay: frontmatter.video.autoplay || false,
    }
    blocks.push(videoBlock)
  }

  // Convert markdown sections to SectionBlocks
  // WICHTIG: Wir rendern Sections DIREKT (wie ProjectContent), nicht als Markdown-String
  markdownSections.forEach((section) => {
    const sectionBlock: SectionBlock = {
      id: `section-${section.id}`,
      type: 'section',
      sectionId: section.id,
      title: section.title,
      content: section.content, // Direkt die MarkdownElement[] verwenden
    }
    blocks.push(sectionBlock)
  })

  // Determine detail layout template
  // Priority: 1. Explicit frontmatter.pageLayout, 2. Design default layout, 3. Fallback to sidebar-left
  let pageLayout: DetailPageLayoutTemplate = frontmatter.pageLayout as DetailPageLayoutTemplate
  
  if (!pageLayout) {
    // Get current design and use its default layout
    const currentDesign = getCurrentDesign()
    const defaultLayout = getDefaultLayoutForDesignSync(currentDesign)
    pageLayout = defaultLayout as DetailPageLayoutTemplate
  }
  
  // Ensure valid layout type
  if (!pageLayout) {
    pageLayout = 'sidebar-left'
  }

  // Organize blocks into slots
  const slots: DetailPageLayoutConfig['slots'] = {
    content: blocks,
  }

  // If sidebar layout (left or right) and we have markdown sections, add navigation block
  if ((pageLayout === 'sidebar-left' || pageLayout === 'sidebar-right' || pageLayout === 'sticky-sidebar') && markdownSections.length > 0) {
    slots.sidebar = [
      {
        id: 'navigation-main',
        type: 'navigation',
        sections: 'auto',
        style: 'numbered',
      },
    ]
  }

  return {
    template: pageLayout,
    slots,
  }
}

