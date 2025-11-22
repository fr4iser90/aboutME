/**
 * Separator Block Component
 * Renders separator lines
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { SeparatorBlock as SeparatorBlockType, BlockContext } from '../../types/blocks'
import { getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface SeparatorBlockProps {
  block: SeparatorBlockType
  context?: BlockContext
}

/**
 * Separator Block
 * Renders separator line
 */
export default function SeparatorBlock({ block, context = 'content' }: SeparatorBlockProps) {
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const style = block.style || 'line'
  const spacingSize = block.spacingSize || 'medium'
  const className = `block block-separator block-separator--${style} block-separator--${spacingSize} ${responsiveClasses}`.trim()

  return (
    <div className={className} style={spacingStyles}>
      <hr className="separator-line" />
    </div>
  )
}

