/**
 * Quote Block Component
 * Renders quote text with optional author
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { QuoteBlock as QuoteBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface QuoteBlockProps {
  block: QuoteBlockType
  context?: BlockContext
}

/**
 * Quote Block
 * Renders quote
 */
export default function QuoteBlock({ block, context = 'content' }: QuoteBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const styleClass = block.style || 'default'
  const className = `block block-quote block-quote--${styleClass} ${animationClasses} ${responsiveClasses}`.trim()

  return (
    <div className={className} style={spacingStyles}>
      <blockquote className="quote-block">
        <p className="quote-text">{block.text}</p>
        {block.author && (
          <footer className="quote-author">— {block.author}</footer>
        )}
      </blockquote>
    </div>
  )
}

