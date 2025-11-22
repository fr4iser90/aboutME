'use client'

import React from 'react'

interface GridLayoutProps {
  images: string[]
  columns?: number
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto'
}

/**
 * Grid Layout
 * Displays images in a configurable grid (2, 3, or 4 columns)
 */
export default function GridLayout({ 
  images, 
  columns = 3,
  aspectRatio = 'auto'
}: GridLayoutProps) {
  if (!images || images.length === 0) {
    return null
  }

  const gridClass = `grid-layout grid-layout--${columns}col`
  const aspectClass = aspectRatio !== 'auto' ? `aspect-${aspectRatio.replace(':', '-')}` : ''

  return (
    <div className={`project-layout project-layout--grid ${gridClass}`}>
      {images.map((imageUrl, index) => (
        <div key={index} className={`grid-item ${aspectClass}`}>
          <img
            src={imageUrl}
            alt={`Project screenshot ${index + 1}`}
            className="grid-image"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}

