/**
 * Video Block Component
 * Renders video embeds (YouTube, Vimeo)
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { VideoBlock as VideoBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'
import VideoLayout from '../layouts/VideoLayout'
import type { VideoConfig } from '../../types'

interface VideoBlockProps {
  block: VideoBlockType
  context?: BlockContext
}

/**
 * Video Block
 * Renders video using existing VideoLayout component
 */
export default function VideoBlock({ block, context = 'content' }: VideoBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const className = `block block-video block-video--${block.source} ${animationClasses} ${responsiveClasses}`.trim()

  const videoConfig: VideoConfig = {
    type: block.source,
    id: block.videoId,
  }

  return (
    <div className={className} style={spacingStyles}>
      <VideoLayout video={videoConfig} />
    </div>
  )
}

