'use client'

import { useState } from 'react'
import { TerminalSection } from '@/features/terminal'
import { ProjectCard } from '@/features/portfolio'
import type { Project } from '../../types'

interface ProjectsSectionLayoutProps {
  projects: Project[]
  config?: {
    enabled?: boolean
    showFeatured?: boolean
    showAll?: boolean
  }
  layout?: {
    template?: 'grid' | 'masonry' | 'carousel' | 'list'
  }
  onProjectClick?: (project: Project) => void
}

export default function ProjectsSectionLayout({ 
  projects, 
  config, 
  layout,
  onProjectClick 
}: ProjectsSectionLayoutProps) {
  const [currentView, setCurrentView] = useState<'featured' | 'all'>('featured')
  const template = layout?.template || 'grid'
  
  if (!config?.enabled) return null
  
  const currentProjects = currentView === 'featured' 
    ? projects.filter(p => p.featured)
    : projects
  
  // Grid Layout (default)
  if (template === 'grid') {
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
  
  // Masonry Layout
  if (template === 'masonry') {
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
        
        <div className="projects-masonry">
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
  
  // List Layout
  if (template === 'list') {
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
        
        <div className="projects-list">
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
  
  // Carousel Layout (fallback to grid for now)
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

