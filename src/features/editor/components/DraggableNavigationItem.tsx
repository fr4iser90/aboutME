/**
 * Draggable Navigation Item Component
 * Makes navigation items draggable for reordering sections
 * 
 * Created: 2025-01-XX
 */

'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DraggableNavigationItemProps {
  section: { id: string; title: string }
  index: number
  isActive: boolean
  style: 'numbered' | 'bullet' | 'minimal'
  isEditMode: boolean
  onScrollTo: (id: string) => void
}

/**
 * Draggable Navigation Item
 * Wraps navigation button with drag & drop functionality
 */
export default function DraggableNavigationItem({
  section,
  index,
  isActive,
  style,
  isEditMode,
  onScrollTo
}: DraggableNavigationItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `nav-${section.id}`,
    disabled: !isEditMode
  })

  const style_transform = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleClick = () => {
    if (!isEditMode) {
      onScrollTo(section.id)
    }
  }

  return (
    <button
      ref={setNodeRef}
      style={style_transform}
      {...attributes}
      {...(isEditMode ? listeners : {})}
      onClick={handleClick}
      className={`sidebar-nav-item ${
        isActive ? 'active' : ''
      } ${
        isEditMode ? 'sidebar-nav-item--draggable' : ''
      } ${
        isDragging ? 'sidebar-nav-item--dragging' : ''
      }`}
    >
      {style === 'numbered' && (
        <span className="nav-item-number">{String(index + 1).padStart(2, '0')}</span>
      )}
      <span className="nav-item-text">{section.title}</span>
      {style === 'numbered' && <div className="nav-item-indicator"></div>}
    </button>
  )
}

