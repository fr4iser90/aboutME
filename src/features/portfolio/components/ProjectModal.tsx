'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/features/shared/components/BaseModal'
import { MarkdownParser, type ParsedMarkdown } from '@/features/shared/services/markdownParser'
import type { Project } from '../types'
import { parseFrontmatter } from '../utils/frontmatterParser'
import { frontmatterToBlocks } from '../utils/frontmatterToBlocks'
import { getAllSectionLayouts, type SectionLayoutsConfig } from '@/features/shared/utils/layoutConfig'
import DetailLayoutRenderer from './layouts/DetailLayoutRenderer'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
}

export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const [projectDetails, setProjectDetails] = useState<string | null>(null)
  const [parsedMarkdown, setParsedMarkdown] = useState<ParsedMarkdown | null>(null)
  const [frontmatter, setFrontmatter] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [sectionLayouts, setSectionLayouts] = useState<SectionLayoutsConfig>({})

  useEffect(() => {
    if (isOpen && project) {
      loadProjectDetails(project)
      loadSectionLayouts()
    }
  }, [isOpen, project])

  const loadSectionLayouts = async () => {
    try {
      const layouts = await getAllSectionLayouts()
      setSectionLayouts(layouts)
    } catch (error) {
      console.error('Error loading section layouts:', error)
    }
  }

  const loadProjectDetails = async (project: Project) => {
    setLoadingDetails(true)
    
    try {
      // First try to load from JSON (pre-parsed HTML)
      const jsonResponse = await fetch(`/data/projects/projects.json`)
      if (jsonResponse.ok) {
        const projectData = await jsonResponse.json()
        const projectFromJson = projectData.projects.find((p: any) => p.id === project.id)
        
        if (projectFromJson && projectFromJson.htmlContent) {
          // Use pre-parsed HTML for better performance
          const parsed: ParsedMarkdown = {
            sections: [
              {
                id: 'content',
                title: project.name,
                level: 1,
                content: [
                  {
                    type: 'html',
                    content: projectFromJson.htmlContent
                  }
                ]
              }
            ]
          }
          setProjectDetails(projectFromJson.content || '')
          setParsedMarkdown(parsed)
          setLoadingDetails(false)
          return
        }
      }
      
      // Fallback to loading Markdown file
      const response = await fetch(`/data/projects/${project.name.toLowerCase()}.md`)
      if (response.ok) {
        const markdown = await response.text()
        setProjectDetails(markdown)
        
        // Parse frontmatter for layout config
        const { content: markdownContent, frontmatter: parsedFrontmatter } = parseFrontmatter(markdown)
        setFrontmatter(parsedFrontmatter)
        
        // Parse markdown content (without frontmatter)
        // Pass GitHub URL to parser for relative link resolution
        const githubUrl = parsedFrontmatter.github || project.githubUrl || ''
        const parser = new MarkdownParser(markdownContent, githubUrl, project.name)
        const parsed = parser.parse()
        setParsedMarkdown(parsed)
      } else {
        setProjectDetails(null)
        setParsedMarkdown(null)
      }
    } catch (error) {
      console.error('Error loading project details:', error)
      setProjectDetails(null)
      setParsedMarkdown(null)
    } finally {
      setLoadingDetails(false)
    }
  }



  // Prepare flags for the modal header (kompakte Status-Anzeige)
  const prepareFlags = () => {
    const flags = []
    
    if (parsedMarkdown?.metadata?.status) {
      flags.push({
        type: 'status' as const,
        value: parsedMarkdown.metadata.status
      })
    }
    
    if (parsedMarkdown?.metadata?.difficulty) {
      flags.push({
        type: 'difficulty' as const,
        value: parsedMarkdown.metadata.difficulty
      })
    }
    
    if (parsedMarkdown?.metadata?.category) {
      flags.push({
        type: 'category' as const,
        value: parsedMarkdown.metadata.category
      })
    }
    
    return flags
  }

  // Prepare badges for detailed information
  const prepareBadges = () => {
    const badges = []
    
    if (parsedMarkdown?.metadata?.technologies && parsedMarkdown.metadata.technologies.length > 0) {
      badges.push({
        label: 'Technologies',
        type: 'technology' as const,
        value: parsedMarkdown.metadata.technologies.slice(0, 3).join(', ') + 
               (parsedMarkdown.metadata.technologies.length > 3 ? '...' : '')
      })
    }
    
    return badges
  }

  if (!project) return null

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${project.name} - Project Details`}
      flags={prepareFlags()}
      badges={prepareBadges()}
    >
      <div className="project-detail-modal">
        {loadingDetails ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
            <span className="ml-3 text-gray-300">Loading project details...</span>
          </div>
        ) : parsedMarkdown ? (
          (() => {
            const detailLayout = sectionLayouts.projects?.detailLayout || 'sidebar-left'
            const pageConfig = frontmatterToBlocks(frontmatter || {}, parsedMarkdown.sections)
            
            return (
              <DetailLayoutRenderer
                layout={detailLayout}
                config={pageConfig}
                markdownSections={parsedMarkdown.sections}
                githubUrl={frontmatter?.github || project.githubUrl}
                projectName={project.name}
              />
            )
          })()
        ) : (
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400">No project details available.</p>
          </div>
        )}
      </div>
    </BaseModal>
  )
}
