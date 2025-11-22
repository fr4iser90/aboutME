'use client'

import React from 'react'
import type { HeadingBlock as HeadingBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface HeadingBlockProps {
  block: HeadingBlockType
  context?: BlockContext
}

export default function HeadingBlock({ block, context = 'content' }: HeadingBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements
  const className = `block block-heading block-heading--h${block.level} ${animationClasses} ${responsiveClasses}`.trim()

  return (
    <HeadingTag
      className={className}
      style={spacingStyles}
    >
      {block.content}
    </HeadingTag>
  )
}

