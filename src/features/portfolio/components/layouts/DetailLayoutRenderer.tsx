/**
 * Detail Layout Renderer
 * 
 * Renders detail page layouts based on section layout configuration
 * Used for project detail pages, blog post detail pages, etc.
 * Replaces the old PageLayout component (now removed).
 * 
 * Created: 2025-11-21T17:26:56.000Z
 */

'use client'

import React from 'react'
import type { SectionDetailLayoutType } from '@/features/shared/types/sectionLayouts'
import type { DetailPageLayoutConfig, DetailLayoutConfig } from '../../types/layouts'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'
import type { BlockType } from '../../types/blocks'
import SidebarLeftLayout from './SidebarLeftLayout'
import SidebarRightLayout from './SidebarRightLayout'
import FullWidthLayout from './FullWidthLayout'
import TwoColumnLayout from './TwoColumnLayout'
import CenteredLayout from './CenteredLayout'
import MasonryLayout from './MasonryLayout'
import HeroContentLayout from './HeroContentLayout'
import CarouselLayout from './CarouselLayout'
import StickySidebarLayout from './StickySidebarLayout'

interface DetailLayoutRendererProps {
  layout: SectionDetailLayoutType
  content?: React.ReactNode
  sidebar?: React.ReactNode
  // Support for DetailPageLayoutConfig-style props (for backward compatibility)
  config?: DetailPageLayoutConfig | DetailLayoutConfig
  markdownSections?: MarkdownSection[]
  githubUrl?: string
  projectName?: string
  isEditMode?: boolean
  onSectionsReorder?: (newOrder: MarkdownSection[]) => void
  draggingBlockType?: BlockType | null
  isDragging?: boolean
}

/**
 * Detail Layout Renderer
 * 
 * Renders detail pages with different layout structures based on configuration
 * Supports both simple content/sidebar mode and full DetailLayoutConfig-style config mode
 * 
 * @param layout - Layout type from section config
 * @param content - Main content to display (simple mode)
 * @param sidebar - Optional sidebar content (simple mode)
 * @param config - Full DetailLayoutConfig (advanced mode, replaces content/sidebar)
 * @param markdownSections - Markdown sections for block rendering
 * @param githubUrl - GitHub URL for relative link resolution
 * @param projectName - Project name for context
 * @param isEditMode - Whether in edit mode
 * @param onSectionsReorder - Callback for section reordering
 * @param draggingBlockType - Currently dragging block type
 * @param isDragging - Whether currently dragging
 */
export default function DetailLayoutRenderer({ 
  layout, 
  content, 
  sidebar,
  config,
  markdownSections,
  githubUrl,
  projectName,
  isEditMode = false,
  onSectionsReorder,
  draggingBlockType = null,
  isDragging = false
}: DetailLayoutRendererProps) {
  // If config is provided, use DetailPageLayoutConfig-style rendering with blocks/slots
  if (config) {
    const effectiveLayout = layout || (config.template as SectionDetailLayoutType) || 'sidebar-left'
    const commonProps = {
      slots: config.slots,
      markdownSections,
      githubUrl,
      projectName,
      isEditMode,
      onSectionsReorder,
      draggingBlockType,
      isDragging,
    }

    switch (effectiveLayout) {
      case 'sidebar-left':
        return <SidebarLeftLayout {...commonProps} />

      case 'sidebar-right':
        return <SidebarRightLayout {...commonProps} />

      case 'full-width':
        return <FullWidthLayout {...commonProps} />

      case 'two-column':
        return <TwoColumnLayout {...commonProps} />

      case 'centered':
        return <CenteredLayout {...commonProps} />

      case 'masonry':
        return <MasonryLayout {...commonProps} />

      case 'hero-content':
        return <HeroContentLayout {...commonProps} />

      case 'carousel-layout':
        return <CarouselLayout {...commonProps} />

      case 'sticky-sidebar':
        return <StickySidebarLayout {...commonProps} />

      default:
        console.warn(`Unknown layout template: ${effectiveLayout}, falling back to sidebar-left`)
        return <SidebarLeftLayout {...commonProps} />
    }
  }

  // Simple mode: just render content and sidebar
  if (!layout) {
    return (
      <div className="detail-layout detail-layout--default">
        {content}
      </div>
    )
  }

  switch (layout) {
    case 'sidebar-left':
      return (
        <div className="detail-layout detail-layout--sidebar-left">
          {sidebar && (
            <aside className="detail-sidebar">
              {sidebar}
            </aside>
          )}
          <main className="detail-content">
            {content}
          </main>
        </div>
      )

    case 'sidebar-right':
      return (
        <div className="detail-layout detail-layout--sidebar-right">
          <main className="detail-content">
            {content}
          </main>
          {sidebar && (
            <aside className="detail-sidebar">
              {sidebar}
            </aside>
          )}
        </div>
      )

    case 'two-column':
      return (
        <div className="detail-layout detail-layout--two-column">
          <div className="detail-column-1">
            {content}
          </div>
          <div className="detail-column-2">
            {sidebar}
          </div>
        </div>
      )

    case 'masonry':
      return (
        <div className="detail-layout detail-layout--masonry">
          <div className="detail-masonry-grid">
            {content}
          </div>
        </div>
      )

    case 'centered':
      return (
        <div className="detail-layout detail-layout--centered">
          <div className="detail-centered-content">
            {content}
          </div>
        </div>
      )

    case 'full-width':
      return (
        <div className="detail-layout detail-layout--full-width">
          {content}
        </div>
      )

    default:
      return (
        <div className="detail-layout detail-layout--default">
          {content}
        </div>
      )
  }
}

