import type { ProjectFormData, FieldVisibility } from '../types';
import type { Project as DomainProject } from '@/domain/entities/Project';

export const formatFieldLabel = (field: string): string => {
  return field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const parseCommaSeparatedValues = (value: string): string[] => {
  return value.split(',').map(t => t.trim()).filter(Boolean);
};

export const formatCommaSeparatedValues = (values: string[]): string => {
  return values?.join(', ') || '';
};

export const parseLinksString = (value: string): { [key: string]: string } => {
  const entries = value.split(',').map(pair => pair.split('|').map(s => s.trim()));
  const linksObj: { [key: string]: string } = {};
  entries.forEach(([label, url]) => { 
    if(label && url) linksObj[label] = url; 
  });
  return linksObj;
};

export const formatLinksForInput = (links: { [key: string]: string }): string => {
  return Object.entries(links || {}).map(([k,v]) => `${k}|${v}`).join(', ');
};

export const createProjectPayload = (
  formData: ProjectFormData, 
  fieldsVisibility: FieldVisibility, 
  project?: DomainProject | null
): DomainProject => {
  const currentProjectDetails = project?.details || {};
  const details = {
    ...currentProjectDetails,
    fields_visibility: fieldsVisibility,
  };

  return {
    ...formData,
    createdAt: new Date(formData.createdAt),
    updatedAt: new Date(formData.updatedAt),
    details,
  } as DomainProject;
};

export const initializeFormData = (project: DomainProject | null | undefined): ProjectFormData => {
  if (!project) {
    return {
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
        fields_visibility: {}
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
    };
  }

  const languagesMap = project.details?.languages_map || (project.language ? { [project.language]: 0 } : {});
  
  return {
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
  };
};

export const initializeFieldVisibility = (project: DomainProject | null | undefined, defaultVisibility: FieldVisibility): FieldVisibility => {
  if (!project) {
    return defaultVisibility;
  }
  
  const initialVisibility = project.details?.fields_visibility || {};
  return { ...defaultVisibility, ...initialVisibility };
}; 