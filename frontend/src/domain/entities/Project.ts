export interface Project {
  id: string;
  title: string; // Corresponds to 'name' in DB
  description: string;
  status: string; // From DB, will be 'ACTIVE', 'WIP', 'ARCHIVED', 'DEPRECATED'
  imageUrl?: string; // Corresponds to 'thumbnail_url' in DB
  githubUrl?: string; // Corresponds to 'source_url' in DB
  liveUrl?: string; // Corresponds to 'live_url' in DB
  homepageUrl?: string; // Corresponds to 'homepage_url' in DB
  technologies: string[]; // May be derived from 'topics' or 'details'
  topics?: string[]; // From DB
  language?: string; // From DB
  starsCount?: number; // Corresponds to 'stars_count' in DB
  forksCount?: number; // Corresponds to 'forks_count' in DB
  watchersCount?: number; // Corresponds to 'watchers_count' in DB
  openIssuesCount?: number; // Corresponds to 'open_issues_count' in DB
  createdAt: Date; // From DB
  updatedAt: Date; // Corresponds to 'last_updated' or 'updated_at' in DB
  details?: ProjectDetails; // Mapped from 'details' JSONB
  sourceType?: 'github' | 'gitlab' | 'manual' | string; // From DB
  sourceUsername?: string; // From DB
  sourceRepo?: string; // From DB
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

export interface ProjectDetails {
  languages_map?: { [key: string]: number }; // Changed from boolean to number to match GitHub API response
  fields_visibility?: { [key: string]: boolean };
  // Add any other known properties that might exist in the 'details' JSONB field
  // For example, if you store other specific structured data there.
  // If it's truly dynamic beyond these, consider an index signature,
  // but prefer explicit properties for better type safety.
  // [key: string]: any; 
}

// Types for project listing/sorting, previously in shared/types/project.ts
export type ViewMode = 'grid' | 'list';
// Ensure SortField matches the actual (camelCased) properties of the domain Project entity
export type SortField = 'title' | 'createdAt' | 'updatedAt'; // Adjusted from name, last_updated
export type SortOrder = 'asc' | 'desc';
