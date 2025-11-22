/**
 * Spacer Block Component
 * Renders spacing
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { SpacerBlock as SpacerBlockType, BlockContext } from '../../types/blocks'
import { getResponsiveClasses } from '../../utils/animationManager'

interface SpacerBlockProps {
  block: SpacerBlockType
  context?: BlockContext
}

/**
 * Spacer Block
 * Renders spacing
 */
export default function SpacerBlock({ block, context = 'content' }: SpacerBlockProps) {
  const responsiveClasses = getResponsiveClasses(block.responsive)

  let height: string | number = block.height
  if (typeof height === 'string') {
    if (height === 'small') height = '1rem'
    else if (height === 'medium') height = '2rem'
    else if (height === 'large') height = '4rem'
  } else if (typeof height === 'number') {
    height = `${height}px`
  }

  const className = `block block-spacer ${responsiveClasses}`.trim()

  return (
    <div className={className} style={{ height }} />
  )
}

