import type { ProjectFormData, FieldVisibility } from '../types';
import type { Project as DomainProject, ProjectDetails } from '@/domain/entities/Project';
import { projectApi } from '@/domain/shared/utils/api';

export const prepareSubmissionPayload = (
  formData: ProjectFormData, 
  fieldsVisibility: FieldVisibility,
  project: DomainProject | null | undefined
): DomainProject => {
  const currentProjectDetails = project?.details || {};
  const details: ProjectDetails = {
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

export const submitProject = async (
  formData: ProjectFormData,
  fieldsVisibility: FieldVisibility,
  project: DomainProject | null | undefined
): Promise<void> => {
  const payload = prepareSubmissionPayload(formData, fieldsVisibility, project);
  
  if (project?.id) {
    await projectApi.updateProject(project.id, payload);
  } else {
    await projectApi.createProject(payload as Omit<DomainProject, 'id'>);
  }
}; 