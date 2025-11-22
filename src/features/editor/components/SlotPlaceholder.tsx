/**
 * Slot Placeholder Component
 * Shows placeholder where blocks can be dropped
 * 
 * Created: 2025-01-XX
 */

'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { BlockType } from '@/features/portfolio/types/blocks'

interface SlotPlaceholderProps {
  slot: string  // 'sidebar' | 'content' | etc.
  position: 'top' | 'between' | 'bottom' | number
  blockType?: BlockType  // Welcher Block-Typ wird gerade gezogen?
  isEditMode: boolean
  isDragging: boolean
  onDrop?: (blockId: string, position: number) => void
}

/**
 * Get placeholder text based on block type
 */
function getPlaceholderContent(blockType?: BlockType): string {
  if (!blockType) return '📦 Drop Block Here'
  
  switch (blockType) {
    case 'screenshot':
      return '📷 Drop Image Here'
    case 'video':
      return '🎥 Drop Video Here'
    case 'text':
      return '📝 Drop Text Here'
    case 'markdown':
      return '📄 Drop Markdown Here'
    case 'section':
      return '📑 Drop Section Here'
    case 'code':
      return '💻 Drop Code Here'
    case 'quote':
      return '💬 Drop Quote Here'
    case 'callout':
      return '💡 Drop Callout Here'
    case 'stats':
      return '📊 Drop Stats Here'
    case 'separator':
      return '➖ Drop Separator Here'
    case 'spacer':
      return '⬜ Drop Spacer Here'
    case 'embed':
      return '🔗 Drop Embed Here'
    case 'table':
      return '📋 Drop Table Here'
    case 'list':
      return '📝 Drop List Here'
    case 'grid':
      return '🔲 Drop Grid Here'
    case 'navigation':
      return '🧭 Drop Navigation Here'
    default:
      return '📦 Drop Block Here'
  }
}

/**
 * Slot Placeholder
 * Shows where blocks can be dropped in edit mode
 */
export default function SlotPlaceholder({
  slot,
  position,
  blockType,
  isEditMode,
  isDragging,
  onDrop
}: SlotPlaceholderProps) {
  // Create unique ID for placeholder
  const positionStr = typeof position === 'number' ? String(position) : position
  const placeholderId = `placeholder-${slot}-${positionStr}`
  
  const { setNodeRef, isOver } = useDroppable({
    id: placeholderId,
    disabled: !isEditMode || !isDragging
  })

  // Don't show if not in edit mode or not dragging
  if (!isEditMode || !isDragging) {
    return null
  }

  const placeholderText = getPlaceholderContent(blockType)
  const positionClass = typeof position === 'number' ? 'between' : position

  return (
    <div
      ref={setNodeRef}
      className={`slot-placeholder slot-placeholder--${positionClass} ${
        isDragging ? 'slot-placeholder--dragging' : ''
      } ${
        isOver ? 'slot-placeholder--over' : ''
      }`}
    >
      <div className="slot-placeholder__content">
        <span className="slot-placeholder__icon">
          {blockType === 'screenshot' ? '📷' :
           blockType === 'video' ? '🎥' :
           blockType === 'text' ? '📝' :
           blockType === 'code' ? '💻' :
           '📦'}
        </span>
        <span className="slot-placeholder__text">{placeholderText}</span>
      </div>
    </div>
  )
}

