import React from 'react';

export interface ProjectCardProps {
  project: {
    id?: number;
    title: string;
    description: string;
    thumbnail_url?: string;
    github_url?: string;
    demo_url?: string;
    technologies?: string[];
    stargazers_count?: number;
  };
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="galaxy-card p-6 rounded-lg hover:transform hover:scale-105 transition-all duration-300 bg-white shadow-md">
      {project.thumbnail_url && (
        <img
          src={project.thumbnail_url}
          alt={project.title}
          className="w-full h-40 object-cover rounded mb-4"
        />
      )}
      <h3 className="text-xl font-semibold mb-2 galaxy-text">{project.title}</h3>
      <p className="text-slate-600 mb-4">{project.description || 'No description available'}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {project.technologies?.map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-700"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-2">
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            GitHub
          </a>
        )}
        {project.demo_url && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Demo
          </a>
        )}
        {typeof project.stargazers_count === 'number' && (
          <div className="flex items-center text-slate-400 text-xs ml-auto">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .25a.75.75 0 01.673.418l3.058 6.197 6.839.994a.75.75 0 01.415 1.279l-4.948 4.823 1.168 6.811a.75.75 0 01-1.088.791L12 18.347l-6.117 3.216a.75.75 0 01-1.088-.79l1.168-6.812-4.948-4.823a.75.75 0 01.416-1.28l6.838-.993L11.327.668A.75.75 0 0112 .25z" />
            </svg>
            <span>{project.stargazers_count}</span>
          </div>
        )}
      </div>
    </div>
  );
}; 