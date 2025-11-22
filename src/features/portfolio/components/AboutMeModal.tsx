'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/features/shared/components/BaseModal'
import { type AboutData } from '@/features/editor/types/about'
import DetailLayoutRenderer from './layouts/DetailLayoutRenderer'
import SectionRenderer from './sections/SectionRenderer'
import { getAllSectionLayouts, type SectionLayoutsConfig } from '@/features/shared/utils/layoutConfig'

interface UserData {
  name: string
  bio: string
  avatar: string
  aboutMe?: {
    content: string
    frontmatter: any
    lastModified: string
  }
  socialLinks?: {
    github: string
    twitter?: string
    website?: string
    linkedin?: string
    email?: string
  }
}

interface AboutMeModalProps {
  isOpen: boolean
  onClose: () => void
  userData: UserData | null
}

export default function AboutMeModal({ isOpen, onClose, userData }: AboutMeModalProps) {
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(false)
  const [sectionLayouts, setSectionLayouts] = useState<SectionLayoutsConfig>({})

  useEffect(() => {
    if (isOpen) {
      loadAboutData()
      loadSectionLayouts()
    }
  }, [isOpen])

  const loadSectionLayouts = async () => {
    try {
      const layouts = await getAllSectionLayouts()
      setSectionLayouts(layouts)
    } catch (error) {
      console.error('Error loading section layouts:', error)
    }
  }

  const loadAboutData = async () => {
    setLoading(true)
    try {
      // Try to load from /data/about/about.json (public)
      const response = await fetch('/data/about/about.json')
      if (response.ok) {
        const data = await response.json()
        setAboutData(data as AboutData)
        setLoading(false)
        return
      }

      // Fallback: Try API route
      const apiResponse = await fetch('/api/data/about')
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        setAboutData(apiData as AboutData)
      } else {
        // Fallback: Create default structure from userData (backward compatibility)
        if (userData?.aboutMe?.content) {
          // Legacy: Convert old markdown structure to new JSON structure
          const defaultData: AboutData = {
            header: {
              title: 'About Me',
              subtitle: userData.bio || ''
            },
            sections: [
              {
                id: 'introduction',
                type: 'text',
                title: 'Introduction',
                blocks: [
                  {
                    id: 'intro-text',
                    type: 'text',
                    content: userData.aboutMe.content
                  }
                ]
              }
            ],
            socialLinks: userData.socialLinks ? {
              github: userData.socialLinks.github || null,
              twitter: userData.socialLinks.twitter || null,
              linkedin: userData.socialLinks.linkedin || null,
              website: userData.socialLinks.website || null,
              email: userData.socialLinks.email || null
            } : {
              github: null,
              twitter: null,
              linkedin: null,
              website: null,
              email: null
            },
            contact: {},
            metadata: {
              lastModified: userData.aboutMe.lastModified,
              generatedBy: 'legacy-migration'
            }
          }
          setAboutData(defaultData)
        }
      }
    } catch (error) {
      console.error('Error loading about data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Render sidebar navigation
  const renderSidebar = () => {
    if (!aboutData || !aboutData.sections || aboutData.sections.length === 0) {
      return null
    }

    return (
      <nav className="about-sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Contents</h3>
        </div>
        <div className="sidebar-nav">
          {aboutData.sections.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="sidebar-nav-item"
            >
              <span className="nav-item-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="nav-item-text">{section.title}</span>
            </a>
          ))}
        </div>
      </nav>
    )
  }

  // Render main content
  const renderContent = () => {
    if (!aboutData) {
      return (
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400">No content available.</p>
        </div>
      )
    }

    return (
      <div className="about-content">
        {/* Header */}
        {aboutData.header && (
          <div className="about-header">
            <h1 className="about-header__title">{aboutData.header.title}</h1>
            {aboutData.header.subtitle && (
              <p className="about-header__subtitle">{aboutData.header.subtitle}</p>
            )}
          </div>
        )}

        {/* Sections */}
        {aboutData.sections && aboutData.sections.length > 0 && (
          <div className="about-sections">
            {aboutData.sections.map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}
          </div>
        )}

        {/* Social Links */}
        {aboutData.socialLinks && (
          <div className="about-modal__social">
            <h4 className="about-modal__social-title">Connect with me</h4>
            <div className="about-modal__social-links">
              {aboutData.socialLinks.github && (
                <a
                  href={aboutData.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-link--github"
                  title="GitHub"
                >
                  <span className="sr-only">GitHub</span>
                  <svg className="social-link__icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              )}
              
              {aboutData.socialLinks.twitter && (
                <a
                  href={aboutData.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-link--twitter"
                  title="Twitter"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="social-link__icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              )}

              {aboutData.socialLinks.website && (
                <a
                  href={aboutData.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-link--website"
                  title="Website"
                >
                  <span className="sr-only">Website</span>
                  <svg className="social-link__icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </a>
              )}

              {aboutData.socialLinks.linkedin && (
                <a
                  href={aboutData.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-link--linkedin"
                  title="LinkedIn"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg className="social-link__icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}

              {aboutData.socialLinks.email && (
                <a
                  href={`mailto:${aboutData.socialLinks.email}`}
                  className="social-link social-link--email"
                  title="Email"
                >
                  <span className="sr-only">Email</span>
                  <svg className="social-link__icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819l6.545 4.91 6.545-4.91h3.819c.904 0 1.636.732 1.636 1.636z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!userData) return null

  const detailLayout = sectionLayouts.aboutMe?.detailLayout || 'sidebar-left'

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="About Me">
      <div className="about-detail-modal">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
            <span className="ml-3 text-gray-300">Loading about data...</span>
          </div>
        ) : aboutData ? (
          <DetailLayoutRenderer
            layout={detailLayout}
            content={renderContent()}
            sidebar={renderSidebar()}
          />
        ) : (
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400">No content available.</p>
          </div>
        )}
      </div>
    </BaseModal>
  )
}
