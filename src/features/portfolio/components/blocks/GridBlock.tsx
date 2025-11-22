/**
 * Grid Block Component
 * Renders nested blocks in a grid layout
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { GridBlock as GridBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'
import BlockRenderer from './BlockRenderer'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

interface GridBlockProps {
  block: GridBlockType
  context?: BlockContext
  githubUrl?: string
  projectName?: string
  markdownSections?: MarkdownSection[]
}

/**
 * Grid Block
 * Renders nested blocks in a grid
 */
export default function GridBlock({ block, context = 'content', githubUrl, projectName, markdownSections }: GridBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const className = `block block-grid block-grid--${block.columns}col ${animationClasses} ${responsiveClasses}`.trim()

  return (
    <div className={className} style={spacingStyles}>
      <div className="grid-block-container" style={{ display: 'grid', gridTemplateColumns: `repeat(${block.columns}, 1fr)`, gap: '1rem' }}>
        {block.items.map((item) => (
          <BlockRenderer
            key={item.id}
            block={item}
            context={context}
            githubUrl={githubUrl}
            projectName={projectName}
            markdownSections={markdownSections}
          />
        ))}
      </div>
    </div>
  )
}

