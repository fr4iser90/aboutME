'use client'

import { useEffect, useState } from 'react'
import { ContactSection, ThemeSwitcher, DynamicBackground } from '@/features/shared'
import ThemeDesignSwitcher from '@/features/shared/components/ThemeDesignSwitcher'
import DesignSwitcher from '@/features/shared/components/DesignSwitcher'
import { Hero } from '@/features/hero'
import { Header } from '@/features/header'
import { Footer } from '@/features/footer'
import { ProjectCard, SkillCard, AboutMeSection, AboutMeModal, SkillsTimeline, YearOverviewModal, ProjectModal } from '@/features/portfolio'
import { BlogSection, BlogModal } from '@/features/blog'
import { Terminal, TerminalSection, initTerminalHints } from '@/features/terminal'
import { config as appConfig } from '@/features/shared'
import MainPageLayout from '@/features/portfolio/components/layouts/MainPageLayout'
import HeroBlock from '@/features/portfolio/components/blocks/HeroBlock'
import ProjectsBlock from '@/features/portfolio/components/blocks/ProjectsBlock'
import SkillsBlock from '@/features/portfolio/components/blocks/SkillsBlock'
import BlogBlock from '@/features/portfolio/components/blocks/BlogBlock'
import AboutMeBlock from '@/features/portfolio/components/blocks/AboutMeBlock'
import ContactBlock from '@/features/portfolio/components/blocks/ContactBlock'
import ProjectsSectionLayout from '@/features/portfolio/components/sections/ProjectsSectionLayout'
import SkillsSectionLayout from '@/features/portfolio/components/sections/SkillsSectionLayout'
import TimelineSectionLayout from '@/features/portfolio/components/sections/TimelineSectionLayout'
import BlogSectionLayout from '@/features/portfolio/components/sections/BlogSectionLayout'
import { getMainPageLayout, getAllSectionLayouts, type MainPageLayoutConfig, type SectionLayoutsConfig, getGlobalLayout, type GlobalLayoutConfig } from '@/features/shared/utils/layoutConfig'

interface UserData {
  username: string
  name: string
  bio: string
  avatar: string
  avatar_url: string
  location: string
  followers: number
  publicRepos: number
  public_repos: number
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

import type { Project } from '@/features/portfolio/types'

interface Skill {
  name: string
  count: number
  level: string
  category: string
  icon: string
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  author: string
  category: string
  tags: string[]
  featured: boolean
  slug: string
  readingTime: number
  image?: string
}

interface TimelineEntry {
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
  }>
}

interface Config {
  features: {
    projects: {
      enabled: boolean
      showFeatured: boolean
      showAll: boolean
    }
    skills: {
      enabled: boolean
      showTimeline: boolean
    }
    aboutMe: {
      enabled: boolean
    }
    blog: {
      enabled: boolean
    }
    contact: {
      enabled: boolean
    }
    hero?: {
      enabled: boolean
      variant?: 'floating' | 'card' | 'fullscreen' | 'minimal' | 'split'
      animation?: {
        enabled: boolean
        type: 'fade' | 'slide' | 'zoom' | 'none'
        duration: number
      }
      showStats?: boolean
      showSocialLinks?: boolean
    }
    theme: {
      enabled: boolean
      defaultTheme: string
      publicSwitcher?: {
        enabled: boolean
        allowThemeSwitch: boolean
        allowDesignSwitch: boolean
        availableThemes: string[]
        availableDesigns: string[]
        switcherType: 'separate' | 'combined'
        position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
      }
    }
    background?: {
      useDefault: boolean
      defaultImage?: string
      customImage?: string
    }
  }
  layout: {
    sections: {
      order: string[]
    }
  }
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [hasDesign, setHasDesign] = useState(false)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'featured' | 'all'>('featured')
  const [layoutConfig, setLayoutConfig] = useState<MainPageLayoutConfig | null>(null)
  const [sectionLayouts, setSectionLayouts] = useState<SectionLayoutsConfig | null>(null)
  
  // Modal State
  const [selectedYear, setSelectedYear] = useState<TimelineEntry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isAboutMeModalOpen, setIsAboutMeModalOpen] = useState(false)
  
  // Terminal State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)

  // Modal Handlers
  const handleYearClick = (yearData: TimelineEntry) => {
    setSelectedYear(yearData)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedYear(null)
  }

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post)
    setIsBlogModalOpen(true)
  }

  const handleCloseBlogModal = () => {
    setIsBlogModalOpen(false)
    setSelectedPost(null)
  }

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsProjectModalOpen(true)
  }

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false)
    setSelectedProject(null)
  }

  const handleAboutMeClick = () => {
    setIsAboutMeModalOpen(true)
  }

  const handleCloseAboutMeModal = () => {
    setIsAboutMeModalOpen(false)
  }

  // Terminal Handlers
  const handleTerminalOpen = () => {
    setIsTerminalOpen(true)
  }

  const handleTerminalClose = () => {
    setIsTerminalOpen(false)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // Lade alle verfügbaren Daten
        const promises = [
          fetch(appConfig.api.user),
          fetch(appConfig.api.projects),
          fetch(appConfig.api.skills),
          fetch(appConfig.api.config)
        ]

        // Optional: Blog und Timeline
        try {
          promises.push(fetch('/api/blog'))
        } catch (e) {
          // Blog nicht verfügbar
        }

        try {
          promises.push(fetch(appConfig.api.timeline))
        } catch (e) {
          // Timeline nicht verfügbar
        }

        const responses = await Promise.allSettled(promises)
        
        const user = responses[0].status === 'fulfilled' ? await responses[0].value.json() : null
        const projectsData = responses[1].status === 'fulfilled' ? await responses[1].value.json() : null
        const skillsData = responses[2].status === 'fulfilled' ? await responses[2].value.json() : null
        const configData = responses[3].status === 'fulfilled' ? await responses[3].value.json() : null
        const blogData = responses[4]?.status === 'fulfilled' ? await responses[4].value.json() : null
        const timelineData = responses[5]?.status === 'fulfilled' ? await responses[5].value.json() : null

        // Transform user data
        if (user) {
          const transformedUser = {
            ...user,
            avatar_url: user.avatar || user.avatar_url,
            public_repos: user.publicRepos || user.public_repos
          }
          setUserData(transformedUser)
        }

        // Set projects data
        if (projectsData) {
          setAllProjects(projectsData.projects)
          setProjects(projectsData.projects.filter((p: Project) => p.featured).slice(0, 6))
        }

        // Set skills data
        if (skillsData) {
          setSkills([...skillsData.languages, ...skillsData.frameworks, ...skillsData.tools].slice(0, 12))
        }

        // Set blog data
        if (blogData) {
          setBlogPosts(blogData.posts || [])
        }

        // Set timeline data
        if (timelineData) {
          setTimeline(timelineData.timeline || [])
        }

        // Set config - transform structure if needed
        if (configData) {
          // Transform config.json structure to match Config interface
          const transformedConfig: Config = {
            features: {
              projects: configData.portfolio?.features?.projects || configData.features?.projects || { enabled: true, showFeatured: true, showAll: true },
              skills: configData.portfolio?.features?.skills || configData.features?.skills || { enabled: true, showTimeline: true },
              aboutMe: configData.portfolio?.features?.aboutMe || configData.features?.aboutMe || { enabled: true },
              blog: configData.portfolio?.features?.blog || configData.features?.blog || { enabled: false },
              contact: configData.portfolio?.features?.contact || configData.features?.contact || { enabled: false },
              hero: configData.portfolio?.features?.hero || configData.features?.hero || { enabled: true, variant: 'floating' },
              theme: configData.portfolio?.features?.theme || configData.features?.theme || { enabled: true, defaultTheme: 'dark' }
            },
            layout: configData.portfolio?.layout || configData.layout || {
              sections: {
                order: ['hero', 'about', 'projects', 'skills', 'blog', 'contact']
              }
            }
          }
          setConfig(transformedConfig)
        }

        // Load layout configuration
        try {
          const [mainPageLayout, sectionLayoutsData] = await Promise.all([
            getMainPageLayout(),
            getAllSectionLayouts()
          ])
          setLayoutConfig(mainPageLayout)
          setSectionLayouts(sectionLayoutsData)
        } catch (error) {
          console.error('Error loading layout config:', error)
          // Use defaults
          setLayoutConfig({
            layout: 'portfolio'
          })
        }

      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Initialize terminal hints after component mounts
  useEffect(() => {
    if (!loading) {
      // Initialize terminal hints with custom configuration
      initTerminalHints({
        initialDelay: 60000, // 1 minute
        repeatInterval: 180000, // 3 minutes
        animationDuration: 2000, // 2 seconds
        maxHints: 3 // Maximum 3 hints
      })
    }
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-6"></div>
          <p className="text-gray-400 loading-dots text-lg">Loading portfolio</p>
        </div>
      </div>
    )
  }

  const currentProjects = currentView === 'featured' ? projects : allProjects

  // Check if design is active
  useEffect(() => {
    const checkDesign = () => {
      const design = document.documentElement.getAttribute('data-design')
      setHasDesign(!!design)
    }
    
    checkDesign()
    
    // Watch for design changes
    const observer = new MutationObserver(() => {
      checkDesign()
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-design']
    })
    
    return () => observer.disconnect()
  }, [])

  // Get background image from config
  const backgroundImage = config?.features.background?.useDefault 
    ? config.features.background?.defaultImage || '/assets/galaxy.png'
    : config.features.background?.customImage

  return (
    <div className="min-h-screen text-white" data-main-page="true">
      {/* Dynamic Background - Only if no design is active */}
      {!hasDesign && <DynamicBackground backgroundImage={backgroundImage} />}
      
      {/* Header - Only on main page */}
      {config?.features.header?.enabled && (
        <Header config={config.features.header} onAboutClick={handleAboutMeClick} />
      )}
      
      {/* Theme Switcher - Only show if theme enabled AND public switcher enabled */}
      {config?.features.theme.enabled && 
       config?.features.theme.publicSwitcher?.enabled && (
        config?.features.theme.publicSwitcher?.switcherType === 'combined' ? (
          <ThemeDesignSwitcher
            availableThemes={config.features.theme.publicSwitcher.availableThemes as any}
            availableDesigns={config.features.theme.publicSwitcher.availableDesigns as any}
            position={config.features.theme.publicSwitcher.position}
          />
        ) : (
          <>
            {config.features.theme.publicSwitcher.allowThemeSwitch && <ThemeSwitcher />}
            {config.features.theme.publicSwitcher.allowDesignSwitch && (
              <DesignSwitcher 
                availableDesigns={config.features.theme.publicSwitcher.availableDesigns as any}
              />
            )}
          </>
        )
      )}

      {/* Main Page Layout with Blocks */}
      {layoutConfig && (
        <MainPageLayout
          layout={layoutConfig.layout}
          blocks={{
            hero: (
              <HeroBlock 
                userData={userData} 
                config={config?.features.hero}
              />
            ),
            aboutMe: (
              <AboutMeBlock 
                userData={userData} 
                config={config?.features.aboutMe}
                onAboutMeClick={handleAboutMeClick}
              />
            ),
            projects: (
              <ProjectsSectionLayout 
                projects={currentProjects}
                config={config?.features.projects}
                layout={sectionLayouts?.projects}
                onProjectClick={handleProjectClick}
              />
            ),
            skills: (
              <SkillsSectionLayout 
                skills={skills}
                timeline={timeline}
                config={config?.features.skills}
                layout={sectionLayouts?.skills}
                onYearClick={handleYearClick}
              />
            ),
            timeline: timeline.length > 0 ? (
              <TimelineSectionLayout 
                timeline={timeline}
                skills={skills}
                config={config?.features.skills}
                layout={sectionLayouts?.timeline}
                onYearClick={handleYearClick}
              />
            ) : null,
            blog: (
              <BlogSectionLayout 
                posts={blogPosts}
                config={config?.features.blog}
                layout={sectionLayouts?.blog}
                onPostClick={handlePostClick}
              />
            ),
            contact: (
              <ContactBlock 
                userData={userData} 
                config={config?.features.contact}
              />
            )
          }}
        />
      )}

      {/* Terminal */}
      <Terminal 
        userData={userData} 
        isOpen={isTerminalOpen}
        onClose={handleTerminalClose}
      />

      {/* Regular Footer */}
      {config?.features.footer?.enabled && userData && (
        <Footer 
          userData={userData} 
          config={config.features.footer}
          terminalEnabled={config?.features.terminal?.enabled === true}
          onTerminalOpen={handleTerminalOpen}
        />
      )}

      {/* Year Overview Modal */}
      <YearOverviewModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        yearData={selectedYear}
        skills={skills}
      />

      {/* Project Detail Modal */}
      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        project={selectedProject}
      />

      {/* Blog Post Modal */}
      <BlogModal 
        isOpen={isBlogModalOpen}
        onClose={handleCloseBlogModal}
        post={selectedPost}
      />

      {/* About Me Modal */}
      <AboutMeModal 
        isOpen={isAboutMeModalOpen}
        onClose={handleCloseAboutMeModal}
        userData={userData}
      />
    </div>
  )
}
