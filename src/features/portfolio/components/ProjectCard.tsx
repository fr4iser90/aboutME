import type { Project } from '../types'

interface ProjectCardProps {
  project: Project
  onDetailsClick?: (project: Project) => void
}

// Configuration - Adjust these values to change preview length
const DESCRIPTION_PREVIEW_LINES = 2 // Number of lines to show in preview
const DESCRIPTION_MAX_LENGTH = 120 // Maximum characters before truncation
const SHOW_BADGES = false // Set to false to hide all badges

export default function ProjectCard({ project, onDetailsClick }: ProjectCardProps) {
  // Create preview description
  const createPreviewDescription = (description: string) => {
    if (!description || description === 'No description available') {
      return 'No description available'
    }
    
    // Split by lines and take first N lines
    const lines = description.split('\n')
    const previewLines = lines.slice(0, DESCRIPTION_PREVIEW_LINES)
    let preview = previewLines.join('\n')
    
    // If still too long, truncate by character count
    if (preview.length > DESCRIPTION_MAX_LENGTH) {
      preview = preview.substring(0, DESCRIPTION_MAX_LENGTH).trim() + '...'
    }
    
    return preview
  }

  const previewDescription = createPreviewDescription(project.description)
  const hasMoreContent = project.description && 
    (project.description.split('\n').length > DESCRIPTION_PREVIEW_LINES || 
     project.description.length > DESCRIPTION_MAX_LENGTH)

  return (
    <div className="project-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold group-hover:text-neon-blue smooth-transition">
          {project.name}
        </h3>
        <span className="px-3 py-1 bg-neon-blue/20 text-neon-blue text-sm rounded-full border border-neon-blue/30">
          {project.language}
        </span>
      </div>
      
      <p className="text-gray-200 mb-6 text-base leading-relaxed">
        {previewDescription}
        {hasMoreContent && (
          <span className="text-neon-blue/70 text-sm ml-1">...</span>
        )}
      </p>
      
      {SHOW_BADGES && project.topics && project.topics.length > 0 && (
        <div className="project-card__topics">
          {project.topics.slice(0, 4).map((topic, index) => {
            // Different colors for variety
            const colors = [
              'bg-neon-blue/10 text-neon-blue border-neon-blue/20 hover:bg-neon-blue/20',
              'bg-neon-purple/10 text-neon-purple border-neon-purple/20 hover:bg-neon-purple/20',
              'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20 hover:bg-neon-cyan/20',
              'bg-neon-green/10 text-neon-green border-neon-green/20 hover:bg-neon-green/20'
            ]
            
            return (
              <span 
                key={topic} 
                className={`project-card__topic ${colors[index % colors.length]}`}
              >
                {topic}
              </span>
            )
          })}
          {project.topics.length > 4 && (
            <span className="project-card__topic-more">
              +{project.topics.length - 4}
            </span>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="text-neon-pink">⭐</span>
          <span className="font-semibold">{project.stars}</span>
        </div>
        <div className="project-card__buttons">
          {onDetailsClick && (
            <button 
              onClick={() => onDetailsClick(project)}
              className="btn-neon project-card__button"
            >
              <svg className="project-card__button-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              Details
            </button>
          )}
          <button 
            onClick={() => window.open(project.githubUrl, '_blank')}
            className="btn-neon project-card__button"
          >
            <svg className="project-card__button-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
            </svg>
            View Code
          </button>
        </div>
      </div>
    </div>
  )
}
