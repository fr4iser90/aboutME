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

interface ExtendedProject {
  id?: number;
  name: string;
  description: string;
  thumbnail_url: string;
  github_url: string;
  demo_url?: string;
  technologies: string[];
  status?: string;
  language?: string;
  topics?: string[];
  stars_count?: number;
  forks_count?: number;
  watchers_count?: number;
  homepage_url?: string;
}

const API_URL = process.env.BACKEND_URL || 'http://localhost:8090';

interface ProjectEditorProps {
  project?: Project | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ProjectEditor({ project, onSave, onCancel }: ProjectEditorProps) {
  const [formData, setFormData] = useState<ExtendedProject>({
    name: '',
    description: '',
    thumbnail_url: '',
    github_url: '',
    demo_url: '',
    technologies: [],
    status: 'WIP',
    language: '',
    topics: [],
    stars_count: 0,
    forks_count: 0,
    watchers_count: 0,
    homepage_url: '',
  });
  const [newTech, setNewTech] = useState('');
  const defaultVisibility = {
    title: true,
    description: true,
    thumbnail_url: true,
    github_url: true,
    demo_url: true,
    technologies: true,
    status: true,
    language: true,
    topics: true,
    stars_count: true,
    forks_count: true,
    watchers_count: true,
    homepage_url: true,
  };
  const [fieldsVisibility, setFieldsVisibility] = useState<{ [key: string]: boolean }>(defaultVisibility);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        name: (project as any).name || '',
        technologies: project.technologies || [],
        status: (project as any).status || 'WIP',
        language: (project as any).language || '',
        topics: (project as any).topics || [],
        stars_count: (project as any).stars_count || 0,
        forks_count: (project as any).forks_count || 0,
        watchers_count: (project as any).watchers_count || 0,
        homepage_url: (project as any).homepage_url || '',
      });
      if ((project as any).details && (project as any).details.fields_visibility) {
        setFieldsVisibility({ ...defaultVisibility, ...(project as any).details.fields_visibility });
      } else {
        setFieldsVisibility(defaultVisibility);
      }
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const details = {
        ...(project && (project as any).details ? (project as any).details : {}),
        fields_visibility: fieldsVisibility,
      };
      const url = project?.id
        ? `${API_URL}/api/admin/projects/${project.id}`
        : `${API_URL}/api/admin/projects`;
      
      const response = await fetch(url, {
        method: project?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, details }),
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

  const handleVisibilityChange = (field: string) => {
    setFieldsVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Editor (links) */}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div>
          <label htmlFor="name" className="block text-sm font-medium galaxy-text">
            Title
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

        <div>
          <label htmlFor="status" className="block text-sm font-medium galaxy-text">Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
          >
            <option value="WIP">WIP</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
            <option value="DEPRECATED">DEPRECATED</option>
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium galaxy-text">Language</label>
          <input
            type="text"
            id="language"
            value={formData.language}
            onChange={e => setFormData({ ...formData, language: e.target.value })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
          />
        </div>

        <div>
          <label htmlFor="topics" className="block text-sm font-medium galaxy-text">Topics (comma separated)</label>
          <input
            type="text"
            id="topics"
            value={formData.topics?.join(', ') || ''}
            onChange={e => setFormData({ ...formData, topics: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
          />
        </div>

        <div>
          <label htmlFor="homepage_url" className="block text-sm font-medium galaxy-text">Homepage URL</label>
          <input
            type="url"
            id="homepage_url"
            value={formData.homepage_url}
            onChange={e => setFormData({ ...formData, homepage_url: e.target.value })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium galaxy-text">Stars</label>
            <input type="number" value={formData.stars_count} readOnly className="mt-1 block w-full rounded-md galaxy-card text-white appearance-none" style={{ MozAppearance: 'textfield' }} />
          </div>
          <div>
            <label className="block text-sm font-medium galaxy-text">Forks</label>
            <input type="number" value={formData.forks_count} readOnly className="mt-1 block w-full rounded-md galaxy-card text-white appearance-none" style={{ MozAppearance: 'textfield' }} />
          </div>
          <div>
            <label className="block text-sm font-medium galaxy-text">Watchers</label>
            <input type="number" value={formData.watchers_count} readOnly className="mt-1 block w-full rounded-md galaxy-card text-white appearance-none" style={{ MozAppearance: 'textfield' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(fieldsVisibility).map(([field, visible]) => (
            <label key={field} className="flex items-center space-x-2 text-sm galaxy-text">
              <input
                type="checkbox"
                checked={visible}
                onChange={() => handleVisibilityChange(field)}
                className="form-checkbox text-purple-500"
              />
              <span>{field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} sichtbar</span>
            </label>
          ))}
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
        <ProjectCard project={{
          id: formData.id,
          title: fieldsVisibility.title ? formData.name : '',
          description: fieldsVisibility.description ? formData.description : '',
          thumbnail_url: fieldsVisibility.thumbnail_url ? formData.thumbnail_url : '',
          github_url: fieldsVisibility.github_url ? formData.github_url : '',
          demo_url: fieldsVisibility.demo_url ? formData.demo_url : '',
          technologies: fieldsVisibility.technologies ? formData.technologies : [],
          stars_count: fieldsVisibility.stars_count ? formData.stars_count : 0,
          forks_count: fieldsVisibility.forks_count ? formData.forks_count : 0,
          watchers_count: fieldsVisibility.watchers_count ? formData.watchers_count : 0,
          language: fieldsVisibility.language ? formData.language : '',
          topics: fieldsVisibility.topics ? formData.topics : [],
          homepage_url: fieldsVisibility.homepage_url ? formData.homepage_url : '',
          last_updated: (project as any)?.last_updated,
          open_issues_count: (project as any)?.open_issues_count,
        }} />
      </div>
    </div>
  );
} 