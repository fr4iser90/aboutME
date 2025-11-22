#!/usr/bin/env node

/**
 * Web Scraper - GitHub Web Scraping Module (Fallback)
 * 
 * Features:
 * - Repository-Daten aus HTML parsen
 * - User-Informationen aus HTML parsen
 * - Tech Stack Detection über Web Scraping
 * - Funktioniert ohne API-Token
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
    timeouts: { web: 15000 },
    retries: { maxAttempts: 3, delay: 2000 }
  }
};

// GitHub Konfiguration
const GITHUB_USERNAME: string = config.github.username!;

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
  techStack?: TechStack;
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

interface WebScrapingConfig {
  username: string;
  hasToken: boolean;
  limitedData: boolean;
}

// ==================== MAIN FUNCTIONS ====================

/**
 * Scrapes GitHub Repositories via Web
 */
async function scrapeRepositories(): Promise<GitHubRepository[] | null> {
  try {
    console.log(`🌐 Web Scraping: Fetching repositories for ${GITHUB_USERNAME}...`);
    
    const response = await fetch(`https://github.com/${GITHUB_USERNAME}?tab=repositories`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(scriptsConfig.scraping.timeouts.web)
    });
    
    if (!response.ok) {
      throw new Error(`Web scraping failed: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Debug: Speichere HTML für Analyse
    console.log(`🔍 Debug: HTML length: ${html.length} characters`);
    
    // Parse repositories from HTML
    const repos: GitHubRepository[] = [];
    
    // Debug: Suche nach Repository-spezifischen Patterns
    const repoPatterns = [
      /<h3[^>]*><a[^>]*href="\/[^"]+\/([^"]+)"/g,
      /<a[^>]*href="\/[^"]+\/([^"]+)"[^>]*class="[^"]*repository[^"]*"/g,
      /<a[^>]*href="\/[^"]+\/([^"]+)"[^>]*data-hovercard-type="repository"/g,
      /<h3 class="wb-break-all">\s*<a[^>]+href="\/[^"]+\/([^"]+)"/g,
      /<a[^>]*href="\/[^"]+\/([^"]+)"[^>]*class="[^"]*Link--primary[^"]*"/g
    ];
    
    console.log(`🔍 Debug: Testing ${repoPatterns.length} patterns...`);
    
    // Try multiple patterns to find repository links
    for (let i = 0; i < repoPatterns.length; i++) {
      const pattern = repoPatterns[i];
      const matches = html.match(pattern);
      console.log(`🔍 Debug: Pattern ${i + 1} found ${matches ? matches.length : 0} matches`);
      
      if (matches) {
        console.log(`🔍 Debug: First few matches:`, matches.slice(0, 3));
        
        for (const match of matches) {
          const repoNameMatch = match.match(/href="\/[^"]+\/([^"]+)"/);
          if (repoNameMatch) {
            const repoName = repoNameMatch[1];
            
            // Skip if it's not a repository (contains special characters or is too long)
            if (repoName.includes('/') || repoName.includes('?') || repoName.length > 50) {
              console.log(`🔍 Debug: Skipping ${repoName} (invalid format)`);
              continue;
            }
            
            // Basic repo data (we can't get all details from web scraping)
            const repo: GitHubRepository = {
              id: Math.random(), // Generate random ID
              name: repoName,
              full_name: `${GITHUB_USERNAME}/${repoName}`,
              description: '', // Can't easily extract from web
              html_url: `https://github.com/${GITHUB_USERNAME}/${repoName}`,
              homepage: null,
              language: null, // Would need to scrape individual repo pages
              stargazers_count: 0, // Would need to scrape individual repo pages
              forks_count: 0,
              topics: [],
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              size: 1000, // Default size
              fork: false,
              is_template: false,
              visibility: 'public'
            };
            
            // Avoid duplicates
            if (!repos.find(r => r.name === repoName)) {
              repos.push(repo);
              console.log(`🔍 Debug: Added repository: ${repoName}`);
            }
          }
        }
        break; // Use first pattern that finds matches
      }
    }
    
    console.log(`✅ Web Scraping: Found ${repos.length} repositories`);
    return repos;
    
  } catch (error) {
    console.error(`❌ Web Scraping: Failed to scrape repositories:`, (error as Error).message);
    return null;
  }
}

/**
 * Scrapes GitHub Profile via Web
 */
async function scrapeUserInfo(): Promise<GitHubUser | null> {
  try {
    console.log(`🌐 Web Scraping: Fetching user info for ${GITHUB_USERNAME}...`);
    
    const response = await fetch(`https://github.com/${GITHUB_USERNAME}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(scriptsConfig.scraping.timeouts.web)
    });
    
    if (!response.ok) {
      throw new Error(`Web scraping failed: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse HTML for user data
    const nameMatch = html.match(/<title>([^<]+)/);
    const bioMatch = html.match(/<meta name="description" content="([^"]+)"/);
    const avatarMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    const followersMatch = html.match(/<span class="text-bold color-fg-default">(\d+)<\/span>\s*<span class="color-fg-muted">followers/);
    const reposMatch = html.match(/<span class="Counter" title="(\d+)">/);
    
    const userInfo: GitHubUser = {
      login: GITHUB_USERNAME,
      name: nameMatch ? nameMatch[1].replace(` (${GITHUB_USERNAME})`, '') : GITHUB_USERNAME,
      bio: bioMatch ? bioMatch[1] : '',
      avatar_url: avatarMatch ? avatarMatch[1] : `https://github.com/${GITHUB_USERNAME}.png`,
      followers: followersMatch ? parseInt(followersMatch[1]) : 0,
      public_repos: reposMatch ? parseInt(reposMatch[1]) : 0,
      location: '',
      blog: '',
      company: '',
      twitter_username: '',
      following: 0,
      created_at: new Date().toISOString()
    };
    
    console.log(`✅ Web Scraping: Successfully scraped user info`);
    return userInfo;
    
  } catch (error) {
    console.error(`❌ Web Scraping: Failed to scrape user info:`, (error as Error).message);
    return null;
  }
}

/**
 * 🚀 NEUE FUNKTION: Scrapes Repository-Details für Tech Stack Detection
 */
async function scrapeRepositoryDetails(repoName: string): Promise<{ language: string | null; stars: number; forks: number; topics: string[]; techStack?: TechStack }> {
  try {
    console.log(`🔍 Web Scraping: Fetching details for ${repoName}...`);
    
    const response = await fetch(`https://github.com/${GITHUB_USERNAME}/${repoName}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(scriptsConfig.scraping.timeouts.web)
    });
    
    if (!response.ok) {
      console.log(`⚠️  Web Scraping: Cannot access ${repoName} (${response.status})`);
      return { language: null, stars: 0, forks: 0, topics: [] };
    }
    
    const html = await response.text();
    
    // Parse language
    const languageMatch = html.match(/<span[^>]*class="[^"]*language-color[^"]*"[^>]*><\/span>\s*<span[^>]*class="[^"]*language[^"]*"[^>]*>([^<]+)<\/span>/);
    const language = languageMatch ? languageMatch[1].trim() : null;
    
    // Parse stars
    const starsMatch = html.match(/<a[^>]*href="\/[^"]+\/stargazers"[^>]*>(\d+)<\/a>/);
    const stars = starsMatch ? parseInt(starsMatch[1]) : 0;
    
    // Parse forks
    const forksMatch = html.match(/<a[^>]*href="\/[^"]+\/forks"[^>]*>(\d+)<\/a>/);
    const forks = forksMatch ? parseInt(forksMatch[1]) : 0;
    
    // Parse topics
    const topicMatches = html.match(/<a[^>]*href="\/topics\/[^"]*"[^>]*class="[^"]*topic-tag[^"]*"[^>]*>([^<]+)<\/a>/g);
    const topics: string[] = topicMatches ? topicMatches.map(match => {
      const topicMatch = match.match(/>([^<]+)</);
      return topicMatch ? topicMatch[1].trim() : '';
    }).filter(topic => topic.length > 0) : [];
    
    // 🚀 TECH STACK DETECTION über README und Package-Dateien
    let techStack: TechStack | undefined;
    
    try {
      // Suche nach README-Inhalt für Tech Stack Detection
      const readmeMatch = html.match(/<div[^>]*class="[^"]*markdown-body[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      if (readmeMatch) {
        const readmeContent = readmeMatch[1];
        techStack = analyzeTechStackFromReadme(readmeContent);
        
        if (techStack && techStack.confidence > 0) {
          console.log(`   🚀 Tech Stack detected: ${techStack.summary || 'No summary'}`);
          console.log(`   🎯 Confidence: ${techStack.confidence}%`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error analyzing tech stack for ${repoName}: ${(error as Error).message}`);
    }
    
    console.log(`   ✅ Found: ${language || 'No language'}, ${stars} stars, ${forks} forks, ${topics.length} topics`);
    
    return { language, stars, forks, topics, techStack };
    
  } catch (error) {
    console.error(`❌ Web Scraping: Error fetching details for ${repoName}:`, (error as Error).message);
    return { language: null, stars: 0, forks: 0, topics: [] };
  }
}

/**
 * 🚀 NEUE FUNKTION: Analysiert Tech Stack aus README-Inhalt
 */
function analyzeTechStackFromReadme(readmeContent: string): TechStack {
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

  const allTechnologies: string[] = [];
  
  // Tech Stack Keywords
  const techKeywords = {
    frontend: ['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'gatsby', 'astro', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'bootstrap'],
    backend: ['express', 'fastapi', 'django', 'flask', 'spring', 'laravel', 'rails', 'nodejs', 'python', 'java', 'php', 'ruby', 'go', 'rust'],
    database: ['postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'mariadb', 'oracle', 'dynamodb'],
    devops: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'vercel', 'netlify', 'heroku', 'jenkins', 'github-actions', 'gitlab-ci'],
    testing: ['jest', 'vitest', 'pytest', 'mocha', 'cypress', 'playwright', 'selenium', 'junit'],
    frameworks: ['react', 'vue', 'angular', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'nextjs', 'nuxt'],
    libraries: ['axios', 'lodash', 'moment', 'socket.io', 'prisma', 'sequelize', 'typeorm'],
    tools: ['git', 'github', 'gitlab', 'vscode', 'webpack', 'vite', 'rollup', 'eslint', 'prettier']
  };

  // Suche nach Technologien im README
  const contentLower = readmeContent.toLowerCase();
  
  Object.entries(techKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        allTechnologies.push(keyword);
        
        // Kategorisiere
        if (techKeywords.frontend.includes(keyword)) {
          techStack.frontend.push(keyword);
        }
        if (techKeywords.backend.includes(keyword)) {
          techStack.backend.push(keyword);
        }
        if (techKeywords.database.includes(keyword)) {
          techStack.database.push(keyword);
        }
        if (techKeywords.devops.includes(keyword)) {
          techStack.devops.push(keyword);
        }
        if (techKeywords.testing.includes(keyword)) {
          techStack.testing.push(keyword);
        }
        if (techKeywords.frameworks.includes(keyword)) {
          techStack.frameworks.push(keyword);
        }
        if (techKeywords.libraries.includes(keyword)) {
          techStack.libraries.push(keyword);
        }
        if (techKeywords.tools.includes(keyword)) {
          techStack.tools.push(keyword);
        }
      }
    });
  });

  // Entferne Duplikate
  Object.keys(techStack).forEach(key => {
    if (Array.isArray(techStack[key as keyof TechStack])) {
      const arrayValue = techStack[key as keyof TechStack] as string[];
      const uniqueArray = Array.from(new Set(arrayValue));
      (techStack[key as keyof TechStack] as string[]) = uniqueArray;
    }
  });

  // Berechne Confidence basierend auf gefundenen Technologien
  let confidence = 0;
  if (techStack.frameworks.length > 0) confidence += 30;
  if (techStack.frontend.length > 0) confidence += 20;
  if (techStack.backend.length > 0) confidence += 20;
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
 * 🚀 ERWEITERTE FUNKTION: Scrapes alle Repository-Details mit Tech Stack
 */
async function scrapeAllRepositoryDetails(repos: GitHubRepository[]): Promise<GitHubRepository[]> {
  console.log(`🔍 Web Scraping: Fetching details for ${repos.length} repositories...`);
  
  const detailedRepos: GitHubRepository[] = [];
  
  for (const repo of repos) {
    try {
      console.log(`   📊 Processing ${repo.name}...`);
      
      const details = await scrapeRepositoryDetails(repo.name);
      
      // Update repository with detailed data
      const detailedRepo: GitHubRepository = {
        ...repo,
        language: details.language,
        stargazers_count: details.stars,
        forks_count: details.forks,
        topics: details.topics,
        techStack: details.techStack
      };
      
      detailedRepos.push(detailedRepo);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error processing ${repo.name}:`, (error as Error).message);
      detailedRepos.push(repo); // Add original repo if details fail
    }
  }
  
  const techStackCount = detailedRepos.filter(r => r.techStack && r.techStack.confidence > 0).length;
  console.log(`✅ Web Scraping: Processed ${detailedRepos.length} repositories`);
  console.log(`🚀 Tech Stack Analysis: ${techStackCount}/${detailedRepos.length} projects analyzed`);
  
  return detailedRepos;
}

/**
 * Web Scraping kann keine detaillierten Language-Daten liefern
 * Daher geben wir leere Daten zurück
 */
async function scrapeRepositoryLanguages(repoName: string): Promise<{ [language: string]: number }> {
  console.log(`⚠️  Web Scraping: Cannot get detailed language data for ${repoName} (API only)`);
  return {};
}

/**
 * Web Scraping kann keine detaillierten Language-Daten für alle Repos liefern
 */
async function scrapeAllRepositoryLanguages(repos: GitHubRepository[]): Promise<{ [language: string]: number }> {
  console.log(`⚠️  Web Scraping: Cannot get detailed language data for all repositories (API only)`);
  return {};
}

/**
 * Validiert Web Scraping Konfiguration
 */
function validateWebScrapingConfig(): WebScrapingConfig {
  if (!GITHUB_USERNAME || GITHUB_USERNAME.trim() === '') {
    throw new Error('GitHub username is not configured in portfolio.config.js');
  }
  
  console.log(`🌐 Web Scraping: Using GitHub username: ${GITHUB_USERNAME}`);
  console.log(`⚠️  Web Scraping: Limited data available (no API token)`);
  
  return {
    username: GITHUB_USERNAME,
    hasToken: false,
    limitedData: true
  };
}

// ==================== EXPORTS ====================

export {
  scrapeRepositories,
  scrapeUserInfo,
  scrapeRepositoryDetails,
  analyzeTechStackFromReadme,
  scrapeAllRepositoryDetails,
  scrapeRepositoryLanguages,
  scrapeAllRepositoryLanguages,
  validateWebScrapingConfig,
  // Konfiguration exportieren
  GITHUB_USERNAME,
  // Types exportieren
  type GitHubUser,
  type GitHubRepository,
  type TechStack,
  type WebScrapingConfig
};
