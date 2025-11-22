/**
 * Carousel Layout
 * Carousel slot at top, content below
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { LayoutSlots } from '../../types/layouts'
import BlockRenderer from '../blocks/BlockRenderer'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

interface CarouselLayoutProps {
  slots: LayoutSlots
  markdownSections?: MarkdownSection[]
  githubUrl?: string
  projectName?: string
}

/**
 * Carousel Layout
 * Renders carousel at top, content below
 */
export default function CarouselLayout({ slots, markdownSections, githubUrl, projectName }: CarouselLayoutProps) {
  return (
    <div className="project-modal-layout project-modal-layout--carousel">
      {slots.carousel && slots.carousel.length > 0 && (
        <div className="project-content project-content--carousel">
          {slots.carousel.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              context="carousel"
              githubUrl={githubUrl}
              projectName={projectName}
              markdownSections={markdownSections}
            />
          ))}
        </div>
      )}
      
      <main className="project-content">
        {slots.content?.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            context="content"
            githubUrl={githubUrl}
            projectName={projectName}
            markdownSections={markdownSections}
          />
        ))}
      </main>
    </div>
  )
}

