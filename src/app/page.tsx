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
      variant?: 'floating' | 'card' | 'fullscreen' | 'minimal' | 'split' | 'inline'
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
      defaultDesign?: string
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
    header?: {
      enabled: boolean
      variant?: 'default' | 'minimal' | 'transparent'
      showBranding?: boolean
      showNavigation?: boolean
    }
    footer?: {
      enabled: boolean
      variant?: 'default' | 'minimal' | 'centered'
      showCopyright?: boolean
      showTerminalButton?: boolean
    }
    terminal?: {
      enabled: boolean
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

        const readJson = async (settled: PromiseSettledResult<Response>) => {
          if (settled.status !== 'fulfilled' || !settled.value.ok) return null
          try {
            return await settled.value.json()
          } catch {
            return null
          }
        }
        
        const user = await readJson(responses[0])
        const projectsData = await readJson(responses[1])
        const skillsData = await readJson(responses[2])
        const configData = await readJson(responses[3])
        const blogData = await readJson(responses[4])
        const timelineData = await readJson(responses[5])

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
          const list = Array.isArray(projectsData)
            ? projectsData
            : (projectsData.projects || [])
          setAllProjects(list)
          const featured = list.filter((p: Project) => p.featured)
          setProjects((featured.length ? featured : list).slice(0, 6))
        }

        // Set skills data (supports array lists or language maps)
        if (skillsData) {
          const toSkillList = (value: unknown): Skill[] => {
            if (Array.isArray(value)) return value as Skill[]
            if (value && typeof value === 'object') {
              return Object.entries(value as Record<string, unknown>).map(([name, meta]) => {
                if (meta && typeof meta === 'object') {
                  return { name, ...(meta as object) } as Skill
                }
                return {
                  name,
                  count: typeof meta === 'number' ? meta : 0,
                  level: 'intermediate',
                  category: 'language',
                  icon: 'code',
                } as Skill
              })
            }
            return []
          }
          const merged = [
            ...toSkillList(skillsData.languages),
            ...toSkillList(skillsData.frameworks),
            ...toSkillList(skillsData.tools),
          ]
          setSkills(merged.slice(0, 12))
        }

        // Set blog data
        if (blogData) {
          setBlogPosts(blogData.posts || blogData.blog || [])
        }

        // Set timeline data
        if (timelineData) {
          setTimeline(timelineData.timeline || [])
        }

        // Set config - transform structure if needed
        if (configData) {
          const rawFeatures = configData.portfolio?.features || configData.features || {}
          const asFeature = (value: unknown, extra: Record<string, unknown> = {}) => {
            if (value && typeof value === 'object') return { ...extra, ...(value as object) }
            return { enabled: !!value, ...extra }
          }
          // Transform config.json structure to match Config interface
          const transformedConfig: Config = {
            features: {
              projects: asFeature(rawFeatures.projects, { showFeatured: true, showAll: true }) as Config['features']['projects'],
              skills: asFeature(rawFeatures.skills, { showTimeline: true }) as Config['features']['skills'],
              aboutMe: asFeature(rawFeatures.aboutMe) as Config['features']['aboutMe'],
              blog: asFeature(rawFeatures.blog) as Config['features']['blog'],
              contact: asFeature(rawFeatures.contact) as Config['features']['contact'],
              hero: asFeature(rawFeatures.hero, { variant: 'inline' }) as Config['features']['hero'],
              theme: asFeature(rawFeatures.theme, { defaultTheme: 'dark' }) as Config['features']['theme'],
              header: asFeature(rawFeatures.header, { variant: 'default' }) as Config['features']['header'],
              footer: asFeature(rawFeatures.footer, { variant: 'default' }) as Config['features']['footer'],
              terminal: asFeature(rawFeatures.terminal) as Config['features']['terminal'],
              background: (rawFeatures.background && typeof rawFeatures.background === 'object'
                ? rawFeatures.background
                : { useDefault: true, defaultImage: '/assets/galaxy.png' }) as any,
            },
            layout: configData.portfolio?.layout || configData.layout || {
              sections: {
                order: ['hero', 'about', 'projects', 'skills', 'blog', 'contact']
              }
            }
          }
          setConfig(transformedConfig)
        } else {
          // Safe defaults if config.json missing/invalid
          setConfig({
            features: {
              projects: { enabled: true, showFeatured: true, showAll: true },
              skills: { enabled: true, showTimeline: true },
              aboutMe: { enabled: true },
              blog: { enabled: false },
              contact: { enabled: true },
              hero: { enabled: true, variant: 'inline' },
              theme: { enabled: true, defaultTheme: 'dark' },
            },
            layout: { sections: { order: ['hero', 'about', 'projects', 'skills', 'blog', 'contact'] } }
          } as Config)
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

  // Get background image from config
  const backgroundImage = config?.features.background?.useDefault 
    ? config?.features.background?.defaultImage || '/assets/galaxy.png'
    : config?.features.background?.customImage

  return (
    <div className="min-h-screen text-white" data-main-page="true">
      {/* Dynamic Background - Only if no design is active */}
      {!hasDesign && <DynamicBackground backgroundImage={backgroundImage} />}
      
      {/* Header - Only on main page */}
      {config?.features.header?.enabled && (
        <Header
          config={{
            enabled: true,
            variant: config.features.header.variant || 'default',
            showBranding: config.features.header.showBranding,
            showNavigation: config.features.header.showNavigation,
          }}
          onAboutClick={handleAboutMeClick}
        />
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
                layout={sectionLayouts?.projects as any}
                onProjectClick={handleProjectClick}
              />
            ),
            skills: (
              <SkillsSectionLayout 
                skills={skills}
                timeline={timeline as any}
                config={config?.features.skills}
                layout={sectionLayouts?.skills as any}
                onYearClick={handleYearClick}
              />
            ),
            timeline:
              timeline.length > 0 && !config?.features.skills?.showTimeline ? (
              <TimelineSectionLayout 
                timeline={timeline as any}
                skills={skills}
                config={config?.features.skills}
                layout={sectionLayouts?.timeline as any}
                onYearClick={handleYearClick}
              />
            ) : null,
            blog: (
              <BlogSectionLayout 
                posts={blogPosts as any}
                config={config?.features.blog}
                layout={sectionLayouts?.blog as any}
                onPostClick={handlePostClick as any}
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
          config={{
            enabled: true,
            variant: config.features.footer.variant || 'default',
            showCopyright: config.features.footer.showCopyright,
            showTerminalButton: config.features.footer.showTerminalButton,
          }}
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
