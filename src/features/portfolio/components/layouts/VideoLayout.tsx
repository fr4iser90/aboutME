'use client'

import React from 'react'
import type { VideoConfig } from '../../types'
import { getEmbedUrl, validateVideoConfig } from '../../utils/videoEmbed'

interface VideoLayoutProps {
  video: VideoConfig
}

/**
 * Video Layout
 * Displays video embed (YouTube or Vimeo)
 */
export default function VideoLayout({ video }: VideoLayoutProps) {
  if (!video || !validateVideoConfig(video)) {
    return null
  }

  const embedUrl = getEmbedUrl(video)
  if (!embedUrl) {
    return null
  }

  return (
    <div className="project-layout project-layout--video">
      <div className="video-container">
        <div className="video-wrapper">
          <iframe
            src={embedUrl}
            className="video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${video.type} video embed`}
          />
        </div>
      </div>
    </div>
  )
}

