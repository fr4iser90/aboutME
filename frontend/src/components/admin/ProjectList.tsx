import { useEffect, useState } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.BACKEND_URL || 'http://localhost:8090';

interface Project {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  github_url: string;
  demo_url?: string;
  technologies: string[];
}

interface ProjectListProps {
  onEdit: (project: Project) => void;
}

export function ProjectList({ onEdit }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(project => project.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="galaxy-card rounded-lg shadow-md overflow-hidden"
        >
          {project.thumbnail_url && (
            <img
              src={project.thumbnail_url}
              alt={project.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold galaxy-text">
              {project.title}
            </h3>
            <p className="mt-2 text-slate-300">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="space-x-2">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="galaxy-text hover:underline"
                  >
                    GitHub
                  </a>
                )}
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="galaxy-text hover:underline"
                  >
                    Demo
                  </a>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => onEdit(project)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 