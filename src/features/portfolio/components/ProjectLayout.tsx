'use client'

import React, { useState, useEffect } from 'react'
import type { Project } from '../types'
import { getLayoutConfig } from '../utils/layoutDetector'
import SingleImageLayout from './layouts/SingleImageLayout'
import GridLayout from './layouts/GridLayout'
import GalleryLayout from './layouts/GalleryLayout'
import VideoLayout from './layouts/VideoLayout'
import MixedLayout from './layouts/MixedLayout'
import MediaLayoutRenderer from './layouts/MediaLayoutRenderer'
import { getAllSectionLayouts, type SectionLayoutsConfig } from '@/features/shared/utils/layoutConfig'

interface ProjectLayoutProps {
  project: Project
  layout?: Project['layout']
  sectionLayouts?: SectionLayoutsConfig
}

/**
 * Project Layout Component
 * Main wrapper that selects and renders the appropriate layout
 * Now uses section layout config for media layouts
 */
export default function ProjectLayout({ project, layout, sectionLayouts: providedSectionLayouts }: ProjectLayoutProps) {
  const [sectionLayouts, setSectionLayouts] = useState<SectionLayoutsConfig | undefined>(providedSectionLayouts)

  useEffect(() => {
    if (!providedSectionLayouts) {
      getAllSectionLayouts().then(setSectionLayouts).catch(console.error)
    }
  }, [providedSectionLayouts])

  const layoutConfig = getLayoutConfig({
    ...project,
    layout: layout || project.layout,
  })

  // Use section layout config if available, otherwise fall back to project.layout
  const mediaLayout = sectionLayouts?.projects?.mediaLayout || layoutConfig.type || 'single'
  const mediaColumns = sectionLayouts?.projects?.mediaColumns || layoutConfig.columns || 2
  const images = project.screenshots || []

  // Don't render if no content
  if (images.length === 0 && !project.video) {
    return null
  }

  // Use MediaLayoutRenderer if section layouts are available
  if (sectionLayouts?.projects?.mediaLayout) {
    return (
      <MediaLayoutRenderer
        layout={mediaLayout}
        images={images}
        video={project.video}
        alt={project.name}
        columns={mediaColumns}
      />
    )
  }

  // Fallback to old switch-based rendering for backward compatibility
  const layoutType = layoutConfig.type || 'single'
  switch (layoutType) {
    case 'single':
      return <SingleImageLayout images={images} alt={project.name} />

    case 'grid':
      return (
        <GridLayout
          images={images}
          columns={layoutConfig.columns}
          aspectRatio={layoutConfig.aspectRatio}
        />
      )

    case 'gallery':
      return (
        <GalleryLayout
          images={images}
          showThumbnails={layoutConfig.showThumbnails}
        />
      )

    case 'carousel':
      // Carousel will be implemented later if needed
      // For now, fall back to gallery
      return (
        <GalleryLayout
          images={images}
          showThumbnails={layoutConfig.showThumbnails}
        />
      )

    case 'video':
      if (project.video) {
        return <VideoLayout video={project.video} />
      }
      return null

    case 'mixed':
      if (project.video && images.length > 0) {
        return (
          <MixedLayout
            images={images}
            video={project.video}
            layout={layoutConfig}
            videoFirst={true}
          />
        )
      }
      // Fallback: show video or images separately
      if (project.video) {
        return <VideoLayout video={project.video} />
      }
      if (images.length > 0) {
        return (
          <GridLayout
            images={images}
            columns={layoutConfig.columns}
            aspectRatio={layoutConfig.aspectRatio}
          />
        )
      }
      return null

    default:
      // Fallback to single image
      if (images.length > 0) {
        return <SingleImageLayout images={images} alt={project.name} />
      }
      return null
  }
}

