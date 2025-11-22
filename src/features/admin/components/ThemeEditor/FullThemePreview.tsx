'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/features/header'
import { Hero } from '@/features/hero'
import { Footer } from '@/features/footer'
import { ProjectCard, AboutMeSection, SkillCard } from '@/features/portfolio'
import { ContactSection } from '@/features/shared'
import { TerminalSection } from '@/features/terminal'
import { config as appConfig } from '@/features/shared'
import type { Project } from '@/features/portfolio/types'
import '@/features/admin/styles/theme-preview.css'

interface FullThemePreviewProps {
  themeConfig: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
  }
  design?: string
  backgroundImage?: string
  config?: any
  currentTheme?: 'dark' | 'light'
}

interface UserData {
  username: string
  name: string
  bio: string
  avatar: string
  avatar_url: string
  location: string
  followers: number
  publicRepos?: number
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

// Skill type matching main page
interface Skill {
  name: string
  count: number
  level: string
  category: string
  icon: string
}

export default function FullThemePreview({ themeConfig, design, backgroundImage, config: previewConfig, currentTheme = 'dark' }: FullThemePreviewProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load config - use the same endpoint as main page
        try {
          const configRes = await fetch(appConfig.api.config)
          if (configRes.ok) {
            const configData = await configRes.json()
            // Transform config.json structure to match Config interface (like main page)
            const transformedConfig = {
              features: {
                projects: configData.portfolio?.features?.projects || configData.features?.projects || { enabled: true, showFeatured: true, showAll: true },
                skills: configData.portfolio?.features?.skills || configData.features?.skills || { enabled: true, showTimeline: true },
                aboutMe: configData.portfolio?.features?.aboutMe || configData.features?.aboutMe || { enabled: true },
                blog: configData.portfolio?.features?.blog || configData.features?.blog || { enabled: false },
                contact: configData.portfolio?.features?.contact || configData.features?.contact || { enabled: false },
                hero: configData.portfolio?.features?.hero || configData.features?.hero || { enabled: true, variant: 'floating' },
                theme: configData.portfolio?.features?.theme || configData.features?.theme || { enabled: true, defaultTheme: 'dark' },
                header: configData.portfolio?.features?.header || configData.features?.header || { enabled: true },
                footer: configData.portfolio?.features?.footer || configData.features?.footer || { enabled: true },
                background: configData.portfolio?.features?.background || configData.features?.background || { useDefault: true, defaultImage: '/assets/galaxy.png' }
              },
              layout: configData.portfolio?.layout || configData.layout || {
                sections: {
                  order: ['hero', 'about', 'projects', 'skills', 'blog', 'contact']
                }
              }
            }
            setConfig(transformedConfig)
          }
        } catch (e) {
          console.warn('Could not load config:', e)
        }

        // Load user data - transform like main page
        try {
          const userRes = await fetch(appConfig.api.user)
          if (userRes.ok) {
            const user = await userRes.json()
            // Transform user data like main page
            const transformedUser: UserData = {
              ...user,
              avatar_url: user.avatar || user.avatar_url,
              public_repos: user.publicRepos || user.public_repos || 0,
              publicRepos: user.publicRepos || user.public_repos || 0,
              followers: user.followers || 0,
              location: user.location || ''
            }
            setUserData(transformedUser)
          }
        } catch (e) {
          console.warn('Could not load user data:', e)
        }

        // Load projects - same structure as main page
        try {
          const projectsRes = await fetch(appConfig.api.projects)
          if (projectsRes.ok) {
            const projectsData = await projectsRes.json()
            // Transform to match Project type
            if (projectsData.projects) {
              setProjects(projectsData.projects.filter((p: any) => p.featured).slice(0, 3))
            } else if (Array.isArray(projectsData)) {
              setProjects(projectsData.slice(0, 3))
            }
          }
        } catch (e) {
          console.warn('Could not load projects:', e)
        }

        // Load skills - same structure as main page
        try {
          const skillsRes = await fetch(appConfig.api.skills)
          if (skillsRes.ok) {
            const skillsData = await skillsRes.json()
            // Transform to match Skill type (languages, frameworks, tools)
            if (skillsData.languages || skillsData.frameworks || skillsData.tools) {
              const allSkills = [...skillsData.languages || [], ...skillsData.frameworks || [], ...skillsData.tools || []]
              // Ensure all required fields
              const transformedSkills = allSkills.map((s: any) => ({
                name: s.name || '',
                count: s.count || 0,
                level: s.level || 'intermediate',
                category: s.category || '',
                icon: s.icon || ''
              })).slice(0, 6)
              setSkills(transformedSkills)
            } else if (Array.isArray(skillsData)) {
              const transformedSkills = skillsData.map((s: any) => ({
                name: s.name || '',
                count: s.count || 0,
                level: s.level || 'intermediate',
                category: s.category || '',
                icon: s.icon || ''
              })).slice(0, 6)
              setSkills(transformedSkills)
            }
          }
        } catch (e) {
          console.warn('Could not load skills:', e)
        }
      } catch (error) {
        console.error('Error loading preview data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div 
        className="full-theme-preview"
        data-theme={currentTheme}
        data-design={design || 'glassmorphism'}
        style={{
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p>Loading preview...</p>
        </div>
      </div>
    )
  }

  const finalConfig = previewConfig || config

  return (
    <div 
      className="full-theme-preview"
      data-theme={currentTheme}
      data-design={design || 'glassmorphism'}
      style={{
        minHeight: '100%'
      }}
    >
      {/* Header */}
      {finalConfig?.features?.header?.enabled && (
        <Header config={finalConfig.features.header} />
      )}

      {/* Hero Section */}
      {finalConfig?.features?.hero?.enabled && userData && (
        <Hero userData={userData} config={finalConfig.features.hero} />
      )}

      {/* About Me Section */}
      {finalConfig?.features?.aboutMe?.enabled && userData?.aboutMe && userData && (
        <TerminalSection id="about" title="About Me">
          <AboutMeSection userData={userData} onAboutMeClick={() => {}} />
        </TerminalSection>
      )}

      {/* Projects Section */}
      {finalConfig?.features?.projects?.enabled && projects.length > 0 && (
        <TerminalSection id="projects" title="Projects">
          <div className="projects-grid">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TerminalSection>
      )}

      {/* Skills Section */}
      {finalConfig?.features?.skills?.enabled && skills.length > 0 && (
        <TerminalSection id="skills" title="Skills & Technologies">
          <div className="skills-grid">
            {skills.slice(0, 6).map((skill, index) => (
              <SkillCard key={index} skill={skill} />
            ))}
          </div>
        </TerminalSection>
      )}

      {/* Contact Section */}
      {finalConfig?.features?.contact?.enabled && userData && (
        <TerminalSection id="contact" title="Contact">
          <ContactSection userData={userData as any} />
        </TerminalSection>
      )}

      {/* Footer */}
      {finalConfig?.features?.footer?.enabled && userData && (
        <Footer 
          userData={userData as any} 
          config={finalConfig.features.footer}
        />
      )}
    </div>
  )
}

