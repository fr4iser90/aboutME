'use client'

import React from 'react'
import type { VideoConfig, ProjectLayoutConfig } from '../../types'
import VideoLayout from './VideoLayout'
import GridLayout from './GridLayout'
import GalleryLayout from './GalleryLayout'
import SingleImageLayout from './SingleImageLayout'

interface MixedLayoutProps {
  images: string[]
  video: VideoConfig
  layout?: ProjectLayoutConfig
  videoFirst?: boolean
}

/**
 * Mixed Layout
 * Displays video and images together
 * Supports configurable order (video first or images first)
 */
export default function MixedLayout({ 
  images, 
  video, 
  layout,
  videoFirst = true 
}: MixedLayoutProps) {
  const hasImages = images && images.length > 0
  const hasVideo = !!video

  if (!hasImages && !hasVideo) {
    return null
  }

  // Determine image layout based on count
  const imageCount = images?.length || 0
  const imageLayout = imageCount === 1 ? 'single' : imageCount <= 4 ? 'grid' : 'gallery'

  return (
    <div className="project-layout project-layout--mixed">
      {videoFirst && hasVideo && (
        <div className="mixed-layout-video">
          <VideoLayout video={video} />
        </div>
      )}

      {hasImages && (
        <div className="mixed-layout-images">
          {imageLayout === 'single' && (
            <SingleImageLayout images={images} />
          )}
          {imageLayout === 'grid' && (
            <GridLayout
              images={images}
              columns={layout?.columns}
              aspectRatio={layout?.aspectRatio}
            />
          )}
          {imageLayout === 'gallery' && (
            <GalleryLayout
              images={images}
              showThumbnails={layout?.showThumbnails}
            />
          )}
        </div>
      )}

      {!videoFirst && hasVideo && (
        <div className="mixed-layout-video">
          <VideoLayout video={video} />
        </div>
      )}
    </div>
  )
}

