#!/usr/bin/env node

/**
 * API Scraper - GitHub API Scraping Module
 * 
 * Features:
 * - Repository-Daten abrufen
 * - User-Informationen abrufen
 * - Code-Zeilen pro Repository
 * - Language-Statistiken
 * - Tech Stack Detection über GitHub API
 * - Vollständig TypeScript mit Type Safety
 */

import * as fs from 'fs';
import * as path from 'path';

// Lade .env-Datei aus dem Root-Verzeichnis
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

// Lade Portfolio-Konfiguration - use fallback for build time
const config = {
  github: {
    username: process.env.GITHUB_USERNAME
  }
};

const scriptsConfig = {
  scraping: {
    timeouts: { api: 30000 },
    retries: { maxAttempts: 3, delay: 2000 }
  }
};

// GitHub API Konfiguration
const GITHUB_USERNAME: string = config.github.username!;
const GITHUB_TOKEN: string | undefined = process.env.GITHUB_TOKEN; // ← Token aus .env oder setup.js

// GitHub API URLs
const API_BASE = 'https://api.github.com';
const USER_REPOS_URL = `${API_BASE}/users/${GITHUB_USERNAME}/repos`;
const USER_INFO_URL = `${API_BASE}/users/${GITHUB_USERNAME}`;

// ==================== INTERFACES ====================

interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string;
  blog: string;
  company: string;
  twitter_username: string;
  created_at: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  created_at: string;
  size: number;
  fork: boolean;
  is_template: boolean;
  visibility: string;
  // Erweiterte Daten
  lines_of_code?: number;
  language_stats?: { [language: string]: number };
  techStack?: TechStack; // Optional Tech Stack
}

interface TechStack {
  languages: { [language: string]: number };
  frontend: string[];
  backend: string[];
  database: string[];
  devops: string[];
  testing: string[];
  frameworks: string[];
  libraries: string[];
  tools: string[];
  dependencies?: string[];
  confidence: number;
  summary?: string;
}

interface ApiConfig {
  username: string;
  token: string | undefined;
  hasToken: boolean;
}

// Headers für GitHub API
const headers: Record<string, string> = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'GitHub-Portfolio-Scraper/1.0'
};

if (GITHUB_TOKEN) {
  headers['Authorization'] = `token ${GITHUB_TOKEN}`;
}

// ==================== MAIN FUNCTIONS ====================

// Flag um Token-Warnung nur einmal zu zeigen
let apiTokenWarningShown = false;

/**
 * Fetcht GitHub-Daten mit Error-Handling
 */
async function fetchGitHubData(url: string): Promise<any> {
  // Prüfe ob Token vorhanden ist
  if (!GITHUB_TOKEN) {
    if (!apiTokenWarningShown) {
      console.log(`⚠️  API: No GitHub token configured, skipping API requests (using Playwright fallback)`);
      apiTokenWarningShown = true;
    }
    return null;
  }
  
  try {
    console.log(`📡 API Fetching: ${url}`);
    const response = await fetch(url, { 
      headers,
      signal: AbortSignal.timeout(scriptsConfig.scraping.timeouts.api)
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Successfully fetched ${Array.isArray(data) ? data.length : 1} items`);
    return data;
  } catch (error) {
    console.error(`❌ API Error fetching ${url}:`, (error as Error).message);
    return null;
  }
}

/**
 * Fetcht Code-Zeilen pro Repository
 */
async function fetchRepositoryLanguages(repoName: string): Promise<{ [language: string]: number }> {
  // Prüfe ob Token vorhanden ist
  if (!GITHUB_TOKEN) {
    // Silent - language data wird über Playwright geholt
    return {};
  }
  
  try {
    const url = `${API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/languages`;
    console.log(`📊 API Fetching languages for: ${repoName}`);
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.log(`⚠️  No language data for ${repoName}`);
      return {};
    }
    
    const data = await response.json();
    console.log(`✅ API Found ${Object.keys(data).length} languages in ${repoName}`);
    return data;
  } catch (error) {
    console.error(`❌ API Error fetching languages for ${repoName}:`, (error as Error).message);
    return {};
  }
}

/**
 * 🚀 NEUE FUNKTION: Fetcht Repository-Inhalte für Tech Stack Detection
 */
async function fetchRepositoryContents(repoName: string): Promise<{ [fileName: string]: string }> {
  // Prüfe ob Token vorhanden ist
  if (!GITHUB_TOKEN) {
    // Silent - content wird über Playwright geholt
    return {};
  }
  
  try {
    const url = `${API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/contents`;
    console.log(`📁 API Fetching contents for: ${repoName}`);
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.log(`⚠️  No content data for ${repoName}`);
      return {};
    }
    
    const contents = await response.json();
    const packageFiles: { [fileName: string]: string } = {};
    
    // Suche nach Package-Dateien
    const importantFiles = [
      'package.json',
      'requirements.txt',
      'Cargo.toml',
      'go.mod',
      'composer.json',
      'Gemfile',
      'Dockerfile',
      'docker-compose.yml'
    ];
    
    for (const file of contents) {
      if (file.type === 'file' && importantFiles.includes(file.name)) {
        try {
          // Fetche Dateiinhalt
          const fileResponse = await fetch(file.download_url, { headers });
          if (fileResponse.ok) {
            const content = await fileResponse.text();
            packageFiles[file.name] = content;
            console.log(`   📄 Found ${file.name} (${content.length} chars)`);
          }
        } catch (error) {
          console.log(`   ⚠️  Error fetching ${file.name}: ${(error as Error).message}`);
        }
      }
    }
    
    console.log(`✅ API Found ${Object.keys(packageFiles).length} package files in ${repoName}`);
    return packageFiles;
  } catch (error) {
    console.error(`❌ API Error fetching contents for ${repoName}:`, (error as Error).message);
    return {};
  }
}

/**
 * Fetches README content from GitHub repository
 * 
 * Created: 2025-11-15T20:13:40.000Z
 */
// Flag um Token-Warnung nur einmal zu zeigen
let tokenWarningShown = false;

async function fetchRepositoryReadme(repoName: string): Promise<string | null> {
  // Prüfe ob Token vorhanden ist
  if (!GITHUB_TOKEN) {
    if (!tokenWarningShown) {
      console.log(`⚠️  API: No GitHub token configured, using raw URL fallback for all READMEs`);
      tokenWarningShown = true;
    }
    // Fallback to raw URL
    return fetchRepositoryReadmeRaw(repoName);
  }
  
  try {
    // Try GitHub API first
    const url = `${API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/readme`;
    console.log(`📄 API Fetching README for: ${repoName}`);
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.log(`⚠️  No README data from API for ${repoName}, trying raw URL...`);
      return fetchRepositoryReadmeRaw(repoName);
    }
    
    const data = await response.json();
    
    // Decode base64 content
    if (data.encoding === 'base64' && data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      console.log(`✅ API Found README for ${repoName} (${content.length} chars)`);
      return content;
    }
    
    // Fallback to raw URL if encoding is not base64
    return fetchRepositoryReadmeRaw(repoName);
    
  } catch (error) {
    console.error(`❌ API Error fetching README for ${repoName}:`, (error as Error).message);
    // Fallback to raw URL
    return fetchRepositoryReadmeRaw(repoName);
  }
}

/**
 * Fetches README from raw GitHub URL (fallback method)
 */
async function fetchRepositoryReadmeRaw(repoName: string): Promise<string | null> {
  const branches = ['main', 'master', 'develop', 'dev'];
  
  for (const branch of branches) {
    try {
      const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/${branch}/README.md`;
      console.log(`📄 Trying raw README URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Portfolio-Generator/1.0'
        }
      });
      
      if (response.ok) {
        const content = await response.text();
        // Check if content is actually a README (not an error page)
        if (content && content.length > 50 && !content.includes('404: Not Found')) {
          console.log(`✅ Found README for ${repoName} on branch ${branch} (${content.length} chars)`);
          return content;
        }
      }
    } catch (error) {
      // Continue to next branch
      console.log(`⚠️  Error fetching README from branch ${branch} for ${repoName}: ${(error as Error).message}`);
      continue;
    }
  }
  
  console.log(`⚠️  No README found for ${repoName} on any branch (${branches.join(', ')})`);
  return null;
}

/**
 * 🚀 NEUE FUNKTION: Analysiert Tech Stack aus Package-Dateien
 */
function analyzeTechStackFromContents(contents: { [fileName: string]: string }): TechStack {
  const techStack: TechStack = {
    languages: {},
    frontend: [],
    backend: [],
    database: [],
    devops: [],
    testing: [],
    frameworks: [],
    libraries: [],
    tools: [],
    confidence: 0
  };

  const allDependencies: string[] = [];
  const allFrameworks: string[] = [];
  const allLibraries: string[] = [];
  const allTools: string[] = [];

  // Analysiere jede Package-Datei
  Object.entries(contents).forEach(([fileName, content]) => {
    try {
      switch (fileName) {
        case 'package.json':
          const packageData = JSON.parse(content);
          const deps = [
            ...Object.keys(packageData.dependencies || {}),
            ...Object.keys(packageData.devDependencies || {})
          ];
          allDependencies.push(...deps);
          
          // Framework Detection
          if (deps.includes('react')) allFrameworks.push('react');
          if (deps.includes('vue')) allFrameworks.push('vue');
          if (deps.includes('angular')) allFrameworks.push('angular');
          if (deps.includes('next')) allFrameworks.push('nextjs');
          if (deps.includes('express')) allFrameworks.push('express');
          if (deps.includes('fastify')) allFrameworks.push('fastify');
          break;

        case 'requirements.txt':
          const pythonDeps = content.split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .map(line => line.split('==')[0].split('>=')[0].split('<=')[0].trim());
          allDependencies.push(...pythonDeps);
          
          if (pythonDeps.includes('django')) allFrameworks.push('django');
          if (pythonDeps.includes('flask')) allFrameworks.push('flask');
          if (pythonDeps.includes('fastapi')) allFrameworks.push('fastapi');
          break;

        case 'Dockerfile':
          allTools.push('docker');
          if (content.includes('FROM node')) techStack.frontend.push('nodejs');
          if (content.includes('FROM python')) techStack.backend.push('python');
          if (content.includes('FROM postgres')) techStack.database.push('postgresql');
          if (content.includes('FROM redis')) techStack.database.push('redis');
          break;

        case 'docker-compose.yml':
          allTools.push('docker');
          allTools.push('docker-compose');
          break;
      }
    } catch (error) {
      console.log(`   ⚠️  Error parsing ${fileName}: ${(error as Error).message}`);
    }
  });

  // Kategorisiere Technologien
  techStack.dependencies = allDependencies;
  techStack.frameworks = allFrameworks;
  techStack.libraries = allLibraries;
  techStack.tools = allTools;

  // Kategorisiere nach Typ
  [...allDependencies, ...allFrameworks, ...allLibraries, ...allTools].forEach(tech => {
    const techLower = tech.toLowerCase();
    
    // Frontend
    if (['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt'].includes(techLower)) {
      techStack.frontend.push(tech);
    }
    
    // Backend
    if (['express', 'fastapi', 'django', 'flask', 'spring', 'laravel', 'rails'].includes(techLower)) {
      techStack.backend.push(tech);
    }
    
    // Database
    if (['postgresql', 'mysql', 'mongodb', 'redis', 'sqlite'].includes(techLower)) {
      techStack.database.push(tech);
    }
    
    // DevOps
    if (['docker', 'kubernetes', 'aws', 'azure', 'gcp'].includes(techLower)) {
      techStack.devops.push(tech);
    }
    
    // Testing
    if (['jest', 'pytest', 'mocha', 'cypress', 'playwright'].includes(techLower)) {
      techStack.testing.push(tech);
    }
  });

  // Entferne Duplikate
  Object.keys(techStack).forEach(key => {
    if (Array.isArray(techStack[key as keyof TechStack])) {
      const arrayValue = techStack[key as keyof TechStack] as string[];
      const uniqueArray = Array.from(new Set(arrayValue));
      (techStack[key as keyof TechStack] as string[]) = uniqueArray;
    }
  });

  // Berechne Confidence
  let confidence = 0;
  if (Object.keys(contents).length > 0) confidence += 40;
  if (techStack.frameworks.length > 0) confidence += 30;
  if (techStack.database.length > 0) confidence += 15;
  if (techStack.devops.length > 0) confidence += 15;
  
  techStack.confidence = confidence;

  // Generiere Summary
  const summaryParts: string[] = [];
  if (techStack.frameworks.length > 0) summaryParts.push(`Frameworks: ${techStack.frameworks.join(', ')}`);
  if (techStack.frontend.length > 0) summaryParts.push(`Frontend: ${techStack.frontend.join(', ')}`);
  if (techStack.backend.length > 0) summaryParts.push(`Backend: ${techStack.backend.join(', ')}`);
  if (techStack.database.length > 0) summaryParts.push(`Database: ${techStack.database.join(', ')}`);
  if (techStack.devops.length > 0) summaryParts.push(`DevOps: ${techStack.devops.join(', ')}`);
  
  techStack.summary = summaryParts.join(' | ');

  return techStack;
}

/**
 * Fetcht GitHub Repositories via API
 */
async function fetchRepositories(): Promise<GitHubRepository[] | null> {
  console.log('📡 API: Fetching repositories...');
  return await fetchGitHubData(USER_REPOS_URL);
}

/**
 * Fetch a single repository by name
 */
async function fetchRepositoryByName(repoName: string): Promise<GitHubRepository | null> {
  if (!GITHUB_TOKEN) {
    return null;
  }
  
  try {
    const url = `${API_BASE}/repos/${GITHUB_USERNAME}/${repoName}`;
    console.log(`📡 API: Fetching repository ${repoName}...`);
    const repo = await fetchGitHubData(url);
    return repo;
  } catch (error) {
    console.error(`❌ API Error fetching ${repoName}:`, (error as Error).message);
    return null;
  }
}

/**
 * Fast function: Fetches only repository list (no READMEs, no assets, no tech stack)
 * Used for quick repository filtering in setup wizard
 */
async function fetchRepositoryListOnly(): Promise<GitHubRepository[] | null> {
  console.log('⚡ API: Fast fetching repository list only...');
  const repos = await fetchGitHubData(USER_REPOS_URL);
  if (repos) {
    console.log(`✅ API: Fetched ${repos.length} repositories (list only, no details)`);
  }
  return repos;
}

/**
 * Fetcht GitHub User Info via API
 */
async function fetchUserInfo(): Promise<GitHubUser | null> {
  console.log('📡 API: Fetching user info...');
  return await fetchGitHubData(USER_INFO_URL);
}

/**
 * Fetcht alle Repository-Sprachen für Skills-Berechnung
 */
async function fetchAllRepositoryLanguages(repos: GitHubRepository[]): Promise<{ [language: string]: number }> {
  console.log('📊 API: Fetching all repository languages...');
  const allLanguages: { [language: string]: number } = {};
  
  for (const repo of repos) {
    const languages = await fetchRepositoryLanguages(repo.name);
    
    // Aggregiere Code-Zeilen pro Sprache
    Object.entries(languages).forEach(([lang, lines]) => {
      if (!allLanguages[lang]) {
        allLanguages[lang] = 0;
      }
      allLanguages[lang] += lines;
    });
  }
  
  return allLanguages;
}

/**
 * 🚀 NEUE FUNKTION: Fetcht Tech Stack für alle Repositories (optional)
 */
async function fetchAllRepositoryTechStacks(repos: GitHubRepository[], enableTechStack: boolean = false): Promise<{ [repoName: string]: TechStack }> {
  if (!enableTechStack) {
    console.log('⏭️  API: Tech Stack Analysis disabled');
    return {};
  }
  
  console.log('🚀 API: Fetching tech stacks for all repositories...');
  const techStacks: { [repoName: string]: TechStack } = {};
  
  for (const repo of repos) {
    try {
      console.log(`   🔍 Analyzing tech stack for ${repo.name}...`);
      
      // Fetche Repository-Inhalte
      const contents = await fetchRepositoryContents(repo.name);
      
      if (Object.keys(contents).length > 0) {
        // Analysiere Tech Stack
        const techStack = analyzeTechStackFromContents(contents);
        techStacks[repo.name] = techStack;
        
        console.log(`   🚀 Tech Stack: ${techStack.summary || 'No summary'}`);
        console.log(`   🎯 Confidence: ${techStack.confidence}%`);
      } else {
        console.log(`   ⏭️  No package files found for ${repo.name}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error analyzing tech stack for ${repo.name}:`, (error as Error).message);
    }
  }
  
  const techStackCount = Object.keys(techStacks).length;
  console.log(`✅ API: Analyzed tech stacks for ${techStackCount}/${repos.length} repositories`);
  
  return techStacks;
}

/**
 * Validiert GitHub API Konfiguration
 */
function validateApiConfig(): ApiConfig {
  if (!GITHUB_USERNAME || GITHUB_USERNAME.trim() === '') {
    throw new Error('GitHub username is not configured in portfolio.config.js');
  }
  
  console.log(`👤 API: Using GitHub username: ${GITHUB_USERNAME}`);
  console.log(`🔑 API: GitHub token: ${GITHUB_TOKEN ? 'Configured' : 'Not configured (rate limits may apply)'}`);
  
  return {
    username: GITHUB_USERNAME,
    token: GITHUB_TOKEN,
    hasToken: !!GITHUB_TOKEN
  };
}

// ==================== EXPORTS ====================

/**
 * 🚀 HAUPTFUNKTION: Fetcht alle GitHub-Daten mit optionaler Tech Stack Analysis
 */
async function fetchAllGitHubDataWithApi(enableTechStack: boolean = false): Promise<{ user: GitHubUser; repositories: GitHubRepository[] }> {
  console.log('📡 API: Fetching all GitHub data...');
  
  // Validiere Konfiguration
  const config = validateApiConfig();
  if (!config.hasToken) {
    throw new Error('GitHub token required for API scraping');
  }
  
  // Fetche User Info
  console.log('📡 API: Fetching user info...');
  const user = await fetchUserInfo();
  if (!user) {
    throw new Error('Failed to fetch user info');
  }
  
  // Fetche Repositories
  console.log('📡 API: Fetching repositories...');
  const repositories = await fetchRepositories();
  if (!repositories || repositories.length === 0) {
    throw new Error('Failed to fetch repositories');
  }
  
  // Optional: Tech Stack Analysis
  if (enableTechStack) {
    console.log('🚀 API: Starting tech stack analysis...');
    const techStacks = await fetchAllRepositoryTechStacks(repositories, true);
    
    // Merge Tech Stack data into repositories
    repositories.forEach(repo => {
      if (techStacks[repo.name]) {
        repo.techStack = techStacks[repo.name];
      }
    });
  } else {
    console.log('⏭️  API: Tech Stack Analysis disabled');
  }
  
  console.log(`✅ API Successfully fetched ${repositories.length} repositories`);
  
  return { user, repositories };
}

export {
  fetchGitHubData,
  fetchRepositoryLanguages,
  fetchRepositoryByName,
  fetchRepositoryContents,
  fetchRepositoryReadme,
  analyzeTechStackFromContents,
  fetchRepositories,
  fetchRepositoryListOnly,
  fetchUserInfo,
  fetchAllRepositoryLanguages,
  fetchAllRepositoryTechStacks,
  fetchAllGitHubDataWithApi,
  validateApiConfig,
  // Konfiguration exportieren
  GITHUB_USERNAME,
  GITHUB_TOKEN,
  API_BASE,
  USER_REPOS_URL,
  USER_INFO_URL,
  // Types exportieren
  type GitHubUser,
  type GitHubRepository,
  type TechStack,
  type ApiConfig
};
