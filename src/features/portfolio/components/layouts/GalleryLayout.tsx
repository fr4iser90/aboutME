'use client'

import React, { useState } from 'react'

interface GalleryLayoutProps {
  images: string[]
  showThumbnails?: boolean
}

/**
 * Gallery Layout
 * Displays images in a grid with click to expand (basic implementation)
 * Lightbox functionality can be added later
 */
export default function GalleryLayout({ images, showThumbnails = true }: GalleryLayoutProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  if (!images || images.length === 0) {
    return null
  }

  const handleImageClick = (index: number) => {
    setSelectedImage(index)
  }

  const handleClose = () => {
    setSelectedImage(null)
  }

  const handleNext = () => {
    if (selectedImage !== null && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1)
    }
  }

  const handlePrevious = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1)
    }
  }

  return (
    <>
      <div className="project-layout project-layout--gallery">
        <div className="gallery-grid">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={imageUrl}
                alt={`Project screenshot ${index + 1}`}
                className="gallery-image"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Basic lightbox (can be enhanced later) */}
      {selectedImage !== null && (
        <div className="gallery-lightbox" onClick={handleClose}>
          <button
            className="gallery-lightbox-close"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
          {selectedImage > 0 && (
            <button
              className="gallery-lightbox-prev"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              aria-label="Previous"
            >
              ‹
            </button>
          )}
          <img
            src={images[selectedImage]}
            alt={`Project screenshot ${selectedImage + 1}`}
            className="gallery-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedImage < images.length - 1 && (
            <button
              className="gallery-lightbox-next"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              aria-label="Next"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  )
}

