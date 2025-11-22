/**
 * GitHub Repository Filter Service
 * 
 * Filters GitHub repositories based on configured criteria.
 */

import { GitHubFilterConfig } from '../types/setup.types';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  fork: boolean;
  is_template: boolean;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  html_url?: string;
  visibility?: 'public' | 'private' | 'internal';
  [key: string]: any;
}

export interface FilterResult {
  repositories: Repository[];
  total: number;
  filtered: number;
  featured: Repository[];
}

/**
 * Apply filters to repository list
 */
export function applyFilters(
  repositories: Repository[],
  filterConfig: GitHubFilterConfig
): FilterResult {
  let filtered = [...repositories];

  // Filter by forks
  if (!filterConfig.includeForks) {
    filtered = filtered.filter((repo) => !repo.fork);
  }

  // Filter by templates
  if (!filterConfig.includeTemplates) {
    filtered = filtered.filter((repo) => !repo.is_template);
  }

  // Filter by private repositories
  if (!filterConfig.includePrivate) {
    filtered = filtered.filter((repo) => repo.visibility !== 'private');
  }

  // Filter by minimum stars
  if (filterConfig.minStars > 0) {
    filtered = filtered.filter(
      (repo) => repo.stargazers_count >= filterConfig.minStars
    );
  }

  // Exclude specific repositories
  if (filterConfig.excludeRepos.length > 0) {
    filtered = filtered.filter(
      (repo) => !filterConfig.excludeRepos.includes(repo.name)
    );
  }

  // Mark featured projects
  const featured = filtered.filter((repo) =>
    filterConfig.featuredProjects.includes(repo.name)
  );

  return {
    repositories: filtered,
    total: repositories.length,
    filtered: filtered.length,
    featured,
  };
}

/**
 * Get default filter configuration
 */
export function getDefaultFilterConfig(): GitHubFilterConfig {
  return {
    includeForks: false,
    includeTemplates: false,
    includePrivate: false,
    minStars: 0,
    excludeRepos: [],
    featuredProjects: [],
  };
}

