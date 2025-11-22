'use client'

import { useState } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DetailPageLayoutConfig, DetailLayoutConfig, LayoutSlots } from '@/features/portfolio/types/layouts'
import type { Block, BlockType } from '@/features/portfolio/types/blocks'
import BlockEditor from '@/features/editor/components/BlockEditor'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'
import { getBlockDisplayName } from '@/features/admin/utils/blockDisplayName'
import BlockSearch from './BlockSearch'
import QuickActionsMenu from './QuickActionsMenu'

interface SortableBlockItemProps {
  block: Block
  index: number
  blockTypes: Array<{ type: BlockType; label: string; icon: string }>
  selectedSlot: string
  slotLabel: string
  markdownSections?: MarkdownSection[]
  selectedBlock: Block | null
  onSelectBlock: (block: Block | null) => void
  onRemoveBlock: (blockId: string) => void
  onDuplicate: (block: Block) => void
  onMoveToSlot: (blockId: string, targetSlot: keyof LayoutSlots) => void
  availableSlots: Array<{ key: keyof LayoutSlots; label: string }>
  isExpanded: boolean
  onToggleExpand: (blockId: string) => void
}

function SortableBlockItem({
  block,
  index,
  blockTypes,
  selectedSlot,
  slotLabel,
  markdownSections,
  selectedBlock,
  onSelectBlock,
  onRemoveBlock,
  onDuplicate,
  onMoveToSlot,
  availableSlots,
  isExpanded,
  onToggleExpand
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const blockIcon = blockTypes.find(bt => bt.type === block.type)?.icon || '📦'
  const displayName = getBlockDisplayName(block, markdownSections)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`block-configurator__block-item ${isDragging ? 'block-configurator__block-item--dragging' : ''}`}
      data-type={block.type}
    >
      <div className="block-configurator__block-header">
        <button
          onClick={() => onToggleExpand(block.id)}
          className="block-configurator__collapse-btn"
          title={isExpanded ? 'Collapse' : 'Expand'}
          aria-label={isExpanded ? 'Collapse block' : 'Expand block'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        <span className="block-configurator__block-position">{index + 1}.</span>
        <div
          {...attributes}
          {...listeners}
          className="block-configurator__drag-handle"
          title="Drag to reorder"
        >
          ⋮⋮
        </div>
        <span className="block-configurator__block-icon">{blockIcon}</span>
        <span className="block-configurator__block-type">{displayName}</span>
        <span className="block-configurator__slot-badge">{slotLabel}</span>
        <QuickActionsMenu
          block={block}
          onDuplicate={onDuplicate}
          onMoveToSlot={onMoveToSlot}
          onDelete={onRemoveBlock}
          availableSlots={availableSlots}
          currentSlot={selectedSlot as keyof LayoutSlots}
        />
      </div>
      {isExpanded && (
        <>
          {selectedBlock?.id === block.id && (
            <div className="block-configurator__block-form">
              {/* Block-specific form fields would go here */}
              <p>Block configuration form for {block.type}</p>
            </div>
          )}
          <button
            onClick={() => onSelectBlock(selectedBlock?.id === block.id ? null : block)}
            className="block-configurator__btn block-configurator__btn--edit"
          >
            {selectedBlock?.id === block.id ? 'Hide' : 'Edit'}
          </button>
        </>
      )}
    </div>
  )
}

interface BlockConfiguratorProps {
  config: DetailPageLayoutConfig | DetailLayoutConfig
  onConfigUpdate: (newConfig: DetailPageLayoutConfig | DetailLayoutConfig) => void
  markdownSections?: MarkdownSection[]
}

export default function BlockConfigurator({
  config,
  onConfigUpdate,
  markdownSections
}: BlockConfiguratorProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>('content')
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set())

  const slotNames: Array<{ key: keyof LayoutSlots; label: string }> = [
    { key: 'sidebar', label: 'Sidebar' },
    { key: 'content', label: 'Content' },
    { key: 'column1', label: 'Column 1' },
    { key: 'column2', label: 'Column 2' },
    { key: 'hero', label: 'Hero' },
    { key: 'left', label: 'Left' },
    { key: 'right', label: 'Right' },
    { key: 'carousel', label: 'Carousel' }
  ]

  const availableSlots = slotNames.filter(slot => {
    // Filter slots based on current template
    const template = config.template
    if (template === 'sidebar-left' || template === 'sidebar-right' || template === 'sticky-sidebar') {
      return slot.key === 'sidebar' || slot.key === 'content'
    }
    if (template === 'full-width' || template === 'centered' || template === 'masonry') {
      return slot.key === 'content'
    }
    if (template === 'two-column') {
      return slot.key === 'column1' || slot.key === 'column2'
    }
    if (template === 'split-screen') {
      return slot.key === 'left' || slot.key === 'right'
    }
    if (template === 'hero-content') {
      return slot.key === 'hero' || slot.key === 'content'
    }
    if (template === 'carousel-layout') {
      return slot.key === 'carousel'
    }
    return true
  })

  const currentSlot = config.slots[selectedSlot as keyof LayoutSlots] || []

  // Filter blocks based on search and type filter
  const filteredBlocks = currentSlot.filter((block) => {
    // Search filter
    if (searchQuery) {
      const title = getBlockDisplayName(block, markdownSections).toLowerCase()
      const id = block.id.toLowerCase()
      const query = searchQuery.toLowerCase()
      if (!title.includes(query) && !id.includes(query)) {
        return false
      }
    }

    // Type filter
    if (typeFilter !== 'all' && block.type !== typeFilter) {
      return false
    }

    return true
  })

  const handleAddBlock = (blockType: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: blockType,
      ...(blockType === 'screenshot' ? { layout: 'single', images: [] } : {}),
      ...(blockType === 'video' ? { source: 'youtube', videoId: '' } : {}),
      ...(blockType === 'text' ? { content: '' } : {}),
      ...(blockType === 'markdown' ? { content: '' } : {}),
      ...(blockType === 'code' ? { language: 'javascript', code: '' } : {}),
      ...(blockType === 'quote' ? { text: '' } : {}),
      ...(blockType === 'callout' ? { variant: 'info', content: '' } : {}),
      ...(blockType === 'stats' ? { items: [] } : {}),
      ...(blockType === 'separator' ? { style: 'line' } : {}),
      ...(blockType === 'spacer' ? { height: 'medium' } : {}),
      ...(blockType === 'embed' ? { source: 'iframe', url: '' } : {}),
      ...(blockType === 'table' ? { headers: [], rows: [] } : {}),
      ...(blockType === 'list' ? { style: 'bullet', items: [] } : {})
    } as Block

    const newConfig: DetailLayoutConfig = {
      ...config,
      slots: {
        ...config.slots,
        [selectedSlot]: [...currentSlot, newBlock]
      }
    }
    onConfigUpdate(newConfig)
    setShowAddBlock(false)
    // Auto-expand new block
    setExpandedBlocks(prev => new Set([...prev, newBlock.id]))
  }

  const handleRemoveBlock = (blockId: string) => {
    const newConfig: DetailLayoutConfig = {
      ...config,
      slots: {
        ...config.slots,
        [selectedSlot]: currentSlot.filter(b => b.id !== blockId)
      }
    }
    onConfigUpdate(newConfig)
    setSelectedBlock(null)
  }

  const handleBlockUpdate = (blockId: string, updates: Partial<Block>) => {
    const newConfig: DetailLayoutConfig = {
      ...config,
      slots: {
        ...config.slots,
        [selectedSlot]: currentSlot.map(b => 
          b.id === blockId ? { ...b, ...updates } : b
        )
      }
    }
    onConfigUpdate(newConfig)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    // Use filteredBlocks to find indices, but update currentSlot
    const oldIndex = currentSlot.findIndex(b => b.id === activeId)
    const newIndex = currentSlot.findIndex(b => b.id === overId)

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newBlocks = [...currentSlot]
      const [movedBlock] = newBlocks.splice(oldIndex, 1)
      newBlocks.splice(newIndex, 0, movedBlock)

      const newConfig: DetailLayoutConfig = {
        ...config,
        slots: {
          ...config.slots,
          [selectedSlot]: newBlocks
        }
      }
      onConfigUpdate(newConfig)
    }
  }

  // Reset search/filter when slot changes
  const handleSlotChange = (newSlot: string) => {
    setSelectedSlot(newSlot)
    setSelectedBlock(null)
    setSearchQuery('')
    setTypeFilter('all')
    setExpandedBlocks(new Set())
  }

  const handleToggleExpand = (blockId: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev)
      if (next.has(blockId)) {
        next.delete(blockId)
      } else {
        next.add(blockId)
      }
      return next
    })
  }

  const handleToggleAll = () => {
    if (expandedBlocks.size === currentSlot.length && currentSlot.length > 0) {
      setExpandedBlocks(new Set())
    } else {
      setExpandedBlocks(new Set(currentSlot.map(b => b.id)))
    }
  }

  const handleDuplicate = (block: Block) => {
    const newBlock: Block = {
      ...block,
      id: `block-${Date.now()}`
    } as Block

    const newConfig: DetailLayoutConfig = {
      ...config,
      slots: {
        ...config.slots,
        [selectedSlot]: [...currentSlot, newBlock]
      }
    }
    onConfigUpdate(newConfig)
    // Auto-expand duplicated block
    setExpandedBlocks(prev => new Set([...prev, newBlock.id]))
  }

  const handleMoveToSlot = (blockId: string, targetSlot: keyof LayoutSlots) => {
    const block = currentSlot.find(b => b.id === blockId)
    if (!block || targetSlot === selectedSlot) return

    // Remove from current slot
    const newCurrentSlot = currentSlot.filter(b => b.id !== blockId)
    
    // Add to target slot
    const targetSlotBlocks = config.slots[targetSlot] || []
    const newTargetSlot = [...targetSlotBlocks, block]

    const newConfig: DetailLayoutConfig = {
      ...config,
      slots: {
        ...config.slots,
        [selectedSlot]: newCurrentSlot,
        [targetSlot]: newTargetSlot
      }
    }
    onConfigUpdate(newConfig)
  }

  const blockTypes: Array<{ type: BlockType; label: string; icon: string }> = [
    { type: 'screenshot', label: 'Screenshot', icon: '🖼️' },
    { type: 'video', label: 'Video', icon: '🎥' },
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'markdown', label: 'Markdown', icon: '📄' },
    { type: 'code', label: 'Code', icon: '💻' },
    { type: 'quote', label: 'Quote', icon: '💬' },
    { type: 'callout', label: 'Callout', icon: '📢' },
    { type: 'stats', label: 'Stats', icon: '📊' },
    { type: 'separator', label: 'Separator', icon: '➖' },
    { type: 'spacer', label: 'Spacer', icon: '⬜' },
    { type: 'embed', label: 'Embed', icon: '🔗' },
    { type: 'table', label: 'Table', icon: '📋' },
    { type: 'list', label: 'List', icon: '📜' }
  ]

  return (
    <div className="block-configurator">
      {/* Slot Selector */}
      <div className="block-configurator__slot-selector">
        <label className="block-configurator__label">
          Slot:
          <select
            value={selectedSlot}
            onChange={(e) => handleSlotChange(e.target.value)}
            className="block-configurator__select"
          >
            {availableSlots.map((slot) => (
              <option key={slot.key} value={slot.key}>
                {slot.label} ({config.slots[slot.key]?.length || 0} blocks)
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => setShowAddBlock(!showAddBlock)}
          className="block-configurator__btn block-configurator__btn--add"
        >
          + Add Block
        </button>
      </div>

      {/* Add Block Dropdown */}
      {showAddBlock && (
        <div className="block-configurator__add-menu">
          {blockTypes.map((bt) => (
            <button
              key={bt.type}
              onClick={() => handleAddBlock(bt.type)}
              className="block-configurator__add-item"
            >
              <span>{bt.icon}</span>
              <span>{bt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Search and Filter */}
      {currentSlot.length > 0 && (
        <>
          <BlockSearch
            onSearchChange={setSearchQuery}
            onFilterChange={(filter) => setTypeFilter(filter.type || 'all')}
            availableTypes={blockTypes.map(bt => bt.type)}
            searchQuery={searchQuery}
            typeFilter={typeFilter}
          />
          <div className="block-configurator__controls">
            <button
              onClick={handleToggleAll}
              className="block-configurator__btn block-configurator__btn--secondary"
            >
              {expandedBlocks.size === currentSlot.length ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </>
      )}

      {/* Blocks List */}
      <div className="block-configurator__blocks">
        {currentSlot.length === 0 ? (
          <p className="block-configurator__empty">No blocks in this slot. Add one to get started.</p>
        ) : filteredBlocks.length === 0 ? (
          <p className="block-configurator__empty">
            No blocks match your search. Try adjusting your filters.
          </p>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {filteredBlocks.map((block, index) => {
                // Find original index for position number
                const originalIndex = currentSlot.findIndex(b => b.id === block.id)
                return (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    index={originalIndex}
                    blockTypes={blockTypes}
                    selectedSlot={selectedSlot}
                    slotLabel={availableSlots.find(s => s.key === selectedSlot)?.label || selectedSlot}
                    markdownSections={markdownSections}
                    selectedBlock={selectedBlock}
                    onSelectBlock={setSelectedBlock}
                    onRemoveBlock={handleRemoveBlock}
                    onDuplicate={handleDuplicate}
                    onMoveToSlot={handleMoveToSlot}
                    availableSlots={availableSlots}
                    isExpanded={expandedBlocks.has(block.id)}
                    onToggleExpand={handleToggleExpand}
                  />
                )
              })}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

