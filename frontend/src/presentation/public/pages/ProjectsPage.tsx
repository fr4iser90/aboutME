import { useProjects } from '@/application/public/projects/useProjects';
import { ProjectCard } from '@/presentation/public/components/sections/ProjectCard';
import { useEffect, useState } from 'react';
import { Project } from '@/domain/entities/Project';
import './ProjectsPage.css';

export const ProjectsView = () => {
  const { getAllProjects } = useProjects();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getAllProjects();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getAllProjects]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="projects-page-error">{error}</div>;
  }

  return (
    <div className="projects-page-container">
      <h1 className="projects-page-title">My Projects</h1>
      <div className="projects-page-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};
