/**
 * Navigation Block Component
 * Sidebar navigation with sections
 * 
 * Created: 2025-11-16
 */

'use client'

import React, { useState, useEffect } from 'react'
import type { NavigationBlock as NavigationBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'
import SidebarDragEditor from '@/features/editor/components/SidebarDragEditor'

interface NavigationBlockProps {
  block: NavigationBlockType
  context?: BlockContext
  sections?: MarkdownSection[]
  isEditMode?: boolean
  onSectionsReorder?: (newOrder: MarkdownSection[]) => void
}

/**
 * Navigation Block
 * Renders sidebar navigation
 */
export default function NavigationBlock({ 
  block, 
  context = 'sidebar', 
  sections,
  isEditMode = false,
  onSectionsReorder
}: NavigationBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const [activeSection, setActiveSection] = useState<string>('')

  // Get sections
  let navSections: Array<{ id: string; title: string }> = []
  if (block.sections === 'auto' && sections) {
    navSections = sections.map(s => ({ id: s.id, title: s.title }))
  } else if (Array.isArray(block.sections)) {
    navSections = block.sections
  }

  useEffect(() => {
    if (navSections.length > 0 && !activeSection) {
      setActiveSection(navSections[0].id)
    }
  }, [navSections, activeSection])

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

  // Scroll spy needs to watch the content area
  useEffect(() => {
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

  const className = `block block-navigation block-navigation--${block.style || 'numbered'} ${animationClasses} ${responsiveClasses}`.trim()

  // If edit mode and onSectionsReorder callback provided, use SidebarDragEditor
  if (isEditMode && onSectionsReorder && sections) {
    return (
      <div className={className} style={spacingStyles}>
        <SidebarDragEditor
          block={block}
          sections={sections}
          isEditMode={isEditMode}
          onSectionsReorder={onSectionsReorder}
        />
      </div>
    )
  }

  // Normal navigation (non-edit mode)
  return (
    <div className={className} style={spacingStyles}>
      <div className="sidebar-header">
        <h3 className="sidebar-title">Contents</h3>
      </div>
      <nav className="sidebar-nav">
        {navSections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`sidebar-nav-item ${
              activeSection === section.id ? 'active' : ''
            }`}
          >
            {block.style === 'numbered' && (
              <span className="nav-item-number">{String(index + 1).padStart(2, '0')}</span>
            )}
            <span className="nav-item-text">{section.title}</span>
            {block.style === 'numbered' && <div className="nav-item-indicator"></div>}
          </button>
        ))}
      </nav>
    </div>
  )
}

