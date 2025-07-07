import type { ImportSource } from '../types';

export const SOURCES: ImportSource[] = [
  { label: 'GitHub', value: 'github' },
  { label: 'GitLab', value: 'gitlab' },
  { label: 'Manuell', value: 'manual' },
];

export const DEFAULT_FORM_DATA = {
  source: 'github',
  input: 'fr4iser90',
  token: '',
};

export const DEFAULT_PROJECT_DATA = {
  name: 'Neues Projekt',
  description: '',
  source_url: '',
  live_url: '',
  thumbnail_url: '',
  language: '',
  topics: [],
  status: 'WIP',
  is_visible: true,
};

export const TOKEN_HINT_TEXT = 'Ohne Token werden nur öffentliche Projekte importiert und ggf. weniger Informationen angezeigt. Mit Token bekommst du alle Projekte und mehr Details (z.B. private Repos, Commit-Infos, höhere Rate-Limits).'; 