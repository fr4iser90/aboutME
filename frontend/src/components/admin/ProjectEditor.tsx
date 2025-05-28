import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/sections/ProjectCard';

interface Project {
  id?: number;
  title: string;
  description: string;
  thumbnail_url: string;
  github_url: string;
  demo_url?: string;
  technologies: string[];
}

const API_URL = process.env.BACKEND_URL || 'http://localhost:8090';

interface ProjectEditorProps {
  project?: Project | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ProjectEditor({ project, onSave, onCancel }: ProjectEditorProps) {
  const [formData, setFormData] = useState<Project>({
    title: '',
    description: '',
    thumbnail_url: '',
    github_url: '',
    demo_url: '',
    technologies: [],
  });
  const [newTech, setNewTech] = useState('');

  useEffect(() => {
    if (project) {
      setFormData(project);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = project?.id
        ? `${API_URL}/api/admin/projects/${project.id}`
        : `${API_URL}/api/admin/projects`;
      
      const response = await fetch(url, {
        method: project?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      onSave();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleAddTech = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, newTech.trim()],
      });
      setNewTech('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((t) => t !== tech),
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Editor (links) */}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div>
          <label htmlFor="title" className="block text-sm font-medium galaxy-text">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium galaxy-text">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="thumbnail_url" className="block text-sm font-medium galaxy-text">
            Thumbnail URL
          </label>
          <input
            type="url"
            id="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
          />
        </div>

        <div>
          <label htmlFor="github_url" className="block text-sm font-medium galaxy-text">
            GitHub URL
          </label>
          <input
            type="url"
            id="github_url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="demo_url" className="block text-sm font-medium galaxy-text">
            Demo URL
          </label>
          <input
            type="url"
            id="demo_url"
            value={formData.demo_url}
            onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium galaxy-text">Technologies</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              className="block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
              placeholder="Add technology"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </form>
      {/* Live Preview (rechts) */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Live Vorschau</h3>
        <ProjectCard project={formData} />
      </div>
    </div>
  );
} 