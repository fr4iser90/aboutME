/**
 * Sidebar Drag Editor Component
 * Wraps NavigationBlock with drag & drop context for reordering sections
 * 
 * Created: 2025-01-XX
 */

'use client'

import React from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { NavigationBlock } from '@/features/portfolio/types/blocks'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'
import NavigationBlock from '@/features/portfolio/components/blocks/NavigationBlock'
import DraggableNavigationItem from './DraggableNavigationItem'

interface SidebarDragEditorProps {
  block: NavigationBlock
  sections: MarkdownSection[]
  isEditMode: boolean
  onSectionsReorder: (newOrder: MarkdownSection[]) => void
}

/**
 * Sidebar Drag Editor
 * Provides drag & drop context for navigation items
 */
export default function SidebarDragEditor({
  block,
  sections,
  isEditMode,
  onSectionsReorder
}: SidebarDragEditorProps) {
  const [activeSection, setActiveSection] = React.useState<string>('')

  // Get sections
  let navSections: Array<{ id: string; title: string }> = []
  if (block.sections === 'auto' && sections) {
    navSections = sections.map(s => ({ id: s.id, title: s.title }))
  } else if (Array.isArray(block.sections)) {
    navSections = block.sections
  }

  const sectionIds = navSections.map(s => `nav-${s.id}`)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    const contentElement = document.querySelector('.project-content') as HTMLElement
    
    if (element && contentElement) {
      const sectionTop = element.offsetTop - contentElement.offsetTop
      contentElement.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      })
    }
  }

  // Scroll spy
  React.useEffect(() => {
    if (!sections) return

    const contentElement = document.querySelector('.project-content') as HTMLElement
    if (!contentElement) return

    const handleScroll = () => {
      const scrollTop = contentElement.scrollTop
      const containerHeight = contentElement.clientHeight
      const scrollHeight = contentElement.scrollHeight

      const isAtBottom = scrollTop + containerHeight >= scrollHeight - 10

      if (isAtBottom && sections.length > 0) {
        setActiveSection(sections[sections.length - 1].id)
        return
      }

      let currentSection = sections[0]?.id || ''
      for (let i = 0; i < sections.length; i++) {
        const sectionElement = document.getElementById(sections[i].id)
        if (sectionElement) {
          const sectionTop = sectionElement.offsetTop - contentElement.offsetTop
          const sectionHeight = sectionElement.offsetHeight

          if (scrollTop >= sectionTop - 100 && scrollTop < sectionTop + sectionHeight) {
            currentSection = sections[i].id
            break
          }
        }
      }

      setActiveSection(currentSection)
    }

    contentElement.addEventListener('scroll', handleScroll)
    return () => contentElement.removeEventListener('scroll', handleScroll)
  }, [sections])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const activeId = active.id as string // "nav-quickstart"
    const overId = over.id as string // "nav-cursor-ide-setup"

    // Extract section IDs
    const activeSectionId = activeId.replace('nav-', '')
    const overSectionId = overId.replace('nav-', '')

    // Find indices
    const activeIndex = sections.findIndex(s => s.id === activeSectionId)
    const overIndex = sections.findIndex(s => s.id === overSectionId)

    if (activeIndex === -1 || overIndex === -1) return

    // Reorder sections
    const newSections = [...sections]
    const [removed] = newSections.splice(activeIndex, 1)
    newSections.splice(overIndex, 0, removed)

    // Call callback
    onSectionsReorder(newSections)
  }

  // If not in edit mode, use normal NavigationBlock
  if (!isEditMode) {
    return (
      <NavigationBlock
        block={block}
        context="sidebar"
        sections={sections}
      />
    )
  }

  // In edit mode, use draggable version
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className={`block block-navigation block-navigation--${block.style || 'numbered'}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">Contents</h3>
        </div>
        <nav className="sidebar-nav">
          <SortableContext
            items={sectionIds}
            strategy={verticalListSortingStrategy}
          >
            {navSections.map((section, index) => (
              <DraggableNavigationItem
                key={section.id}
                section={section}
                index={index}
                isActive={activeSection === section.id}
                style={block.style || 'numbered'}
                isEditMode={isEditMode}
                onScrollTo={scrollToSection}
              />
            ))}
          </SortableContext>
        </nav>
      </div>
    </DndContext>
  )
}

