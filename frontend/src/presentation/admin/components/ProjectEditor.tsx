import { useState, useEffect } from 'react';
import { ProjectCard } from '@/presentation/public/components/sections/ProjectCard';
import type { Project as DomainProject, ProjectDetails } from '@/domain/entities/Project';
import { projectApi } from '@/domain/shared/utils/api';
import './ProjectEditor.css';

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
  is_public?: boolean;
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
    is_public: true,
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
        is_public: typeof project.is_public === 'boolean' ? project.is_public : true,
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
        is_public: true,
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
        await projectApi.updateProject(project.id, payload as DomainProject);
      } else {
        await projectApi.createProject(payload as Omit<DomainProject, 'id'>);
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
    <div className="project-editor">
      {/* Editor (links) */}
      <form onSubmit={handleSubmit} className="project-editor__form">
        <div>
          <label htmlFor="is_public" className="project-editor__label text">Auf Portfolio anzeigen</label>
          <input
            type="checkbox"
            id="is_public"
            checked={formData.is_public}
            onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
            className="project-editor__checkbox"
          />
        </div>

        {formData.is_public && (
          <div className="project-editor__section">
            <div className="mb-2">
              <label className="project-editor__label text">Beschreibung (aus GitHub, nicht editierbar)</label>
              <div className="project-editor__description-preview">
                {project?.description || 'Keine GitHub-Beschreibung vorhanden.'}
              </div>
            </div>
            <div className="project-editor__visibility-grid">
              {Object.entries(fieldsVisibility).map(([field, visible]) => (
                <label key={field} className="project-editor__checkbox-label text">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() => handleVisibilityChange(field)}
                    className="project-editor__checkbox"
                  />
                  <span>{field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} sichtbar</span>
                </label>
              ))}
            </div>
            {overrideFields.map((field) => (
              <div key={field} className="mb-2">
                <label className="project-editor__checkbox-label text">
                  <input
                    type="checkbox"
                    checked={override[field]}
                    onChange={() => setOverride((prev) => ({ ...prev, [field]: !prev[field] }))}
                    className="project-editor__checkbox"
                  />
                  <span>Eigenen {field.replace(/_/g, ' ')} verwenden</span>
                </label>
                {override[field] ? (
                  field === 'description' || field === 'own_description' || field === 'learnings' || field === 'challenges' ? (
                    <textarea
                      className="project-editor__textarea card"
                      value={formData[field as keyof ProjectFormData] as string || ''}
                      onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                      rows={2}
                      placeholder={`Eigener ${field.replace(/_/g, ' ')}`}
                    />
                  ) : (
                    <input
                      className="project-editor__input card"
                      value={formData[field as keyof ProjectFormData] as string || ''}
                      onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                      placeholder={`Eigener ${field.replace(/_/g, ' ')}`}
                    />
                  )
                ) : (
                  <div className="project-editor__override-value">
                    {project && (project as any)[field] ? (project as any)[field] : `Kein Wert aus GitHub/DB für ${field}`}
                  </div>
                )}
              </div>
            ))}
            <div>
              <label htmlFor="custom_tags" className="project-editor__label text">Eigene Tags (kommagetrennt)</label>
              <input
                type="text"
                id="custom_tags"
                value={formData.custom_tags?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, custom_tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                className="project-editor__input card"
              />
            </div>
            <div>
              <label htmlFor="team" className="project-editor__label text">Team (kommagetrennt)</label>
              <input
                type="text"
                id="team"
                value={formData.team?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, team: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                className="project-editor__input card"
              />
            </div>
            <div>
              <label htmlFor="screenshots" className="project-editor__label text">Screenshots (Bild-URLs, kommagetrennt)</label>
              <input
                type="text"
                id="screenshots"
                value={formData.screenshots?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, screenshots: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                className="project-editor__input card"
              />
            </div>
            <div>
              <label htmlFor="links" className="project-editor__label text">Links (Format: label|url, kommagetrennt)</label>
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
                className="project-editor__input card"
                placeholder="z.B. Demo|https://demo.com, Blog|https://blog.com"
              />
            </div>
          </div>
        )}

        <div className="project-editor__readonly-section">
          <div>
            <label className="project-editor__label text">Stars</label>
            <input type="number" value={formData.starsCount} readOnly className="project-editor__readonly-input card" style={{ MozAppearance: 'textfield' }} />
          </div>
          <div>
            <label className="project-editor__label text">Forks</label>
            <input type="number" value={formData.forksCount} readOnly className="project-editor__readonly-input card" style={{ MozAppearance: 'textfield' }} />
          </div>
          <div>
            <label className="project-editor__label text">Watchers</label>
            <input type="number" value={formData.watchersCount} readOnly className="project-editor__readonly-input card" style={{ MozAppearance: 'textfield' }} />
          </div>
          <div>
            <label className="project-editor__label text">Status</label>
            <input type="text" value={formData.status} readOnly className="project-editor__readonly-input card" />
          </div>
          <div>
            <label className="project-editor__label text">Sprache</label>
            <input type="text" value={formData.language || ''} readOnly className="project-editor__readonly-input card" />
          </div>
          <div>
            <label className="project-editor__label text">Topics</label>
            <input type="text" value={formData.topics?.join(', ') || ''} readOnly className="project-editor__readonly-input card" />
          </div>
          <div>
            <label className="project-editor__label text">Homepage URL</label>
            <input type="text" value={formData.homepageUrl || ''} readOnly className="project-editor__readonly-input card" />
          </div>
        </div>

        {project?.sourceType !== 'github' && (
          <>
            <div>
              <label htmlFor="title" className="project-editor__label text">Title</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="project-editor__input card"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="project-editor__label text">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="project-editor__textarea card"
                required
              />
            </div>
            <div>
              <label htmlFor="imageUrl" className="project-editor__label text">Image URL</label>
              <input
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="project-editor__input card"
              />
            </div>
            <div>
              <label htmlFor="githubUrl" className="project-editor__label text">GitHub URL</label>
              <input
                type="url"
                id="githubUrl"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="project-editor__input card"
              />
            </div>
            <div>
              <label htmlFor="liveUrl" className="project-editor__label text">Demo URL</label>
              <input
                type="url"
                id="liveUrl"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                className="project-editor__input card"
              />
            </div>
            <div>
              <label className="project-editor__label text">Technologies</label>
              <div className="project-editor__tech-input-group">
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  className="project-editor__input card"
                  placeholder="Add technology"
                />
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="project-editor__add-button"
                >
                  Add
                </button>
              </div>
              <div className="project-editor__tech-tags">
                {formData.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="project-editor__tech-tag"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="project-editor__remove-tag-button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="project-editor__actions">
          <button
            type="button"
            onClick={onCancel}
            className="project-editor__cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="project-editor__save-button"
          >
            Save
          </button>
        </div>
      </form>
      {/* Live Preview (rechts) */}
      <div className="project-editor__preview">
        <h3 className="project-editor__preview-title">Live Vorschau</h3>
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
