/**
 * Media Layout Renderer
 * 
 * Renders media content (screenshots, images, videos) based on section layout configuration
 * Reusable for projects, blog posts, and other sections with media content
 * 
 * Created: 2025-11-21T17:26:56.000Z
 */

'use client'

import React from 'react'
import type { SectionMediaLayoutType } from '@/features/shared/types/sectionLayouts'
import SingleImageLayout from './SingleImageLayout'
import GridLayout from './GridLayout'
import GalleryLayout from './GalleryLayout'
import CarouselLayout from './CarouselLayout'
import VideoLayout from './VideoLayout'
import MixedLayout from './MixedLayout'

interface VideoConfig {
  type: 'youtube' | 'vimeo'
  id: string
}

interface MediaLayoutRendererProps {
  layout: SectionMediaLayoutType
  images: string[]
  video?: VideoConfig
  alt?: string
  columns?: number
}

/**
 * Media Layout Renderer
 * 
 * Renders media content with different layout structures based on configuration
 * 
 * @param layout - Media layout type from section config
 * @param images - Array of image URLs
 * @param video - Optional video configuration
 * @param alt - Alt text for images
 * @param columns - Number of columns for grid layouts
 */
export default function MediaLayoutRenderer({ 
  layout, 
  images, 
  video,
  alt = '',
  columns = 2
}: MediaLayoutRendererProps) {
  if (!layout) {
    return images.length > 0 ? (
      <SingleImageLayout images={images} alt={alt} />
    ) : null
  }

  switch (layout) {
    case 'single':
      return images.length > 0 ? (
        <SingleImageLayout images={images} alt={alt} />
      ) : null

    case 'grid':
      return images.length > 0 ? (
        <GridLayout 
          images={images} 
          alt={alt}
          columns={columns}
        />
      ) : null

    case 'gallery':
      return images.length > 0 ? (
        <GalleryLayout 
          images={images} 
          alt={alt}
        />
      ) : null

    case 'carousel':
      return images.length > 0 ? (
        <CarouselLayout 
          images={images} 
          alt={alt}
        />
      ) : null

    case 'video':
      return video ? (
        <VideoLayout video={video} />
      ) : null

    case 'mixed':
      return (video || images.length > 0) ? (
        <MixedLayout 
          images={images} 
          video={video}
          layout={{
            type: 'mixed',
            columns: columns
          }}
        />
      ) : null

    default:
      return images.length > 0 ? (
        <SingleImageLayout images={images} alt={alt} />
      ) : null
  }
}

