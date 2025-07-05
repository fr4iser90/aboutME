import { ProjectCard } from '@/presentation/public/components/sections/ProjectCard';
import type { Project as DomainProject } from '@/domain/entities/Project';
import type { ProjectFormData, FieldVisibility } from '../types';

interface ProjectPreviewProps {
  formData: ProjectFormData;
  fieldsVisibility: FieldVisibility;
  project: DomainProject | null | undefined;
}

export function ProjectPreview({ formData, fieldsVisibility, project }: ProjectPreviewProps) {
  const previewProject: DomainProject = {
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
  } as DomainProject;

  return (
    <div className="project-editor__preview">
      <h3 className="project-editor__preview-title">Live Vorschau</h3>
      <ProjectCard project={previewProject} /> 
    </div>
  );
} 