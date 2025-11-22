/**
 * Block Display Name Utility
 * 
 * Extracts meaningful display names from blocks for UI display.
 * Used in Layout Editor to show block titles instead of just types.
 */

import type { Block, SectionBlock, VideoBlock, CodeBlock, ScreenshotBlock } from '@/features/portfolio/types/blocks'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

/**
 * Get display name for a block
 * Extracts meaningful title based on block type
 * 
 * @param block - The block to get display name for
 * @param markdownSections - Optional markdown sections for section block title lookup
 * @returns Display name string
 */
export function getBlockDisplayName(
  block: Block,
  markdownSections?: MarkdownSection[]
): string {
  // Section blocks: use title from block or markdownSections
  if (block.type === 'section') {
    const sectionBlock = block as SectionBlock
    if (sectionBlock.title) {
      return sectionBlock.title
    }
    // Try to find title from markdownSections
    if (markdownSections) {
      const section = markdownSections.find(s => s.id === block.id || s.id === block.id.replace('section-', ''))
      if (section?.title) {
        return section.title
      }
    }
    // Fallback: extract from id
    return block.id.replace('section-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  
  // Video blocks: use videoId or title
  if (block.type === 'video') {
    const videoBlock = block as VideoBlock
    if (videoBlock.videoId) {
      return videoBlock.videoId
    }
    if (videoBlock.title) {
      return videoBlock.title
    }
    return block.id || 'Video Block'
  }
  
  // Code blocks: extract filename from code or use title
  if (block.type === 'code') {
    const codeBlock = block as CodeBlock
    if (codeBlock.title) {
      return codeBlock.title
    }
    // Try to extract filename from code content
    if (codeBlock.code) {
      const match = codeBlock.code.match(/(?:^|\/|\\)([\w\-]+\.\w+)/)
      if (match && match[1]) {
        return match[1]
      }
      // Try to find filename in comments
      const commentMatch = codeBlock.code.match(/\/\/.*?(\w+\.\w+)/)
      if (commentMatch && commentMatch[1]) {
        return commentMatch[1]
      }
    }
    return block.id || 'Code Block'
  }
  
  // Screenshot blocks: use first image filename
  if (block.type === 'screenshot') {
    const screenshotBlock = block as ScreenshotBlock
    if (screenshotBlock.title) {
      return screenshotBlock.title
    }
    if (screenshotBlock.images && screenshotBlock.images.length > 0) {
      const filename = screenshotBlock.images[0].split('/').pop() || ''
      if (filename) {
        return filename.replace(/\.[^/.]+$/, '') // Remove extension
      }
    }
    return 'Screenshot'
  }
  
  // Navigation blocks: special case
  if (block.type === 'navigation') {
    return 'Navigation'
  }
  
  // Text blocks: use title or first few words of content
  if (block.type === 'text') {
    if ('title' in block && block.title) {
      return block.title as string
    }
    if ('content' in block && block.content) {
      const content = block.content as string
      const firstLine = content.split('\n')[0].trim()
      if (firstLine.length > 0) {
        return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
      }
    }
    return 'Text Block'
  }
  
  // Markdown blocks: use title or first heading
  if (block.type === 'markdown') {
    if ('title' in block && block.title) {
      return block.title as string
    }
    if ('content' in block && block.content) {
      const content = block.content as string
      const headingMatch = content.match(/^#+\s+(.+)$/m)
      if (headingMatch && headingMatch[1]) {
        return headingMatch[1].trim()
      }
      const firstLine = content.split('\n')[0].trim()
      if (firstLine.length > 0) {
        return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
      }
    }
    return 'Markdown Block'
  }
  
  // Fallback: use type labels
  const typeLabels: Record<string, string> = {
    'grid': 'Grid Block',
    'quote': 'Quote Block',
    'callout': 'Callout Block',
    'stats': 'Stats Block',
    'separator': 'Separator',
    'spacer': 'Spacer',
    'embed': 'Embed Block',
    'table': 'Table Block',
    'list': 'List Block'
  }
  
  // Check if block has title property
  if ('title' in block && block.title) {
    return block.title as string
  }
  
  return typeLabels[block.type] || block.type
}

