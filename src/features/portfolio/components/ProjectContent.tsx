'use client'

import { useRef, useEffect, useState } from 'react'
import { renderMarkdownElement, type ParsedMarkdown } from '@/features/shared/services/markdownParser'

interface ProjectContentProps {
  parsedMarkdown: ParsedMarkdown
}

/**
 * ProjectContent - Gemeinsame Komponente für Modal und Preview
 * EINE Quelle für beide, damit sie IMMER identisch sind
 */
export default function ProjectContent({ parsedMarkdown }: ProjectContentProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  // Scroll spy effect
  useEffect(() => {
    if (!parsedMarkdown || !contentRef.current) return

    const contentElement = contentRef.current
    const sections = parsedMarkdown.sections

    const handleScroll = () => {
      const scrollTop = contentElement.scrollTop
      const containerHeight = contentElement.clientHeight
      const scrollHeight = contentElement.scrollHeight

      // Check if we're at the bottom
      const isAtBottom = scrollTop + containerHeight >= scrollHeight - 10

      if (isAtBottom && sections.length > 0) {
        setActiveSection(sections[sections.length - 1].id)
        return
      }

      // Find which section is currently in view
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
  }, [parsedMarkdown])

  // Set first section as active on mount
  useEffect(() => {
    if (parsedMarkdown.sections.length > 0 && !activeSection) {
      setActiveSection(parsedMarkdown.sections[0].id)
    }
  }, [parsedMarkdown])

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const sectionElement = document.getElementById(sectionId)
    const contentElement = contentRef.current
    
    if (sectionElement && contentElement) {
      const sectionTop = sectionElement.offsetTop - contentElement.offsetTop
      contentElement.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="project-modal-layout">
      {/* Sidebar Navigation */}
      <div className="project-sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Contents</h3>
        </div>
        <nav className="sidebar-nav">
          {parsedMarkdown.sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`sidebar-nav-item ${
                activeSection === section.id ? 'active' : ''
              }`}
            >
              <span className="nav-item-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="nav-item-text">{section.title}</span>
              <div className="nav-item-indicator"></div>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content Area */}
      <div ref={contentRef} className="project-content">
        {parsedMarkdown.sections.map((section) => (
          <div
            key={section.id}
            id={section.id}
            className="content-section"
          >
            <h2 className="section-title">{section.title}</h2>
            <div className="section-content">
              {section.content.map((element, index) => 
                renderMarkdownElement(element, index)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

