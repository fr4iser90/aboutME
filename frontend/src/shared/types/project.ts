export interface Project {
  id: number;
  name: string;
  description: string;
  thumbnail_url: string;
  source_url: string;
  live_url?: string;
  topics: string[];
  status: 'WIP' | 'Completed' | 'Archived';
  source_type: 'manual' | 'github' | 'gitlab';
  github_username?: string;
  github_repo?: string;
  stars_count?: number;
  forks_count?: number;
  watchers_count?: number;
  language?: string;
  last_updated?: string;
  homepage_url?: string;
  open_issues_count?: number;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'created_at' | 'updated_at' | 'last_updated';
export type SortOrder = 'asc' | 'desc'; 