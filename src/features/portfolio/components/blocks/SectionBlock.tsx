/**
 * Section Block Component
 * Renders markdown sections directly (like ProjectContent)
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { SectionBlock as SectionBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'
import { renderMarkdownElement } from '@/features/shared/services/markdownParser'

interface SectionBlockProps {
  block: SectionBlockType
  context?: BlockContext
}

/**
 * Section Block
 * Renders section directly (like ProjectContent)
 */
export default function SectionBlock({ block, context = 'content' }: SectionBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const className = `block block-section ${animationClasses} ${responsiveClasses}`.trim()

  return (
    <div
      key={block.sectionId}
      id={block.sectionId}
      className="content-section"
      style={spacingStyles}
    >
      <h2 className="section-title">{block.title}</h2>
      <div className="section-content">
        {block.content.map((element, index) => 
          renderMarkdownElement(element, index)
        )}
      </div>
    </div>
  )
}

