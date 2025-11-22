'use client'

import { useState } from 'react'
import { type ValidationResult } from '../services/jsonValidator'

interface FileItem {
  category: string
  filename: string
  path: string
}

interface ProjectInfo {
  name: string
  status: 'active' | 'hidden' | 'draft'
  featured: boolean
  category?: string
}

interface FeatureStatus {
  id: string
  name: string
  enabled: boolean
  category: 'content' | 'presentation' | 'design' | 'administration'
  requires?: string[]
}

interface ThemeInfo {
  enabled: boolean
  defaultTheme: 'dark' | 'light' | 'auto'
  availableThemes: string[]
  customThemes: number
}

interface LayoutInfo {
  sectionOrder: string[]
  spacing: 'small' | 'medium' | 'large'
  template: 'default' | 'grid' | 'list' | 'card'
  headerStyle: 'default' | 'minimal' | 'transparent'
  footerStyle: 'default' | 'minimal' | 'centered'
}

interface StylingInfo {
  colorPalette: {
    primary: string
    secondary: string
    accent: string
  }
  typography: {
    fontFamily: string
    fontSize: 'small' | 'medium' | 'large'
  }
  effects: {
    glassmorphism: boolean
    shadows: boolean
  }
}

interface BuildReview {
  projects: ProjectInfo[]
  files: {
    projects: number
    blog: number
    about: number
  }
  validation: {
    complete: number
    partial: number
    empty: number
    totalIssues: number
  }
  features: {
    content: FeatureStatus[]
    presentation: FeatureStatus[]
    design: FeatureStatus[]
    administration: FeatureStatus[]
  }
  buildSettings: {
    includeInactive: boolean
    featuredProjects: {
      enabled: boolean
      minStars: number
    }
    showAllProjects: boolean
  }
  design: {
    theme: ThemeInfo
    layout: LayoutInfo
    styling: StylingInfo
    hero: {
      enabled: boolean
      variant: 'floating' | 'card' | 'fullscreen' | 'minimal' | 'split'
      animation: boolean
      showStats: boolean
    }
  }
}

export function useBuildWithValidation() {
  const [isBuilding, setIsBuilding] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResults, setValidationResults] = useState<Map<string, ValidationResult>>(new Map())
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false)
  const [buildReview, setBuildReview] = useState<BuildReview | null>(null)

  /**
   * Lädt alle JSON-Dateien aus public/data
   */
  const loadAllFiles = async (): Promise<FileItem[]> => {
    try {
      const response = await fetch('/api/editor/json-files')
      if (!response.ok) {
        throw new Error('Failed to load files')
      }
      const data = await response.json()
      return data.files || []
    } catch (error) {
      console.error('Error loading files:', error)
      return []
    }
  }

  /**
   * Validiert alle JSON-Dateien
   */
  const validateAllFiles = async () => {
    setIsValidating(true)
    try {
      // Verwende die validate-files API
      const response = await fetch('/api/setup/validate-files')
      if (!response.ok) {
        throw new Error('Failed to validate files')
      }
      
      const data = await response.json()
      const results = new Map<string, ValidationResult>()
      
      // Konvertiere results object zu Map
      if (data.results) {
        Object.entries(data.results).forEach(([filePath, result]: [string, any]) => {
          results.set(filePath, result as ValidationResult)
        })
      }
      
      setValidationResults(results)
      return results
    } catch (error) {
      console.error('Validation error:', error)
      setValidationResults(new Map())
      return new Map<string, ValidationResult>()
    } finally {
      setIsValidating(false)
    }
  }

  /**
   * Konvertiert /data/... Pfad zu relativem Pfad für Save API
   */
  const getRelativePath = (filePath: string): string => {
    // Entferne /data/ Präfix
    const withoutPrefix = filePath.replace(/^\/data\//, '')
    
    // Entferne /posts/ für blog (API erwartet blog/posts/file.md)
    if (withoutPrefix.startsWith('blog/posts/')) {
      return withoutPrefix // Bereits korrekt: blog/posts/file.md
    }
    
    return withoutPrefix
  }

  /**
   * Entfernt leere Abschnitte aus Dateien mit Problemen
   * Für JSON-Dateien: Entfernt leere/ungültige Felder
   */
  const handleRemoveEmptySections = async () => {
    try {
      console.log('🗑️ Cleaning invalid JSON files...')
      
      let processedFiles = 0
      let fixedErrors = 0
      
      // Für jede Datei mit Problemen
      for (const [filePath, result] of Array.from(validationResults.entries())) {
        if (!result.isValid && result.errors.length > 0) {
          try {
            // Lade aktuellen Inhalt
            const response = await fetch(`/api/editor/json-file?path=${encodeURIComponent(filePath)}`)
            if (response.ok) {
              const data = await response.json()
              const content = data.content
              
              // Versuche JSON zu parsen und zu bereinigen
              try {
                const jsonData = typeof content === 'string' ? JSON.parse(content) : content
                
                // Entferne Felder mit undefined/null values (optional)
                const cleaned = JSON.parse(JSON.stringify(jsonData, (key, value) => {
                  return value === undefined ? null : value
                }))
                
                // Speichere bereinigten Inhalt
                const saveResponse = await fetch('/api/editor/json-file', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    path: filePath,
                    content: cleaned
                  })
                })
                
                if (saveResponse.ok) {
                  processedFiles++
                  fixedErrors += result.errors.length
                  console.log(`✅ Fixed ${result.errors.length} errors in ${filePath.split('/').pop()}`)
                }
              } catch (parseError) {
                console.error(`Error parsing JSON for ${filePath}:`, parseError)
              }
            }
          } catch (error) {
            console.error(`Error processing ${filePath}:`, error)
          }
        }
      }
      
      // Validiere erneut nach Cleanup
      await validateAllFiles()
      
      console.log(`✅ Cleanup completed: ${processedFiles} files processed, ${fixedErrors} errors fixed`)
    } catch (error) {
      console.error('Error cleaning files:', error)
    }
  }

  /**
   * Führt den Build-Prozess aus (JSON-only)
   * Setzt Build-Status auf "published" nach erfolgreichem Build
   */
  const performBuild = async () => {
    setIsBuilding(true)
    try {
      console.log('🚀 Starting build process...')
      
      // Validiere alle Dateien erneut vor dem Build
      await validateAllFiles()
      
      // Setze published: true automatisch nach erfolgreichem Build
      try {
        const statusResponse = await fetch('/api/site/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            published: true
          })
        })

        if (statusResponse.ok) {
          console.log('✅ Published status set after successful build')
        } else {
          console.warn('⚠️ Failed to set published status, but build succeeded')
        }
      } catch (error) {
        console.warn('⚠️ Failed to set published status:', error)
      }
      
      // Refresh page to update status
      window.location.reload()
    } catch (error) {
      console.error('Build failed:', error)
      alert(`Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setIsBuilding(false)
    }
  }

  /**
   * Parst JSON-Content (ersetzt Frontmatter-Parsing)
   */
  const parseJsonContent = (content: any) => {
    try {
      const jsonData = typeof content === 'string' ? JSON.parse(content) : content
      return { data: jsonData }
    } catch (error) {
      console.error('Error parsing JSON:', error)
      return { data: null }
    }
  }

  /**
   * Lädt Features & Settings von API
   */
  const loadFeaturesAndSettings = async () => {
    try {
      const response = await fetch('/api/setup/config')
      if (!response.ok) {
        throw new Error('Failed to load config')
      }
      const data = await response.json()
      return data.config || {}
    } catch (error) {
      console.error('Error loading features:', error)
      return {}
    }
  }

  /**
   * Erstellt Features-Liste mit Kategorien
   */
  const createFeaturesList = (config: any): BuildReview['features'] => {
    const portfolioFeatures = config.portfolio?.features || {}
    
    return {
      content: [
        {
          id: 'projects',
          name: 'Portfolio Projects',
          enabled: portfolioFeatures.projects?.enabled !== false,
          category: 'content'
        },
        {
          id: 'skills',
          name: 'Skills Section',
          enabled: portfolioFeatures.skills?.enabled !== false,
          category: 'content'
        },
        {
          id: 'aboutMe',
          name: 'About Section',
          enabled: portfolioFeatures.aboutMe?.enabled !== false,
          category: 'content'
        },
        {
          id: 'blog',
          name: 'Blog',
          enabled: config.features?.blog === true,
          category: 'content'
        }
      ],
      presentation: [
        {
          id: 'contact',
          name: 'Contact Form',
          enabled: portfolioFeatures.contact?.enabled === true,
          category: 'presentation'
        },
        {
          id: 'terminal',
          name: 'Terminal Game',
          enabled: config.features?.terminal === true,
          category: 'presentation'
        }
      ],
      design: [
        {
          id: 'hero',
          name: 'Hero Section',
          enabled: portfolioFeatures.hero?.enabled !== false,
          category: 'design'
        },
        {
          id: 'theme',
          name: 'Theme Switcher',
          enabled: portfolioFeatures.theme?.enabled !== false,
          category: 'design'
        },
        {
          id: 'layout',
          name: 'Layout Config',
          enabled: true, // Layout ist immer aktiv
          category: 'design'
        },
        {
          id: 'styling',
          name: 'Style Customizer',
          enabled: false, // Später
          category: 'design'
        }
      ],
      administration: [
        {
          id: 'auth',
          name: 'Authentication',
          enabled: config.features?.auth === true,
          category: 'administration'
        },
        {
          id: 'editor',
          name: 'Content Editor',
          enabled: config.features?.editor === true,
          category: 'administration',
          requires: ['auth']
        },
        {
          id: 'fileUpload',
          name: 'Media Library',
          enabled: config.features?.fileUpload === true,
          category: 'administration',
          requires: ['auth']
        },
        {
          id: 'guestbook',
          name: 'Guestbook',
          enabled: config.features?.guestbook === true,
          category: 'administration',
          requires: ['auth']
        }
      ]
    }
  }

  /**
   * Erstellt Design-Info (Themes, Layouts, Styling)
   */
  const createDesignInfo = (config: any): BuildReview['design'] => {
    const themeConfig = config.portfolio?.features?.theme || {}
    const heroConfig = config.portfolio?.features?.hero || {}
    const layoutConfig = config.portfolio?.layout || {}
    
    return {
      theme: {
        enabled: themeConfig.enabled !== false,
        defaultTheme: themeConfig.defaultTheme || 'dark',
        availableThemes: Object.keys(themeConfig.themes || { dark: {}, light: {} }),
        customThemes: 0 // Später
      },
      layout: {
        sectionOrder: layoutConfig.sections?.order || ['hero', 'about', 'projects', 'skills', 'blog', 'contact'],
        spacing: layoutConfig.sections?.spacing || 'large',
        template: 'default', // Später
        headerStyle: 'default', // Später
        footerStyle: 'default' // Später
      },
      styling: {
        colorPalette: {
          primary: themeConfig.themes?.dark?.primary || '#6366f1',
          secondary: themeConfig.themes?.dark?.secondary || '#8b5cf6',
          accent: '#00d4ff' // Neon Blue
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 'medium'
        },
        effects: {
          glassmorphism: true,
          shadows: true
        }
      },
      hero: {
        enabled: heroConfig.enabled !== false,
        variant: heroConfig.variant || 'floating',
        animation: heroConfig.animation?.enabled !== false,
        showStats: heroConfig.showStats !== false
      }
    }
  }

  /**
   * Erstellt Build-Settings Info
   */
  const createBuildSettings = (config: any): BuildReview['buildSettings'] => {
    const projectsConfig = config.portfolio?.features?.projects || {}
    
    return {
      includeInactive: false, // Standard: nur aktive Projekte
      featuredProjects: {
        enabled: projectsConfig.showFeatured !== false,
        minStars: projectsConfig.featuredCriteria?.minStars || 5
      },
      showAllProjects: projectsConfig.showAll === true
    }
  }

  /**
   * Erstellt Build-Review mit Projekten und Dateien-Info
   */
  const createBuildReview = async (files: FileItem[], validationResults: Map<string, ValidationResult>): Promise<BuildReview> => {
    const projects: ProjectInfo[] = []
    const fileCounts = {
      projects: 0,
      blog: 0,
      about: 0
    }

    // Zähle Dateien
    files.forEach(file => {
      if (file.category === 'projects') fileCounts.projects++
      else if (file.category === 'blog') fileCounts.blog++
      else if (file.category === 'about') fileCounts.about++
    })

    // Lade Projekt-Info (nur für Projekte)
    for (const file of files.filter(f => f.category === 'projects')) {
      try {
        // Projekte sind in projects/details/ gespeichert
        const filePath = `projects/details/${file.filename}`
        const response = await fetch(`/api/editor/json-file?path=${encodeURIComponent(filePath)}`)
        if (response.ok) {
          const data = await response.json()
          const { data: jsonData } = parseJsonContent(data.content)
          
          if (jsonData) {
            projects.push({
              name: jsonData.name || file.name,
              status: (jsonData.status as 'active' | 'hidden' | 'draft') || 'active',
              featured: jsonData.featured === true,
              category: jsonData.category
            })
          }
        }
      } catch (error) {
        console.error(`Error loading project ${file.filename}:`, error)
      }
    }

    // Validation Summary
    const validFiles = Array.from(validationResults.values()).filter(r => r.isValid)
    const invalidFiles = Array.from(validationResults.values()).filter(r => !r.isValid)
    const totalIssues = Array.from(validationResults.values()).reduce((sum, r) => sum + r.errors.length, 0)

    // Lade Features & Settings
    const config = await loadFeaturesAndSettings()
    const features = createFeaturesList(config)
    const buildSettings = createBuildSettings(config)
    const design = createDesignInfo(config)

    return {
      projects,
      files: fileCounts,
      validation: {
        complete: validFiles.length,
        partial: 0, // Not used for JSON validation
        empty: invalidFiles.length,
        totalIssues
      },
      features,
      buildSettings,
      design
    }
  }

  /**
   * Hauptfunktion: Validiert und zeigt Review-Modal (IMMER)
   * Setzt validated: true VOR Build wenn Validation erfolgreich
   */
  const handleBuild = async () => {
    // Validiere alle Dateien
    const files = await loadAllFiles()
    const results = await validateAllFiles()
    
    // Prüfe ob Validation erfolgreich war (keine invalid files)
    const hasInvalidFiles = Array.from(results.values()).some(result => !result.isValid)
    const validationSuccessful = !hasInvalidFiles && results.size > 0
    
    // Setze validated: true VOR Build wenn Validation erfolgreich
    if (validationSuccessful) {
      try {
        const statusResponse = await fetch('/api/site/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            validated: true
          })
        })
        
        if (statusResponse.ok) {
          console.log('✅ Validation successful, validated status set')
        } else {
          console.warn('⚠️ Failed to set validated status')
        }
      } catch (error) {
        console.warn('⚠️ Failed to set validated status:', error)
      }
    }
    
    // Erstelle Build-Review
    const review = await createBuildReview(files, results)
    setBuildReview(review)
    
    // Zeige Modal IMMER (mit Review)
    setIsValidationModalOpen(true)
  }

  return {
    isBuilding,
    isValidating,
    validationResults,
    isValidationModalOpen,
    setIsValidationModalOpen,
    buildReview,
    handleBuild,
    performBuild,
    handleRemoveEmptySections,
    validateAllFiles
  }
}

