'use client';

import { useState, useEffect } from 'react';
import { config } from '@/domain/shared/utils/config';

interface Project {
  id: number;
  name: string;
  description: string;
  html_url: string;
  topics: string[];
  stargazers_count: number;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${config.backendUrl}/api/public/projects`);
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="projects-loader">
        <div className="projects-loader-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <section id="projects" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text text-center">Featured Projects</h2>
          <div className="text-center text-red-500">
            <p>Error loading projects: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!projects.length) {
    return (
      <section id="projects" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text text-center">Featured Projects</h2>
          <div className="text-center text-gray-500">
            <p>No projects found</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="projects-section">
      <div className="projects-container">
        <h2 className="projects-title">Featured Projects</h2>
        <div className="projects-grid">
          {projects.map((project) => (
            <a
              key={project.id}
              href={project.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card"
            >
              <h3 className="project-card-title">{project.name}</h3>
              <p className="project-card-desc">{project.description || 'No description available'}</p>
              <div className="project-card-topics">
                {project.topics?.map((topic) => (
                  <span
                    key={topic}
                    className="project-card-topic"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div className="project-card-stars">
                <svg className="project-card-star-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .25a.75.75 0 01.673.418l3.058 6.197 6.839.994a.75.75 0 01.415 1.279l-4.948 4.823 1.168 6.811a.75.75 0 01-1.088.791L12 18.347l-6.117 3.216a.75.75 0 01-1.088-.79l1.168-6.812-4.948-4.823a.75.75 0 01.416-1.28l6.838-.993L11.327.668A.75.75 0 0112 .25z" />
                </svg>
                <span>{project.stargazers_count}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
} 