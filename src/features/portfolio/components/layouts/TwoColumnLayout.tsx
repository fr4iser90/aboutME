/**
 * Two Column Layout
 * Two equal columns
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { LayoutSlots } from '../../types/layouts'
import BlockRenderer from '../blocks/BlockRenderer'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

interface TwoColumnLayoutProps {
  slots: LayoutSlots
  markdownSections?: MarkdownSection[]
  githubUrl?: string
  projectName?: string
}

/**
 * Two Column Layout
 * Renders two equal columns
 */
export default function TwoColumnLayout({ slots, markdownSections, githubUrl, projectName }: TwoColumnLayoutProps) {
  // Split content blocks into two columns if column1/column2 not explicitly set
  const contentBlocks = slots.content || []
  const column1Blocks = slots.column1 || contentBlocks.slice(0, Math.ceil(contentBlocks.length / 2))
  const column2Blocks = slots.column2 || contentBlocks.slice(Math.ceil(contentBlocks.length / 2))
  
  return (
    <div className="project-modal-layout project-modal-layout--two-column">
      <div className="project-content project-content--column1">
        {column1Blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            context="column1"
            githubUrl={githubUrl}
            projectName={projectName}
            markdownSections={markdownSections}
          />
        ))}
      </div>
      
      <div className="project-content project-content--column2">
        {column2Blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            context="column2"
            githubUrl={githubUrl}
            projectName={projectName}
            markdownSections={markdownSections}
          />
        ))}
      </div>
    </div>
  )
}

