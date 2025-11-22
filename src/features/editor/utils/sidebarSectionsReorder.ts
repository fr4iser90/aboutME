/**
 * Sidebar Sections Reorder Utility
 * Reorders sections in markdown by reordering H2 headers
 * 
 * Created: 2025-01-XX
 */

import type { MarkdownSection } from '@/features/shared/services/markdownParser'

/**
 * Reorders sections in markdown string
 * Finds H2 headers and reorders them based on new section order
 */
export function reorderSectionsInMarkdown(
  markdown: string,
  newOrder: MarkdownSection[]
): string {
  if (!markdown || newOrder.length === 0) {
    return markdown
  }

  // Split markdown into lines
  const lines = markdown.split('\n')
  const result: string[] = []
  
  // Find all H2 sections with their content
  const sections: Array<{ header: string; content: string[]; sectionId: string }> = []
  let currentSection: { header: string; content: string[]; sectionId: string } | null = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if line is H2 header (## Title)
    const h2Match = line.match(/^##\s+(.+)$/)
    
    if (h2Match) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection)
      }
      
      // Extract section ID from title (convert to kebab-case)
      const title = h2Match[1].trim()
      const sectionId = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      // Start new section
      currentSection = {
        header: line,
        content: [],
        sectionId
      }
    } else if (currentSection) {
      // Add line to current section content
      currentSection.content.push(line)
    } else {
      // Content before first section
      result.push(line)
    }
  }
  
  // Add last section
  if (currentSection) {
    sections.push(currentSection)
  }
  
  // Reorder sections based on newOrder
  const reorderedSections: Array<{ header: string; content: string[] }> = []
  
  for (const orderedSection of newOrder) {
    const section = sections.find(s => s.sectionId === orderedSection.id)
    if (section) {
      reorderedSections.push({
        header: section.header,
        content: section.content
      })
    }
  }
  
  // Add any sections not in newOrder (shouldn't happen, but safety check)
  for (const section of sections) {
    if (!newOrder.find(s => s.id === section.sectionId)) {
      reorderedSections.push({
        header: section.header,
        content: section.content
      })
    }
  }
  
  // Reconstruct markdown
  const reorderedLines: string[] = []
  
  // Add content before first section
  reorderedLines.push(...result)
  
  // Add reordered sections
  for (const section of reorderedSections) {
    reorderedLines.push(section.header)
    reorderedLines.push(...section.content)
  }
  
  return reorderedLines.join('\n')
}

