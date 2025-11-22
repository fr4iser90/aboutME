'use client'

import { useState, useRef, useEffect } from 'react'
import type { Block } from '@/features/portfolio/types/blocks'
import type { LayoutSlots } from '@/features/portfolio/types/layouts'

interface QuickActionsMenuProps {
  block: Block
  onDuplicate: (block: Block) => void
  onMoveToSlot: (blockId: string, targetSlot: keyof LayoutSlots) => void
  onDelete: (blockId: string) => void
  availableSlots: Array<{ key: keyof LayoutSlots; label: string }>
  currentSlot: keyof LayoutSlots
}

export default function QuickActionsMenu({
  block,
  onDuplicate,
  onMoveToSlot,
  onDelete,
  availableSlots,
  currentSlot
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleDuplicate = () => {
    onDuplicate(block)
    setIsOpen(false)
  }

  const handleMoveToSlot = (targetSlot: keyof LayoutSlots) => {
    if (targetSlot !== currentSlot) {
      onMoveToSlot(block.id, targetSlot)
    }
    setIsOpen(false)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this block?`)) {
      onDelete(block.id)
    }
    setIsOpen(false)
  }

  const otherSlots = availableSlots.filter(slot => slot.key !== currentSlot)

  return (
    <div className="quick-actions-menu" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="quick-actions-menu__trigger"
        title="Quick actions"
        aria-label="Quick actions menu"
      >
        ⋯
      </button>
      {isOpen && (
        <div className="quick-actions-menu__dropdown">
          <button
            onClick={handleDuplicate}
            className="quick-actions-menu__item"
          >
            <span>📋</span>
            <span>Duplicate</span>
          </button>
          {otherSlots.length > 0 && (
            <div className="quick-actions-menu__submenu">
              <div className="quick-actions-menu__submenu-label">Move to Slot:</div>
              {otherSlots.map((slot) => (
                <button
                  key={slot.key}
                  onClick={() => handleMoveToSlot(slot.key)}
                  className="quick-actions-menu__item quick-actions-menu__item--submenu"
                >
                  <span>→</span>
                  <span>{slot.label}</span>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleDelete}
            className="quick-actions-menu__item quick-actions-menu__item--danger"
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}

