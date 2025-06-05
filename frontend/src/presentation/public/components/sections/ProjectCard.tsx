import React from 'react';
import { Project } from '../../../../domain/entities/Project';

export interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="card p-4 rounded-lg max-w-sm mb-6 hover:transform hover:scale-105 transition-all duration-300" style={{ background: 'var(--theme-semantic-card)', color: 'var(--theme-semantic-card-foreground)', boxShadow: 'var(--theme-shadow-default)', borderRadius: 'var(--theme-border-radius-lg)' }}>
      {project.imageUrl && (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-28 object-cover rounded mb-3"
          style={{ borderRadius: 'var(--theme-border-radius-lg)' }}
        />
      )}
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--theme-primary)' }}>{project.title}</h3>
      <p className="mb-3" style={{ color: 'var(--theme-semantic-muted-foreground)' }}>{project.description || 'No description available'}</p>
      
      {/* Languages and Topics */}
      <div className="flex flex-wrap gap-2 mb-3">
        {project.details?.languages_map && Object.keys(project.details.languages_map).length > 0 && (
          <>
            {Object.entries(project.details.languages_map).map(([lang, bytes]) => (
              <span
                key={lang}
                className="px-2 py-1 text-xs rounded-full"
                style={{ background: 'var(--theme-semantic-accent-hover-background)', color: 'var(--theme-semantic-accent-foreground)' }}
                title={`${lang}: ${bytes} bytes`}
              >
                {lang}
              </span>
            ))}
          </>
        )}
        {project.topics?.map((topic) => (
          <span
            key={topic}
            className="px-2 py-1 text-xs rounded-full"
            style={{ background: 'var(--theme-semantic-muted)', color: 'var(--theme-semantic-muted-foreground)' }}
          >
            {topic}
          </span>
        ))}
      </div>

      {/* GitHub Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: 'var(--theme-semantic-muted-foreground)' }}>
        {typeof project.starsCount === 'number' && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .25a.75.75 0 01.673.418l3.058 6.197 6.839.994a.75.75 0 01.415 1.279l-4.948 4.823 1.168 6.811a.75.75 0 01-1.088.791L12 18.347l-6.117 3.216a.75.75 0 01-1.088-.79l1.168-6.812-4.948-4.823a.75.75 0 01.416-1.28l6.838-.993L11.327.668A.75.75 0 0112 .25z" />
            </svg>
            <span>{project.starsCount}</span>
          </div>
        )}
        {typeof project.forksCount === 'number' && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5.559 8.855c.166 1.183.789 3.207 3.087 4.079C11 13.829 11 14.534 11 15v.163c-1.44.434-2.5 1.757-2.5 3.337 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337V15c0-.466 0-1.171 2.354-2.065 2.298-.872 2.921-2.896 3.087-4.079C19.912 8.441 21 7.102 21 5.5 21 3.57 19.43 2 17.5 2S14 3.57 14 5.5c0 1.552 1.022 2.855 2.424 3.313-.21.894-.886 2.346-3.262 3.235C10.586 12.322 10 13.102 10 14v.163c-1.44.434-2.5 1.757-2.5 3.337 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337V14c0-.898-.586-1.678-2.162-2.452-2.376-.889-3.052-2.341-3.262-3.235C8.978 8.355 10 7.052 10 5.5 10 3.57 8.43 2 6.5 2S3 3.57 3 5.5c0 1.602 1.088 2.941 2.559 3.355zM17.5 4c.827 0 1.5.673 1.5 1.5S18.327 7 17.5 7 16 6.327 16 5.5 16.673 4 17.5 4zm-11 0C7.327 4 8 4.673 8 5.5S7.327 7 6.5 7 5 6.327 5 5.5 5.673 4 6.5 4zm5.5 14.5c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5.673-1.5 1.5-1.5 1.5.673 1.5 1.5z" />
            </svg>
            <span>{project.forksCount}</span>
          </div>
        )}
        {typeof project.watchersCount === 'number' && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            <span>{project.watchersCount}</span>
          </div>
        )}
        {typeof project.openIssuesCount === 'number' && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>{project.openIssuesCount}</span>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="flex items-center gap-4 mt-2">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium"
            style={{ color: 'var(--theme-primary)' }}
          >
            GitHub
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium"
            style={{ color: 'var(--theme-secondary)' }}
          >
            Demo
          </a>
        )}
        {project.homepageUrl && (
          <a
            href={project.homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium"
            style={{ color: 'var(--theme-accent)' }}
          >
            Homepage
          </a>
        )}
      </div>

      {/* Last Updated */}
      {project.updatedAt && (
        <div className="text-xs mt-2" style={{ color: 'var(--theme-semantic-muted-foreground)' }}>
          Last updated: {new Date(project.updatedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}; 