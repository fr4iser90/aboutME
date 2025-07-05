import type { Project as DomainProject, ProjectDetails } from '@/domain/entities/Project';

// Form data uses camelCase, consistent with DomainProject and frontend standards
export interface ProjectFormData {
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

export interface ProjectEditorProps {
  project?: DomainProject | null | undefined;
  onSave: () => void;
  onCancel: () => void;
}

// Definiere die Override-Felder als konstantes Tupel für Typensicherheit
export const overrideFields = [
  'title',
  'description',
  'own_description',
  'short_description',
  'highlight',
  'learnings',
  'challenges',
  'role',
] as const;

export type OverrideField = typeof overrideFields[number];

export interface FieldVisibility {
  [key: string]: boolean;
}

export type OverrideState = Record<OverrideField, boolean>; 