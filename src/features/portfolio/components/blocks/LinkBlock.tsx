'use client'

import React from 'react'
import type { LinkBlock as LinkBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface LinkBlockProps {
  block: LinkBlockType
  context?: BlockContext
}

export default function LinkBlock({ block, context = 'content' }: LinkBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const className = `block block-link ${animationClasses} ${responsiveClasses}`.trim()

  return (
    <div className={className} style={spacingStyles}>
      <a
        href={block.url}
        target={block.target || '_blank'}
        rel={block.rel || 'noopener noreferrer'}
        className="block-link__anchor"
      >
        {block.label}
      </a>
    </div>
  )
}

