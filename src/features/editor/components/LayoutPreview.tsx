'use client'

import { useState, useEffect } from 'react'
import type { ProjectLayoutConfig } from '@/features/portfolio/types'

interface LayoutPreviewProps {
  layout?: ProjectLayoutConfig
  screenshots?: string[]
}

export default function LayoutPreview({ layout, screenshots = [] }: LayoutPreviewProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([])

  useEffect(() => {
    // Filter out empty/invalid screenshots
    setPreviewImages(screenshots.filter(url => url && url.trim() !== ''))
  }, [screenshots])

  if (previewImages.length === 0) {
    return (
      <div className="layout-preview layout-preview--empty">
        <div className="layout-preview__empty-text">
          📷 No screenshots yet. Upload screenshots to see preview.
        </div>
      </div>
    )
  }

  const layoutType = layout?.type || 'grid'
  const columns = layout?.columns || 3
  const aspectRatio = layout?.aspectRatio || 'auto'

  // Get aspect ratio style
  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '16:9':
        return { aspectRatio: '16/9' }
      case '4:3':
        return { aspectRatio: '4/3' }
      case '1:1':
        return { aspectRatio: '1/1' }
      default:
        return {}
    }
  }

  const renderSingle = () => (
    <div className="layout-preview layout-preview--single">
      {previewImages[0] && (
        <div className="layout-preview__item" style={getAspectRatioStyle()}>
          <img src={previewImages[0]} alt="Preview" />
        </div>
      )}
    </div>
  )

  const renderGrid = () => (
    <div 
      className="layout-preview layout-preview--grid"
      style={{ 
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '0.5rem'
      }}
    >
      {previewImages.slice(0, columns * 2).map((url, index) => (
        <div key={index} className="layout-preview__item" style={getAspectRatioStyle()}>
          <img src={url} alt={`Preview ${index + 1}`} />
        </div>
      ))}
    </div>
  )

  const renderGallery = () => (
    <div className="layout-preview layout-preview--gallery">
      {previewImages.map((url, index) => (
        <div key={index} className="layout-preview__item" style={getAspectRatioStyle()}>
          <img src={url} alt={`Preview ${index + 1}`} />
        </div>
      ))}
    </div>
  )

  const renderCarousel = () => (
    <div className="layout-preview layout-preview--carousel">
      <div className="layout-preview__carousel-track">
        {previewImages.map((url, index) => (
          <div key={index} className="layout-preview__item" style={getAspectRatioStyle()}>
            <img src={url} alt={`Preview ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  )

  const renderPreview = () => {
    switch (layoutType) {
      case 'single':
        return renderSingle()
      case 'grid':
        return renderGrid()
      case 'gallery':
        return renderGallery()
      case 'carousel':
        return renderCarousel()
      case 'mixed':
      case 'video':
        return (
          <div className="layout-preview layout-preview--mixed">
            {previewImages.slice(0, 3).map((url, index) => (
              <div key={index} className="layout-preview__item" style={getAspectRatioStyle()}>
                <img src={url} alt={`Preview ${index + 1}`} />
              </div>
            ))}
            <div className="layout-preview__info">
              Mixed layout with {previewImages.length} screenshots
            </div>
          </div>
        )
      default:
        return renderGrid()
    }
  }

  return (
    <div className="layout-preview">
      <div className="layout-preview__header">
        <span className="layout-preview__title">Layout Preview</span>
        <span className="layout-preview__type">{layoutType}</span>
      </div>
      {renderPreview()}
      <div className="layout-preview__footer">
        {previewImages.length} screenshot{previewImages.length !== 1 ? 's' : ''}
        {columns && layoutType === 'grid' && ` • ${columns} columns`}
      </div>
    </div>
  )
}

