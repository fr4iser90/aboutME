import { useState, useEffect } from 'react';
import { ProjectCard } from '@/presentation/public/components/sections/ProjectCard';
import type { Project as DomainProject, ProjectDetails } from '@/domain/entities/Project';
import { apiClient } from '@/shared/utils/api';

// Form data uses camelCase, consistent with DomainProject and frontend standards
interface ProjectFormData {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl: string;
  liveUrl?: string;
  technologies: string[];
  status: string;
  language?: string;
  topics?: string[];
  starsCount?: number;
  forksCount?: number;
  watchersCount?: number;
  homepageUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  details?: ProjectDetails;
  // Custom fields
  own_description?: string;
  short_description?: string;
  highlight?: string;
  learnings?: string;
  challenges?: string;
  role?: string;
  custom_tags?: string[];
  show_on_portfolio?: boolean;
  team?: string[];
  screenshots?: string[];
  links?: { [key: string]: string };
}

interface ProjectEditorProps {
  project?: DomainProject | null;
  onSave: () => void;
  onCancel: () => void;
}

// Definiere die Override-Felder als konstantes Tupel für Typensicherheit
const overrideFields = [
  'title',
  'description',
  'own_description',
  'short_description',
  'highlight',
  'learnings',
  'challenges',
  'role',
] as const;
type OverrideField = typeof overrideFields[number];

export function ProjectEditor({ project, onSave, onCancel }: ProjectEditorProps) {
  console.log('ProjectEditor - project data:', project);
  console.log('ProjectEditor - project.sourceType:', project?.sourceType);
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

  const [formData, setFormData] = useState<ProjectFormData>({
    id: undefined,
    title: '',
    description: '',
    imageUrl: '',
    githubUrl: '',
    liveUrl: '',
    technologies: [],
    status: 'WIP',
    topics: [],
    starsCount: 0,
    forksCount: 0,
    watchersCount: 0,
    homepageUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    details: {
      languages_map: {},
      fields_visibility: defaultVisibility
    },
    own_description: '',
    short_description: '',
    highlight: '',
    learnings: '',
    challenges: '',
    role: '',
    custom_tags: [],
    show_on_portfolio: true,
    team: [],
    screenshots: [],
    links: {},
  });
  const [newTech, setNewTech] = useState('');
  const [fieldsVisibility, setFieldsVisibility] = useState<{ [key: string]: boolean }>(defaultVisibility);
  const [override, setOverride] = useState<Record<OverrideField, boolean>>({
    title: false,
    description: false,
    own_description: false,
    short_description: false,
    highlight: false,
    learnings: false,
    challenges: false,
    role: false,
  });

  useEffect(() => {
    if (project) {
      const languagesMap = project.details?.languages_map || (project.language ? { [project.language]: 0 } : {});
      
      setFormData({
        id: project.id,
        title: project.title, 
        description: project.description,
        imageUrl: project.imageUrl || '', 
        githubUrl: project.githubUrl || '',   
        liveUrl: project.liveUrl || '',       
        technologies: project.technologies || [],
        status: project.status || 'WIP',
        topics: project.topics || [],
        starsCount: project.starsCount || 0,
        forksCount: project.forksCount || 0,
        watchersCount: project.watchersCount || 0,
        homepageUrl: project.homepageUrl || '',
        createdAt: project.createdAt ? (project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt) : new Date().toISOString(),
        updatedAt: project.updatedAt ? (project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt) : new Date().toISOString(),
        details: {
          ...project.details,
          languages_map: languagesMap
        },
        own_description: project.own_description || '',
        short_description: project.short_description || '',
        highlight: project.highlight || '',
        learnings: project.learnings || '',
        challenges: project.challenges || '',
        role: project.role || '',
        custom_tags: project.custom_tags || [],
        show_on_portfolio: typeof project.show_on_portfolio === 'boolean' ? project.show_on_portfolio : true,
        team: project.team || [],
        screenshots: project.screenshots || [],
        links: project.links || {},
      });
      const initialVisibility = project.details?.fields_visibility || {};
      setFieldsVisibility({ ...defaultVisibility, ...initialVisibility });
    } else {
      setFormData({
        id: undefined,
        title: '',
        description: '',
        imageUrl: '',
        githubUrl: '',
        liveUrl: '',
        technologies: [],
        status: 'WIP',
        topics: [],
        starsCount: 0,
        forksCount: 0,
        watchersCount: 0,
        homepageUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        details: {
          languages_map: {},
          fields_visibility: defaultVisibility
        },
        own_description: '',
        short_description: '',
        highlight: '',
        learnings: '',
        challenges: '',
        role: '',
        custom_tags: [],
        show_on_portfolio: true,
        team: [],
        screenshots: [],
        links: {},
      });
      setFieldsVisibility(defaultVisibility);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const currentProjectDetails = project?.details || {};
      const details: ProjectDetails = {
        ...currentProjectDetails,
        fields_visibility: fieldsVisibility,
      };

      const payload = {
        ...formData,
        createdAt: new Date(formData.createdAt),
        updatedAt: new Date(formData.updatedAt),
        details,
      };
      
      if (project?.id) {
        // Ensure status is part of the payload if it's optional in formData but required in Project
        await apiClient.updateProject(project.id, payload as DomainProject);
      } else {
        // Ensure status is part of the payload
        await apiClient.createProject(payload as Omit<DomainProject, 'id'>);
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
          <label htmlFor="show_on_portfolio" className="block text-sm font-medium galaxy-text">Auf Portfolio anzeigen</label>
          <input
            type="checkbox"
            id="show_on_portfolio"
            checked={formData.show_on_portfolio}
            onChange={e => setFormData({ ...formData, show_on_portfolio: e.target.checked })}
            className="form-checkbox text-purple-500 ml-2"
          />
        </div>

        {formData.show_on_portfolio && (
          <div className="space-y-4 border-b border-purple-900 pb-4 mb-4">
            <div className="mb-2">
              <label className="block text-sm font-medium galaxy-text">Beschreibung (aus GitHub, nicht editierbar)</label>
              <div className="text-gray-400 italic mt-1 bg-slate-900/40 rounded p-2">
                {project?.description || 'Keine GitHub-Beschreibung vorhanden.'}
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
            {overrideFields.map((field) => (
              <div key={field} className="mb-2">
                <label className="flex items-center space-x-2 text-sm galaxy-text">
                  <input
                    type="checkbox"
                    checked={override[field]}
                    onChange={() => setOverride((prev) => ({ ...prev, [field]: !prev[field] }))}
                    className="form-checkbox text-purple-500"
                  />
                  <span>Eigenen {field.replace(/_/g, ' ')} verwenden</span>
                </label>
                {override[field] ? (
                  field === 'description' || field === 'own_description' || field === 'learnings' || field === 'challenges' ? (
                    <textarea
                      className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
                      value={formData[field as keyof ProjectFormData] as string || ''}
                      onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                      rows={2}
                      placeholder={`Eigener ${field.replace(/_/g, ' ')}`}
                    />
                  ) : (
                    <input
                      className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
                      value={formData[field as keyof ProjectFormData] as string || ''}
                      onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                      placeholder={`Eigener ${field.replace(/_/g, ' ')}`}
                    />
                  )
                ) : (
                  <div className="text-gray-400 italic mt-1">
                    {project && (project as any)[field] ? (project as any)[field] : `Kein Wert aus GitHub/DB für ${field}`}
                  </div>
                )}
              </div>
            ))}
            <div>
              <label htmlFor="custom_tags" className="block text-sm font-medium galaxy-text">Eigene Tags (kommagetrennt)</label>
              <input
                type="text"
                id="custom_tags"
                value={formData.custom_tags?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, custom_tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
              />
            </div>
            <div>
              <label htmlFor="team" className="block text-sm font-medium galaxy-text">Team (kommagetrennt)</label>
              <input
                type="text"
                id="team"
                value={formData.team?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, team: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
              />
            </div>
            <div>
              <label htmlFor="screenshots" className="block text-sm font-medium galaxy-text">Screenshots (Bild-URLs, kommagetrennt)</label>
              <input
                type="text"
                id="screenshots"
                value={formData.screenshots?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, screenshots: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
              />
            </div>
            <div>
              <label htmlFor="links" className="block text-sm font-medium galaxy-text">Links (Format: label|url, kommagetrennt)</label>
              <input
                type="text"
                id="links"
                value={Object.entries(formData.links || {}).map(([k,v]) => `${k}|${v}`).join(', ')}
                onChange={e => {
                  const entries = e.target.value.split(',').map(pair => pair.split('|').map(s => s.trim()));
                  const linksObj: { [key: string]: string } = {};
                  entries.forEach(([label, url]) => { if(label && url) linksObj[label] = url; });
                  setFormData({ ...formData, links: linksObj });
                }}
                className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
                placeholder="z.B. Demo|https://demo.com, Blog|https://blog.com"
              />
            </div>
          </div>
        )}

        <div className="space-y-4 bg-slate-900/40 rounded-lg p-4 mb-4">
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
          <div>
            <label className="block text-sm font-medium galaxy-text">Status</label>
            <input type="text" value={formData.status} readOnly className="mt-1 block w-full rounded-md galaxy-card text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium galaxy-text">Sprache</label>
            <input type="text" value={formData.language || ''} readOnly className="mt-1 block w-full rounded-md galaxy-card text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium galaxy-text">Topics</label>
            <input type="text" value={formData.topics?.join(', ') || ''} readOnly className="mt-1 block w-full rounded-md galaxy-card text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium galaxy-text">Homepage URL</label>
            <input type="text" value={formData.homepageUrl || ''} readOnly className="mt-1 block w-full rounded-md galaxy-card text-white" />
          </div>
        </div>

        {project?.sourceType !== 'github' && (
          <>
            <div>
              <label htmlFor="title" className="block text-sm font-medium galaxy-text">Title</label>
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
              <label htmlFor="description" className="block text-sm font-medium galaxy-text">Description</label>
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
              <label htmlFor="imageUrl" className="block text-sm font-medium galaxy-text">Image URL</label>
              <input
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
              />
            </div>
            <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium galaxy-text">GitHub URL</label>
              <input
                type="url"
                id="githubUrl"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="mt-1 block w-full rounded-md galaxy-card shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white"
              />
            </div>
            <div>
              <label htmlFor="liveUrl" className="block text-sm font-medium galaxy-text">Demo URL</label>
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
          </>
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
      </div>
    </div>
  );
}
