/**
 * Text Block Component
 * Renders text content with different styles
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { TextBlock as TextBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface TextBlockProps {
  block: TextBlockType
  context?: BlockContext
}

/**
 * Text Block
 * Renders text content
 */
export default function TextBlock({ block, context = 'content' }: TextBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const styleClass = block.style || 'default'
  const className = `block block-text block-text--${styleClass} ${animationClasses} ${responsiveClasses}`.trim()

  return (
    <div className={className} style={spacingStyles}>
      <div className="text-block-content" dangerouslySetInnerHTML={{ __html: block.content }} />
    </div>
  )
}

