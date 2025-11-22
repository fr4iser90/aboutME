/**
 * Block Editor Component
 * Wraps DetailLayoutRenderer with DndContext for block drag & drop
 * 
 * Created: 2025-01-XX
 */

'use client'

import React, { useState } from 'react'
import { DndContext, DragStartEvent, DragEndEvent, DragOverEvent, closestCenter } from '@dnd-kit/core'
import type { DetailPageLayoutConfig, DetailLayoutConfig } from '@/features/portfolio/types/layouts'
import type { BlockType } from '@/features/portfolio/types/blocks'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'
import DetailLayoutRenderer from '@/features/portfolio/components/layouts/DetailLayoutRenderer'

interface BlockEditorProps {
  config: DetailPageLayoutConfig | DetailLayoutConfig
  markdownSections?: MarkdownSection[]
  githubUrl?: string
  projectName?: string
  isEditMode: boolean
  onSectionsReorder?: (newOrder: MarkdownSection[]) => void
  onBlockMove?: (blockId: string, fromSlot: string, toSlot: string, newIndex: number) => void
}

/**
 * Find block by ID in config
 */
function findBlockById(config: DetailPageLayoutConfig | DetailLayoutConfig, blockId: string) {
  const allSlots = [
    config.slots.sidebar,
    config.slots.content,
    config.slots.column1,
    config.slots.column2,
    config.slots.hero,
    config.slots.left,
    config.slots.right,
    config.slots.carousel
  ].filter(Boolean) as any[][]

  for (const slot of allSlots) {
    const block = slot.find(b => b.id === blockId || `block-${b.id}` === blockId)
    if (block) return block
  }
  return null
}

/**
 * Block Editor
 * Provides drag & drop context for all blocks
 */
export default function BlockEditor({
  config,
  markdownSections,
  githubUrl,
  projectName,
  isEditMode,
  onSectionsReorder,
  onBlockMove
}: BlockEditorProps) {
  const [draggingBlockType, setDraggingBlockType] = useState<BlockType | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDragStart(event: DragStartEvent) {
    const blockId = event.active.id as string
    
    // Check if it's a block (starts with "block-")
    if (blockId.startsWith('block-')) {
      const actualBlockId = blockId.replace('block-', '')
      const block = findBlockById(config, actualBlockId)
      if (block) {
        setDraggingBlockType(block.type)
        setIsDragging(true)
      }
    }
    // Navigation items are handled by SidebarDragEditor
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    // Reset dragging state
    setDraggingBlockType(null)
    setIsDragging(false)

    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if it's a block move (not navigation item)
    if (activeId.startsWith('block-') && overId.startsWith('placeholder-')) {
      // Extract info from placeholder ID: "placeholder-{slot}-{position}"
      // Position can be "top", "bottom", or a number
      const withoutPrefix = overId.replace('placeholder-', '')
      const parts = withoutPrefix.split('-')
      const targetSlot = parts[0] // "sidebar", "content", etc.
      const positionStr = parts.slice(1).join('-') // "top", "bottom", or number
      
      // Extract block info from active
      const actualBlockId = activeId.replace('block-', '')
      const block = findBlockById(config, actualBlockId)
      if (!block) return

      // Find source slot
      let sourceSlot: string | null = null
      if (config.slots.sidebar?.some(b => b.id === actualBlockId)) sourceSlot = 'sidebar'
      else if (config.slots.content?.some(b => b.id === actualBlockId)) sourceSlot = 'content'
      else if (config.slots.column1?.some(b => b.id === actualBlockId)) sourceSlot = 'column1'
      else if (config.slots.column2?.some(b => b.id === actualBlockId)) sourceSlot = 'column2'
      else if (config.slots.hero?.some(b => b.id === actualBlockId)) sourceSlot = 'hero'
      else if (config.slots.left?.some(b => b.id === actualBlockId)) sourceSlot = 'left'
      else if (config.slots.right?.some(b => b.id === actualBlockId)) sourceSlot = 'right'
      else if (config.slots.carousel?.some(b => b.id === actualBlockId)) sourceSlot = 'carousel'

      if (sourceSlot && onBlockMove) {
        // Calculate new index
        let newIndex = 0
        if (positionStr === 'top') {
          newIndex = 0
        } else if (positionStr === 'bottom') {
          newIndex = -1 // -1 means append to end
        } else {
          // Try to parse as number
          const numIndex = parseInt(positionStr, 10)
          newIndex = isNaN(numIndex) ? 0 : numIndex
        }
        
        onBlockMove(actualBlockId, sourceSlot, targetSlot, newIndex)
      }
    }
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <DetailLayoutRenderer
        layout={config.template as any}
        config={config}
        markdownSections={markdownSections}
        githubUrl={githubUrl}
        projectName={projectName}
        isEditMode={isEditMode}
        onSectionsReorder={onSectionsReorder}
        draggingBlockType={draggingBlockType}
        isDragging={isDragging}
      />
    </DndContext>
  )
}

