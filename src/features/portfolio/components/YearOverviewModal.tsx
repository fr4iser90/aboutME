'use client'

import { useState, useEffect, useRef } from 'react'
import BaseModal from '@/features/shared/components/BaseModal'
import { MarkdownParser, renderMarkdownElement, type ParsedMarkdown, type MarkdownSection } from '@/features/shared/services/markdownParser'

interface YearOverviewModalProps {
  isOpen: boolean
  onClose: () => void
  yearData: {
    year: number
    projects: number
    languages: string[]
    frameworks: string[]
    totalStars: number
    totalCodeLines?: number
    codeLinesByLanguage?: { [language: string]: number }
    milestones: Array<{
      project: string
      stars: number
      language: string
      description?: string
      content?: string
      htmlContent?: string // Pre-parsed HTML for performance
    }>
  } | null
  skills?: Array<{
    name: string
    level: string
    category: string
    icon: string
    codeLines?: number
    percentage?: number
  }>
}

export default function YearOverviewModal({ isOpen, onClose, yearData, skills = [] }: YearOverviewModalProps) {
  const [parsedMarkdown, setParsedMarkdown] = useState<ParsedMarkdown | null>(null)
  const [activeSection, setActiveSection] = useState<string>('')
  const [projectDetails, setProjectDetails] = useState<{ [key: string]: ParsedMarkdown }>({})
  const contentRef = useRef<HTMLDivElement>(null)

  // Parse project content when modal opens
  useEffect(() => {
    if (isOpen && yearData?.milestones) {
      const newProjectDetails: { [key: string]: ParsedMarkdown } = {}
      
      yearData.milestones.forEach(milestone => {
        if (milestone.htmlContent) {
          // Use pre-parsed HTML for better performance
          const parsed: ParsedMarkdown = {
            sections: [
              {
                id: 'content',
                title: milestone.project,
                level: 1,
                content: [
                  {
                    type: 'html',
                    content: milestone.htmlContent
                  }
                ]
              }
            ]
          }
          newProjectDetails[milestone.project] = parsed
        } else if (milestone.content) {
          // Fallback to runtime parsing if htmlContent not available
          const parser = new MarkdownParser(milestone.content)
          const parsed = parser.parse()
          newProjectDetails[milestone.project] = parsed
        }
      })
      
      setProjectDetails(newProjectDetails)
      
      // Set first section as active
      setActiveSection('overview')
    }
  }, [isOpen, yearData])

  // Get available sections dynamically
  const getAvailableSections = () => {
    if (!yearData) return []
    
    const sections = [
      { id: 'overview', title: 'Overview', number: '01' },
      { id: 'skills', title: 'Skills', number: '02' },
    ]
    
    let sectionNumber = 3
    if (yearData.frameworks && yearData.frameworks.length > 0) {
      sections.push({ id: 'frameworks', title: 'Frameworks', number: String(sectionNumber).padStart(2, '0') })
      sectionNumber++
    }
    
    sections.push({ id: 'projects', title: 'Projects', number: String(sectionNumber).padStart(2, '0') })
    sectionNumber++
    sections.push({ id: 'achievements', title: 'Achievements', number: String(sectionNumber).padStart(2, '0') })
    
    return sections
  }

  // Scroll spy effect
  useEffect(() => {
    console.log('🔍 Scroll spy useEffect triggered')
    console.log('🔍 contentRef.current:', contentRef.current)
    console.log('🔍 yearData:', yearData)
    
    if (!yearData) {
      console.log('🔍 Scroll spy: Missing yearData')
      return
    }

    // Wait for contentRef to be available
    const checkContentRef = () => {
      if (!contentRef.current) {
        console.log('🔍 contentRef not ready, retrying...')
        setTimeout(checkContentRef, 50)
        return
      }

      console.log('🔍 Scroll spy: Setting up scroll listener')
      const contentElement = contentRef.current
      const sections = getAvailableSections()
      
      console.log('🔍 Available sections:', sections.map(s => s.id))

      const handleScroll = () => {
        const scrollTop = contentElement.scrollTop
        const containerHeight = contentElement.clientHeight
        const scrollHeight = contentElement.scrollHeight

        console.log(`🔍 Scroll Debug: scrollTop=${scrollTop}, containerHeight=${containerHeight}, scrollHeight=${scrollHeight}`)

        // Check if we're at the bottom
        const isAtBottom = scrollTop + containerHeight >= scrollHeight - 10

        if (isAtBottom && sections.length > 0) {
          console.log(`🔍 At bottom, setting active section to: ${sections[sections.length - 1].id}`)
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

            console.log(`🔍 Section ${sections[i].id}: sectionTop=${sectionTop}, sectionHeight=${sectionHeight}`)

            if (scrollTop >= sectionTop - 100 && scrollTop < sectionTop + sectionHeight) {
              console.log(`🔍 Setting active section to: ${sections[i].id}`)
              currentSection = sections[i].id
              break
            }
          } else {
            console.log(`🔍 Section element not found: ${sections[i].id}`)
          }
        }

        console.log(`🔍 Final active section: ${currentSection}`)
        setActiveSection(currentSection)
      }

      // Wait for DOM to be ready
      setTimeout(() => {
        console.log('🔍 Adding scroll listener after timeout')
        contentElement.addEventListener('scroll', handleScroll)
        handleScroll() // Initial check
      }, 100)

      return () => {
        console.log('🔍 Removing scroll listener')
        contentElement.removeEventListener('scroll', handleScroll)
      }
    }

    checkContentRef()
  }, [yearData])

  // Render section content using the parser
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
      // Manually set active section after scrolling
      setActiveSection(sectionId)
    }
  }

  if (!yearData) return null

  const getLanguageIcon = (language: string) => {
    const icons: { [key: string]: string } = {
      'JavaScript': '🟨',
      'TypeScript': '🔷',
      'Python': '🐍',
      'Java': '☕',
      'Shell': '🐚',
      'Vue': '💚',
      'GDScript': '🎮',
      'Nix': '❄️'
    }
    return icons[language] || '💻'
  }

  const getFrameworkIcon = (framework: string) => {
    const icons: { [key: string]: string } = {
      'fastapi': '⚡',
      'nextjs': '▲',
      'docker': '🐳'
    }
    return icons[framework] || '🔧'
  }

  const getSkillLevel = (skillName: string) => {
    if (!skillName || typeof skillName !== 'string') return 'beginner'
    const skill = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase())
    return skill ? skill.level.toLowerCase() : 'beginner'
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`${yearData.year} - Year Overview`}>
      <div className="about-detail-modal">
        <div className="about-modal-layout">
          {/* Sidebar Navigation */}
          <div className="about-sidebar">
            <div className="sidebar-header">
              <h3 className="sidebar-title">Contents</h3>
            </div>
            <nav className="sidebar-nav">
              {getAvailableSections().map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`sidebar-nav-item ${
                    activeSection === section.id ? 'active' : ''
                  }`}
                >
                  <span className="nav-item-number">{section.number}</span>
                  <span className="nav-item-text">{section.title}</span>
                  <div className="nav-item-indicator"></div>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Content Area */}
          <div ref={contentRef} className="about-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {/* Overview Section */}
            <div id="overview" className="content-section">
              <h2 className="section-title">Overview</h2>
              <div className="section-content">
                <div className="year-overview__stats">
                  <div className="year-overview__stat">
                    <div className="year-overview__stat-number">{yearData.projects}</div>
                    <div className="year-overview__stat-label">Projects Completed</div>
                  </div>
                  <div className="year-overview__stat">
                    <div className="year-overview__stat-number">{yearData.languages.length}</div>
                    <div className="year-overview__stat-label">Languages Learned</div>
                  </div>
                  <div className="year-overview__stat">
                    <div className="year-overview__stat-number">{yearData.totalStars}</div>
                    <div className="year-overview__stat-label">GitHub Stars</div>
                  </div>
                  {yearData.totalCodeLines && (
                    <div className="year-overview__stat">
                      <div className="year-overview__stat-number">{yearData.totalCodeLines.toLocaleString()}</div>
                      <div className="year-overview__stat-label">Code Lines Written</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div id="skills" className="content-section">
              <h2 className="section-title">Skills Development</h2>
              <div className="section-content">
                <div className="year-overview__skills">
                  {yearData.languages.map((lang, index) => (
                    <div key={lang} className="year-overview__skill-item">
                      <div className="year-overview__skill-header">
                        <span className="year-overview__skill-icon">{getLanguageIcon(lang)}</span>
                        <span className="year-overview__skill-name">{lang}</span>
                        <span className={`year-overview__skill-level year-overview__skill-level--${getSkillLevel(lang)}`}>
                          {getSkillLevel(lang)}
                        </span>
                      </div>
                      <div className="year-overview__skill-code-lines">
                        {yearData.codeLinesByLanguage && yearData.codeLinesByLanguage[lang] 
                          ? `${yearData.codeLinesByLanguage[lang].toLocaleString()} lines`
                          : 'No data'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Frameworks Section */}
            {yearData.frameworks.length > 0 && (
              <div id="frameworks" className="content-section">
                <h2 className="section-title">Frameworks & Tools</h2>
                <div className="section-content">
                  <div className="year-overview__frameworks">
                    {yearData.frameworks.map((framework) => (
                      <div key={framework} className="year-overview__framework-item">
                        <span className="year-overview__framework-icon">{getFrameworkIcon(framework)}</span>
                        <span className="year-overview__framework-name">{framework}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Projects Section */}
            <div id="projects" className="content-section">
              <h2 className="section-title">Key Projects</h2>
              <div className="section-content">
                <div className="year-overview__projects">
                  {yearData.milestones.map((project, index) => {
                    const projectParsed = projectDetails[project.project]
                    return (
                      <div key={index} id={`project-${project.project}`} className="year-overview__project-item">
                        <div className="year-overview__project-header">
                          <h4 className="year-overview__project-name">{project.project}</h4>
                          <div className="year-overview__project-stats">
                            <span className="year-overview__project-stars">⭐ {project.stars}</span>
                            {project.language && (
                              <span className="year-overview__project-language">{project.language}</span>
                            )}
                          </div>
                        </div>
                        <div className="year-overview__project-description">
                          {projectParsed ? (
                            <div className="project-content">
                              {projectParsed.sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="project-section">
                                  <h5 className="text-lg font-semibold text-white mb-2 mt-4">{section.title}</h5>
                                  <div className="project-section-content">
                                    {renderSectionContent(section)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : project.description ? (
                            <p>{project.description}</p>
                          ) : (
                            <p>Project description and details would go here...</p>
                          )}
                        </div>
                        <div className="year-overview__project-actions">
                          <button className="year-overview__project-btn year-overview__project-btn--primary">
                            View Project
                          </button>
                          <button className="year-overview__project-btn year-overview__project-btn--secondary">
                            GitHub
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div id="achievements" className="content-section">
              <h2 className="section-title">Achievements</h2>
              <div className="section-content">
                <div className="year-overview__achievements">
                  <div className="year-overview__achievement">
                    <span className="year-overview__achievement-icon">🚀</span>
                    <span className="year-overview__achievement-text">Learned {yearData.languages.length} new technologies</span>
                  </div>
                  <div className="year-overview__achievement">
                    <span className="year-overview__achievement-icon">💎</span>
                    <span className="year-overview__achievement-text">Completed {yearData.projects} projects</span>
                  </div>
                  <div className="year-overview__achievement">
                    <span className="year-overview__achievement-icon">⭐</span>
                    <span className="year-overview__achievement-text">Earned {yearData.totalStars} GitHub stars</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
