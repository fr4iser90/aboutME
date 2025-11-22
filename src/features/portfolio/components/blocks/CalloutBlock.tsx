/**
 * Callout Block Component
 * Renders callout boxes (info, warning, success, error)
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { CalloutBlock as CalloutBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface CalloutBlockProps {
  block: CalloutBlockType
  context?: BlockContext
}

/**
 * Callout Block
 * Renders callout box
 */
export default function CalloutBlock({ block, context = 'content' }: CalloutBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const className = `block block-callout block-callout--${block.variant} ${animationClasses} ${responsiveClasses}`.trim()

  return (
    <div className={className} style={spacingStyles}>
      <div className="callout-block">
        {block.title && (
          <h4 className="callout-title">{block.title}</h4>
        )}
        <div className="callout-content">{block.content}</div>
      </div>
    </div>
  )
}

