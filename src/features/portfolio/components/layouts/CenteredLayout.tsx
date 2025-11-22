/**
 * Centered Layout
 * Centered container, no sidebar
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { LayoutSlots } from '../../types/layouts'
import BlockRenderer from '../blocks/BlockRenderer'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

interface CenteredLayoutProps {
  slots: LayoutSlots
  markdownSections?: MarkdownSection[]
  githubUrl?: string
  projectName?: string
}

/**
 * Centered Layout
 * Renders centered content
 */
export default function CenteredLayout({ slots, markdownSections, githubUrl, projectName }: CenteredLayoutProps) {
  return (
    <div className="project-modal-layout project-modal-layout--centered">
      <main className="project-content project-content--centered">
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

