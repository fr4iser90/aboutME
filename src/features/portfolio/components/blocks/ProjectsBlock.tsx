'use client'

import { useState } from 'react'
import { TerminalSection } from '@/features/terminal'
import { ProjectCard } from '@/features/portfolio'
import type { Project } from '@/features/portfolio/types'

interface ProjectsBlockProps {
  projects: Project[]
  config?: {
    enabled?: boolean
    showFeatured?: boolean
    showAll?: boolean
  }
  onProjectClick?: (project: Project) => void
}

export default function ProjectsBlock({ projects, config, onProjectClick }: ProjectsBlockProps) {
  const [currentView, setCurrentView] = useState<'featured' | 'all'>('featured')
  
  if (!config?.enabled) return null
  
  const currentProjects = currentView === 'featured' 
    ? projects.filter(p => p.featured)
    : projects
  
  return (
    <TerminalSection id="projects" title="Projects">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold neon-text">
          {currentView === 'featured' ? 'Featured Projects' : 'All Projects'}
        </h2>
        
        {config.showAll && (
          <div className="project-filters">
            <button
              onClick={() => setCurrentView('featured')}
              className={`btn-neon project-filters__btn ${currentView === 'featured' ? 'project-filters__btn--active' : ''}`}
            >
              Featured
            </button>
            <button
              onClick={() => setCurrentView('all')}
              className={`btn-neon project-filters__btn ${currentView === 'all' ? 'project-filters__btn--active' : ''}`}
            >
              All Projects
            </button>
          </div>
        )}
      </div>
      
      <div className="projects-grid">
        {currentProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onDetailsClick={onProjectClick}
          />
        ))}
      </div>
    </TerminalSection>
  )
}

