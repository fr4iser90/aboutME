/**
 * Embed Block Component
 * Renders external embeds (CodePen, JSFiddle, CodeSandbox, iframe)
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { EmbedBlock as EmbedBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface EmbedBlockProps {
  block: EmbedBlockType
  context?: BlockContext
}

/**
 * Embed Block
 * Renders external embeds
 */
export default function EmbedBlock({ block, context = 'content' }: EmbedBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const className = `block block-embed block-embed--${block.source} ${animationClasses} ${responsiveClasses}`.trim()

  let embedUrl = ''
  if (block.source === 'codepen' && block.embedId) {
    embedUrl = `https://codepen.io/embed/${block.embedId}`
  } else if (block.source === 'jsfiddle' && block.embedId) {
    embedUrl = `https://jsfiddle.net/${block.embedId}/embedded/`
  } else if (block.source === 'codesandbox' && block.embedId) {
    embedUrl = `https://codesandbox.io/embed/${block.embedId}`
  } else if (block.source === 'iframe' && block.url) {
    embedUrl = block.url
  }

  if (!embedUrl) {
    return null
  }

  return (
    <div className={className} style={spacingStyles}>
      <div className="embed-block">
        <iframe
          src={embedUrl}
          height={block.height || 400}
          style={{ width: '100%', border: 'none' }}
          allowFullScreen
          title={`${block.source} embed`}
        />
      </div>
    </div>
  )
}

