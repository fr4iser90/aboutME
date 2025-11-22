/**
 * Markdown Block Component
 * Renders markdown content using MarkdownParser
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { MarkdownBlock as MarkdownBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'
import { MarkdownParser, renderMarkdownElement } from '@/features/shared/services/markdownParser'

interface MarkdownBlockProps {
  block: MarkdownBlockType
  context?: BlockContext
  githubUrl?: string
  projectName?: string
}

/**
 * Markdown Block
 * Renders markdown content
 */
export default function MarkdownBlock({ block, context = 'content', githubUrl, projectName }: MarkdownBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const className = `block block-markdown ${animationClasses} ${responsiveClasses}`.trim()

  // Parse markdown
  const parser = new MarkdownParser(block.content, githubUrl, projectName)
  const parsed = parser.parse()

  return (
    <div className={className} style={spacingStyles}>
      {parsed.sections.map((section) => (
        <div
          key={section.id}
          id={section.id}
          className="content-section"
        >
          <h2 className="section-title">{section.title}</h2>
          <div className="section-content">
            {section.content.map((element, index) => 
              renderMarkdownElement(element, index)
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

