/**
 * Masonry Layout
 * Pinterest-style masonry grid
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { LayoutSlots } from '../../types/layouts'
import BlockRenderer from '../blocks/BlockRenderer'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

interface MasonryLayoutProps {
  slots: LayoutSlots
  markdownSections?: MarkdownSection[]
  githubUrl?: string
  projectName?: string
}

/**
 * Masonry Layout
 * Renders masonry-style grid
 */
export default function MasonryLayout({ slots, markdownSections, githubUrl, projectName }: MasonryLayoutProps) {
  return (
    <div className="project-modal-layout project-modal-layout--masonry">
      {slots.content?.map((block) => (
        <div key={block.id} className="project-content--masonry-item">
          <BlockRenderer
            block={block}
            context="content"
            githubUrl={githubUrl}
            projectName={projectName}
            markdownSections={markdownSections}
          />
        </div>
      ))}
    </div>
  )
}

