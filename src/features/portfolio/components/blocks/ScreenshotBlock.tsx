/**
 * Screenshot Block Component
 * Renders screenshots in different layouts (single, grid, gallery)
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { ScreenshotBlock as ScreenshotBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'
import SingleImageLayout from '../layouts/SingleImageLayout'
import GridLayout from '../layouts/GridLayout'
import GalleryLayout from '../layouts/GalleryLayout'

interface ScreenshotBlockProps {
  block: ScreenshotBlockType
  context?: BlockContext
}

/**
 * Screenshot Block
 * Renders screenshots using existing layout components
 */
export default function ScreenshotBlock({ block, context = 'content' }: ScreenshotBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const className = `block block-screenshot block-screenshot--${block.layout} ${animationClasses} ${responsiveClasses}`.trim()

  if (block.images.length === 0) {
    return null
  }

  let content: React.ReactNode = null

  if (block.layout === 'single') {
    content = <SingleImageLayout images={block.images} />
  } else if (block.layout === 'grid') {
    content = <GridLayout images={block.images} columns={block.columns || 2} />
  } else {
    // gallery
    content = <GalleryLayout images={block.images} />
  }

  return (
    <div className={className} style={spacingStyles}>
      {content}
    </div>
  )
}

