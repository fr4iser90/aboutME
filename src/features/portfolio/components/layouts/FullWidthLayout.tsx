/**
 * Full Width Layout
 * Full width container, no sidebar
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { LayoutSlots } from '../../types/layouts'
import BlockRenderer from '../blocks/BlockRenderer'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

interface FullWidthLayoutProps {
  slots: LayoutSlots
  markdownSections?: MarkdownSection[]
  githubUrl?: string
  projectName?: string
}

/**
 * Full Width Layout
 * Renders full width content
 */
export default function FullWidthLayout({ slots, markdownSections, githubUrl, projectName }: FullWidthLayoutProps) {
  return (
    <div className="project-modal-layout project-modal-layout--full-width">
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

