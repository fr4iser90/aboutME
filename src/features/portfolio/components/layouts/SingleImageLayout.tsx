'use client'

import React from 'react'

interface SingleImageLayoutProps {
  images: string[]
  alt?: string
}

/**
 * Single Image Layout
 * Displays one image large
 */
export default function SingleImageLayout({ images, alt = 'Project screenshot' }: SingleImageLayoutProps) {
  if (!images || images.length === 0) {
    return null
  }

  const imageUrl = images[0]

  return (
    <div className="project-layout project-layout--single">
      <div className="single-image-container">
        <img
          src={imageUrl}
          alt={alt}
          className="single-image"
          loading="lazy"
        />
      </div>
    </div>
  )
}

