'use client'

import React from 'react'
import type { ImageBlock as ImageBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface ImageBlockProps {
  block: ImageBlockType
  context?: BlockContext
}

export default function ImageBlock({ block, context = 'content' }: ImageBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const className = `block block-image ${animationClasses} ${responsiveClasses}`.trim()

  const imageStyle: React.CSSProperties = {
    ...(block.width && { width: typeof block.width === 'number' ? `${block.width}px` : block.width }),
    ...(block.height && { height: typeof block.height === 'number' ? `${block.height}px` : block.height })
  }

  return (
    <figure className={className} style={spacingStyles}>
      <img
        src={block.imageUrl}
        alt={block.alt}
        className="block-image__img"
        style={imageStyle}
      />
      {block.caption && (
        <figcaption className="block-image__caption">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

