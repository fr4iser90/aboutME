/**
 * Draggable Block Component
 * Makes any block draggable for moving between slots
 * 
 * Created: 2025-01-XX
 */

'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Block } from '@/features/portfolio/types/blocks'
import BlockRenderer from '@/features/portfolio/components/blocks/BlockRenderer'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

interface DraggableBlockProps {
  block: Block
  slot: string  // 'sidebar' | 'content' | etc.
  index: number
  isEditMode: boolean
  context?: 'sidebar' | 'content' | 'column1' | 'column2' | 'hero' | 'left' | 'right' | 'carousel'
  githubUrl?: string
  projectName?: string
  markdownSections?: MarkdownSection[]
  onSectionsReorder?: (newOrder: MarkdownSection[]) => void
}

/**
 * Draggable Block
 * Wraps BlockRenderer with drag functionality
 */
export default function DraggableBlock({
  block,
  slot,
  index,
  isEditMode,
  context = 'content',
  githubUrl,
  projectName,
  markdownSections,
  onSectionsReorder
}: DraggableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useDraggable({
    id: `block-${block.id}`,
    data: {
      block,
      blockType: block.type,
      slot,
      index
    },
    disabled: !isEditMode
  })

  const style_transform = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  // If not in edit mode, just render normally
  if (!isEditMode) {
    return (
      <BlockRenderer
        block={block}
        context={context}
        githubUrl={githubUrl}
        projectName={projectName}
        markdownSections={markdownSections}
        isEditMode={isEditMode}
        onSectionsReorder={onSectionsReorder}
      />
    )
  }

  // In edit mode, make draggable
  return (
    <div
      ref={setNodeRef}
      style={style_transform}
      {...attributes}
      {...listeners}
      className={`draggable-block ${
        isDragging ? 'draggable-block--dragging' : ''
      } ${
        isEditMode ? 'draggable-block--editable' : ''
      }`}
    >
      <BlockRenderer
        block={block}
        context={context}
        githubUrl={githubUrl}
        projectName={projectName}
        markdownSections={markdownSections}
        isEditMode={isEditMode}
        onSectionsReorder={onSectionsReorder}
      />
    </div>
  )
}

