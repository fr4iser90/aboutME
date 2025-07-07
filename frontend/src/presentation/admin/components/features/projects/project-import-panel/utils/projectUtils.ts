import type { FetchProjectsParams, ProjectData } from '../types';
import { DEFAULT_PROJECT_DATA } from '../constants';

export const extractUsernameFromUrl = (url: string, platform: string): string => {
  let username = url.trim();
  
  if (platform === 'github') {
    if (username.startsWith('https://github.com/')) {
      username = username.replace('https://github.com/', '').replace(/\/$/, '');
    }
  } else if (platform === 'gitlab') {
    if (username.startsWith('https://gitlab.com/')) {
      username = username.replace('https://gitlab.com/', '').replace(/\/$/, '');
    }
  }
  
  return username;
};

export const buildApiUrl = (platform: string, username: string): string => {
  if (platform === 'github') {
    return `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
  } else if (platform === 'gitlab') {
    return `https://gitlab.com/api/v4/users/${username}/projects?per_page=100&order_by=last_activity_at`;
  }
  return '';
};

export const buildHeaders = (platform: string, token: string): Record<string, string> => {
  const headers: Record<string, string> = {};
  
  if (token) {
    if (platform === 'github') {
      headers['Authorization'] = `token ${token}`;
    } else if (platform === 'gitlab') {
      headers['PRIVATE-TOKEN'] = token;
    }
  }
  
  return headers;
};

export const fetchProjectsFromApi = async ({ source, input, token }: FetchProjectsParams): Promise<ProjectData[]> => {
  if (source === 'manual') {
    return [DEFAULT_PROJECT_DATA];
  }

  const username = extractUsernameFromUrl(input, source);
  const url = buildApiUrl(source, username);
  const headers = buildHeaders(source, token);

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`);
  }
  
  return await res.json();
};

export const normalizeProjectData = (project: any, source: string): ProjectData => {
  return {
    id: project.id,
    name: project.name,
    title: project.name,
    description: project.description,
    source_url: project.html_url || project.web_url,
    live_url: project.homepage,
    homepage: project.homepage,
    thumbnail_url: '',
    github_url: source === 'github' ? project.html_url : '',
    web_url: source === 'gitlab' ? project.web_url : '',
    language: project.language,
    topics: project.topics || [],
    status: 'WIP',
    is_visible: true,
    archived: project.archived || false,
  };
}; 