import { useState, useEffect } from 'react';
import { ProjectCard } from '@/presentation/public/components/ProjectCard';
import type { Project as DomainProject, ProjectDetails } from '@/domain/entities/Project'; // Import ProjectDetails

// Form data uses camelCase, consistent with DomainProject and frontend standards
interface ProjectFormData {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl: string;
  liveUrl?: string;
  technologies: string[];
  status?: string;
  language?: string;
  topics?: string[];
  starsCount?: number;
  forksCount?: number;
  watchersCount?: number;
  homepageUrl?: string;
  createdAt: string | Date; // Stays as is, will be new Date() for new projects
  updatedAt: string | Date; // Stays as is
  details?: ProjectDetails; // Use the imported ProjectDetails type
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8090';

interface ProjectEditorProps {
  project?: DomainProject | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ProjectEditor({ project, onSave, onCancel }: ProjectEditorProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    id: undefined,
    title: '',
    description: '',
    imageUrl: '',
    githubUrl: '',
    liveUrl: '',
    technologies: [],
    status: 'WIP',
    language: '',
    topics: [],
    starsCount: 0,
    forksCount: 0,
    watchersCount: 0,
    homepageUrl: '',
    createdAt: new Date().toISOString(), // Default for new project
    updatedAt: new Date().toISOString(), // Default for new project
  });
  const [newTech, setNewTech] = useState('');
  // defaultVisibility keys should match ProjectFormData (camelCase)
  const defaultVisibility = {
    title: true,
    description: true,
    imageUrl: true,
    githubUrl: true,
    liveUrl: true,
    technologies: true,
    status: true,
    language: true,
    topics: true,
    starsCount: true,
    forksCount: true,
    watchersCount: true,
    homepageUrl: true,
  };
  const [fieldsVisibility, setFieldsVisibility] = useState<{ [key: string]: boolean }>(defaultVisibility);

  useEffect(() => {
    if (project) {
      setFormData({
        id: project.id,
        title: project.title, 
        description: project.description,
        imageUrl: project.imageUrl || '', 
        githubUrl: project.githubUrl || '',   
        liveUrl: project.liveUrl || '',       
        technologies: project.technologies || [],
        status: project.status || 'WIP',
        language: project.language || '',
        topics: project.topics || [],
        starsCount: project.starsCount || 0,
        forksCount: project.forksCount || 0,
        watchersCount: project.watchersCount || 0,
        homepageUrl: project.homepageUrl || '',
        createdAt: project.createdAt ? (project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt) : new Date().toISOString(),
        updatedAt: project.updatedAt ? (project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt) : new Date().toISOString(),
        details: project.details || {}, // Removed 'as any'
      });
      const initialVisibility = project.details?.fields_visibility || {}; // Removed 'as any'
      setFieldsVisibility({ ...defaultVisibility, ...initialVisibility });
    } else {
      setFieldsVisibility(defaultVisibility);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const currentProjectDetails = project?.details || {};
      const details: ProjectDetails = { // Ensure 'details' conforms to ProjectDetails
        ...currentProjectDetails,
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
          <label htmlFor="imageUrl" className="block text-sm font-medium galaxy-text">
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
          />
        </div>

        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium galaxy-text">
            GitHub URL
          </label>
          <input
            type="url"
            id="githubUrl"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="liveUrl" className="block text-sm font-medium galaxy-text">
            Demo URL
          </label>
          <input
            type="url"
            id="liveUrl"
            value={formData.liveUrl}
            onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
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
          <label htmlFor="homepageUrl" className="block text-sm font-medium galaxy-text">Homepage URL</label>
          <input
            type="url"
            id="homepageUrl"
            value={formData.homepageUrl}
            onChange={e => setFormData({ ...formData, homepageUrl: e.target.value })}
            className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium galaxy-text">Stars</label>
            <input type="number" value={formData.starsCount} readOnly className="mt-1 block w-full rounded-md galaxy-card text-white appearance-none" style={{ MozAppearance: 'textfield' }} />
          </div>
          <div>
            <label className="block text-sm font-medium galaxy-text">Forks</label>
            <input type="number" value={formData.forksCount} readOnly className="mt-1 block w-full rounded-md galaxy-card text-white appearance-none" style={{ MozAppearance: 'textfield' }} />
          </div>
          <div>
            <label className="block text-sm font-medium galaxy-text">Watchers</label>
            <input type="number" value={formData.watchersCount} readOnly className="mt-1 block w-full rounded-md galaxy-card text-white appearance-none" style={{ MozAppearance: 'textfield' }} />
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

        {formData.details?.languages_map && Object.keys(formData.details.languages_map).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.keys(formData.details.languages_map).map((lang) => (
              <span key={lang} className="px-2 py-1 rounded bg-blue-900/30 text-blue-300 text-xs">
                {lang}
              </span>
            ))}
          </div>
        )}

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
          id: formData.id || '', 
          title: fieldsVisibility.title ? formData.title : '', 
          description: fieldsVisibility.description ? formData.description : '',
          imageUrl: fieldsVisibility.imageUrl ? formData.imageUrl : '', 
          githubUrl: fieldsVisibility.githubUrl ? formData.githubUrl : '', 
          liveUrl: fieldsVisibility.liveUrl ? formData.liveUrl : '', 
          technologies: fieldsVisibility.technologies ? formData.technologies : [],
          createdAt: project?.createdAt ? new Date(project.createdAt) : new Date(), 
          updatedAt: project?.updatedAt ? new Date(project.updatedAt) : new Date(), 
          status: fieldsVisibility.status ? formData.status : undefined,
          language: fieldsVisibility.language ? formData.language : undefined,
          topics: fieldsVisibility.topics ? formData.topics : undefined,
          starsCount: fieldsVisibility.starsCount ? formData.starsCount : undefined, 
          forksCount: fieldsVisibility.forksCount ? formData.forksCount : undefined, 
          watchersCount: fieldsVisibility.watchersCount ? formData.watchersCount : undefined, 
          homepageUrl: fieldsVisibility.homepageUrl ? formData.homepageUrl : undefined,
        } as DomainProject} /> 
        {formData.details?.languages_map && Object.keys(formData.details.languages_map).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.keys(formData.details.languages_map).map((lang) => (
              <span key={lang} className="px-2 py-1 rounded bg-blue-900/30 text-blue-300 text-xs">
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
