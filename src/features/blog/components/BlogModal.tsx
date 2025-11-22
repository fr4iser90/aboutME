'use client'

import { useState, useEffect, useRef } from 'react'
import BaseModal from '@/features/shared/components/BaseModal'
import { MarkdownParser, renderMarkdownElement, type ParsedMarkdown, type MarkdownSection } from '@/features/shared/services/markdownParser'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  htmlContent?: string // Pre-parsed HTML for performance
  publishedAt: string
  author: string
  category: string
  tags: string[]
  featured: boolean
  slug: string
  readingTime: number
  image?: string
}

interface BlogModalProps {
  isOpen: boolean
  onClose: () => void
  post: BlogPost | null
}

export default function BlogModal({ isOpen, onClose, post }: BlogModalProps) {
  const [parsedMarkdown, setParsedMarkdown] = useState<ParsedMarkdown | null>(null)
  const [activeSection, setActiveSection] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && post) {
      if (post.htmlContent) {
        // Use pre-parsed HTML for better performance
        const parsed: ParsedMarkdown = {
          sections: [
            {
              id: 'content',
              title: post.title,
              level: 1,
              content: [
                {
                  type: 'html',
                  content: post.htmlContent
                }
              ]
            }
          ]
        }
        setParsedMarkdown(parsed)
        setActiveSection('content')
      } else if (post.content) {
        // Fallback to runtime parsing if htmlContent not available
        const parser = new MarkdownParser(post.content)
        const parsed = parser.parse()
        setParsedMarkdown(parsed)
        // Set first section as active
        if (parsed.sections.length > 0) {
          setActiveSection(parsed.sections[0].id)
        }
      }
    }
  }, [isOpen, post])

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
        // If at bottom, set the last section as active
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

  // Render section content using the new parser
  const renderSectionContent = (section: MarkdownSection) => {
    return section.content.map((element, index) => 
      renderMarkdownElement(element, index)
    ).filter(Boolean)
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Prepare flags for the modal header
  const prepareFlags = () => {
    const flags = []
    
    if (post?.featured) {
      flags.push({
        type: 'featured' as const,
        value: 'Featured'
      })
    }
    
    if (post?.category) {
      flags.push({
        type: 'category' as const,
        value: post.category
      })
    }
    
    return flags
  }

  // Prepare badges for detailed information
  const prepareBadges = () => {
    const badges = []
    
    if (post?.tags && post.tags.length > 0) {
      badges.push({
        label: 'Tags',
        type: 'tags' as const,
        value: post.tags.slice(0, 5).join(', ') + 
               (post.tags.length > 5 ? '...' : '')
      })
    }
    
    return badges
  }

  if (!post) return null

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={post.title}
      flags={prepareFlags()}
      badges={prepareBadges()}
    >
      <div className="about-detail-modal">
        {/* Blog Meta Information */}
        <div className="blog-modal__meta">
          <span className="blog-modal__date">{formatDate(post.publishedAt)}</span>
          <span className="blog-modal__separator">•</span>
          <span className="blog-modal__reading-time">{post.readingTime} min read</span>
          <span className="blog-modal__separator">•</span>
          <span className="blog-modal__author">{post.author}</span>
        </div>

        {parsedMarkdown ? (
          <div className="about-modal-layout">
            {/* Sidebar Navigation */}
            <div className="about-sidebar">
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
            <div ref={contentRef} className="about-content">
              {parsedMarkdown.sections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="content-section"
                >
                  <h2 className="section-title">{section.title}</h2>
                  <div className="section-content">
                    {renderSectionContent(section)}
                  </div>
                </div>
              ))}

              {/* Tags at the bottom */}
              {post.tags.length > 0 && (
                <div className="about-modal__social">
                  <h4 className="about-modal__social-title">Tags</h4>
                  <div className="about-modal__social-links">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="blog-modal__tag"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400">No content available.</p>
          </div>
        )}
      </div>
    </BaseModal>
  )
}
