#!/usr/bin/env node

/**
 * Data Orchestrator - Haupt-Orchestrator für Portfolio-Daten
 * 
 * Dieses Script:
 * 1. Versucht GitHub API Scraping (primär)
 * 2. Fällt zurück auf Playwright Scraping (mit Tech Stack)
 * 3. Fällt zurück auf Web Scraping (Fallback)
 * 4. Generiert statische JSON-Dateien
 * 5. Unterstützt Blog-Posts, Skills-Timeline, Contact-Form
 * 6. Ermöglicht statisches Hosting ohne API-Calls
 * 7. Vollständig konfigurierbar über portfolio.config.js
 * 8. Tech Stack Detection optional aktivierbar
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

// Importiere Scraping-Module (TypeScript)
import * as apiScraping from './api-scraper';
import * as webScraping from './web-scraper';
import { scrapeAllGitHubDataWithPlaywright, GitHubUser, GitHubRepository, TechStack } from './playwright-scrapping';
import { detectAssetsInReadme, downloadAssets, replaceAssetUrls } from './asset-fetcher';

// Lade .env-Datei aus dem Root-Verzeichnis
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

// Lade Portfolio-Konfiguration - use runtime loading to avoid build-time errors
let config: any = {};
try {
  // Use process.cwd() for runtime path resolution
  const configPath = path.resolve(process.cwd(), 'portfolio.config.ts');
  if (fs.existsSync(configPath)) {
    // For TypeScript files, use defaults and environment variables
    config = {
      paths: {
        CONTENT_DIR: process.env.CONTENT_DIR || path.join(process.cwd(), 'private/data'),
        OUTPUT_DIR: process.env.OUTPUT_DIR || path.join(process.cwd(), 'public/data'),
      },
      github: {
        username: process.env.GITHUB_USERNAME || ''
      }
    };
  }
} catch (error) {
  // Fallback to defaults
  config = {
    paths: {
      CONTENT_DIR: path.join(process.cwd(), 'private/data'),
      OUTPUT_DIR: path.join(process.cwd(), 'public/data'),
    },
    github: {
      username: process.env.GITHUB_USERNAME || ''
    }
  };
}

// Debug: Check if config is loaded correctly
if (!config || !config.paths) {
  console.error('❌ Config loading failed. Using defaults.');
  config = {
    paths: {
      CONTENT_DIR: path.join(process.cwd(), 'private/data'),
      OUTPUT_DIR: path.join(process.cwd(), 'public/data'),
    },
    github: {
      username: process.env.GITHUB_USERNAME || ''
    }
  };
}

// Lade Scripts-Konfiguration
const scriptsConfig = require(path.resolve(__dirname, '../../../../src/features/shared/scripts/config.js'));

// Konfiguration
const OUTPUT_DIR = config.paths.OUTPUT_DIR;
const CONTENT_DIR = config.paths.CONTENT_DIR;

// ==================== INTERFACES ====================

interface UserData {
  username: string;
  name: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
  company: string;
  twitter: string;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  lastUpdated: string;
  generatedBy: string;
  aboutMe?: any;
  socialLinks: {
    github: string | null;
    twitter: string | null;
    website: string | null;
    linkedin: string | null;
    email: string | null;
  };
}

interface ProjectData {
  id: number;
  name: string;
  description: string;
  githubUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  updatedAt: string;
  createdAt: string;
  size: number;
  featured: boolean;
  category: string;
  technologies: string[];
  demoUrl: string | null;
  readme: string | null;
  screenshots: string[];
  longDescription: string | null;
  tags: string[];
  difficulty: string;
  status: string;
  contributors: number;
  // Tech Stack Daten
  techStack?: TechStack;
}

interface ProjectsData {
  projects: ProjectData[];
  totalCount: number;
  featuredCount: number;
  lastUpdated: string;
  generatedBy: string;
}

interface SkillData {
  name: string;
  count: number;
  codeLines: number;
  percentage: number;
  level: string;
  category: string;
  icon: string;
}

interface SkillsData {
  languages: SkillData[];
  frameworks: SkillData[];
  tools: SkillData[];
  totalLanguages: number;
  totalFrameworks: number;
  totalTools: number;
  lastUpdated: string;
  generatedBy: string;
  allLanguages: { [language: string]: number };
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  draft: boolean;
  slug: string;
  readingTime: number;
  image: string | null;
}

interface BlogData {
  posts: BlogPost[];
  totalCount: number;
  categories: string[];
  tags: string[];
  lastUpdated: string;
  generatedBy: string;
}

interface TimelineEntry {
  year: number;
  projects: number;
  languages: string[];
  frameworks: string[];
  totalStars: number;
  totalCodeLines: number;
  codeLinesByLanguage: { [language: string]: number };
  milestones: Array<{
    project: string;
    stars: number;
    language: string | null;
  }>;
}

interface TimelineData {
  timeline: TimelineEntry[];
  milestones: any[];
  lastUpdated: string;
  generatedBy: string;
}

// ==================== MAIN FUNCTIONS ====================

/**
 * Holt alle GitHub-Daten mit einer Browser-Session
 * Folgt der konfigurierten Fallback-Reihenfolge aus config.js
 * SMART: Nur wenn private/data/ leer ist!
 * Tech Stack Detection optional aktivierbar
 */
async function fetchAllGitHubData(enableTechStack: boolean = false): Promise<[GitHubUser | null, GitHubRepository[]]> {
  // SMART LOGIC: Prüfe ob private/data/ bereits Daten hat
  const privateProjectsDir = path.join(__dirname, '../../../private/data/projects/details');
  if (fs.existsSync(privateProjectsDir)) {
    const existingFiles = fs.readdirSync(privateProjectsDir).filter(file => file.endsWith('.md'));
    if (existingFiles.length > 0) {
      console.log('🧠 SMART: Editor hat bereits Daten in private/data/, überspringe GitHub Scraping');
      console.log(`📁 Gefundene Dateien: ${existingFiles.join(', ')}`);
      return [null, []]; // Leere Daten zurückgeben
    }
  }
  
  console.log('🧠 SMART: private/data/ ist leer, starte GitHub Scraping...');
  console.log(`🔍 Tech Stack Analysis: ${enableTechStack ? 'ENABLED' : 'DISABLED'}`);
  
  const scrapingOrder = scriptsConfig?.scraping?.order || ['api', 'playwright', 'web'];
  let userInfo: GitHubUser | null = null;
  let repos: GitHubRepository[] | null = null;
  
  // Versuche jede Methode in der konfigurierten Reihenfolge
  for (const method of scrapingOrder) {
    console.log(`🔄 Trying ${method} scraping method...`);
    
    // Retry-Logik für jede Methode
    const maxAttempts = scriptsConfig?.scraping?.retries?.maxAttempts || 3;
    const retryDelay = scriptsConfig?.scraping?.retries?.delay || 2000;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Verwende konfigurierte Timeouts
        const timeout = scriptsConfig?.scraping?.timeouts?.[method] || 30000;
        
        if (method === 'api') {
          if (!userInfo) userInfo = await Promise.race([
            apiScraping.fetchUserInfo(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('API timeout')), timeout))
          ]);
          if (!repos) repos = await Promise.race([
            apiScraping.fetchRepositories(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('API timeout')), timeout))
          ]);
        } else if (method === 'playwright') {
          // 🚀 NEUE PLAYWRIGHT INTEGRATION MIT TECH STACK SUPPORT
          // Nur einmal ausführen, nicht mehrfach
          if (!userInfo || !repos) {
            const [fetchedUserInfo, fetchedRepos] = await Promise.race([
              scrapeAllGitHubDataWithPlaywright(enableTechStack),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Playwright timeout')), timeout))
            ]);
            if (!userInfo) userInfo = fetchedUserInfo;
            if (!repos) repos = fetchedRepos;
          }
        } else if (method === 'web') {
          if (!userInfo) userInfo = await Promise.race([
            webScraping.scrapeUserInfo(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Web scraping timeout')), timeout))
          ]);
          if (!repos) repos = await Promise.race([
            webScraping.scrapeRepositories(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Web scraping timeout')), timeout))
          ]);
        }
        
        // Wenn beide Daten erfolgreich geholt wurden, breche ab
        if (userInfo && repos) {
          console.log(`✅ Successfully fetched data using ${method} method`);
          if (enableTechStack && method === 'playwright') {
            const techStackCount = repos.filter(repo => repo.techStack && repo.techStack.confidence > 0).length;
            console.log(`🚀 Tech Stack Analysis: ${techStackCount}/${repos.length} projects analyzed`);
          }
          break;
        }
        
      } catch (error) {
        console.log(`⚠️  ${method} method attempt ${attempt}/${maxAttempts} failed: ${(error as Error).message}`);
        
        if (attempt < maxAttempts) {
          console.log(`⏳ Retrying ${method} in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    // Wenn beide Daten erfolgreich geholt wurden, breche aus der äußeren Schleife ab
    if (userInfo && repos) {
      break;
    }
  }
  
  // Validiere dass mindestens eine Methode funktioniert hat
  if (!userInfo || !repos) {
    throw new Error(`Failed to fetch GitHub data from all configured methods: ${scrapingOrder.join(', ')}. Please check your GitHub username and internet connection.`);
  }
  
  return [userInfo, repos];
}

/**
 * Generiert User-Daten aus gecachten Daten (ohne Browser)
 */
async function generateUserDataFromCache(userInfo: GitHubUser | null): Promise<UserData> {
  // Lade About Me Markdown falls vorhanden
  let aboutMeContent = null;
  if (config.features?.aboutMe?.enabled && config.features?.aboutMe?.markdownFile) {
    aboutMeContent = await loadAboutMeContent(config.features?.aboutMe?.markdownFile);
  }

  return {
    username: userInfo?.login || '',
    name: userInfo?.name || userInfo?.login || '',
    bio: config.features?.aboutMe?.customBio || userInfo?.bio || '',
    avatar: config.features?.aboutMe?.profileImage || userInfo?.avatar_url || '',
    location: userInfo?.location || '',
    website: userInfo?.blog || '',
    company: userInfo?.company || '',
    twitter: userInfo?.twitter_username || '',
    followers: userInfo?.followers || 0,
    following: userInfo?.following || 0,
    publicRepos: userInfo?.public_repos || 0,
    createdAt: userInfo?.created_at || new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    generatedBy: userInfo?.login ? 'github-scraper' : 'web-scraper',
    // Erweiterte About Me Daten
    aboutMe: aboutMeContent,
    socialLinks: {
      github: userInfo?.login ? `https://github.com/${userInfo.login}` : null,
      twitter: userInfo?.twitter_username ? `https://twitter.com/${userInfo.twitter_username}` : null,
      website: userInfo?.blog || null,
      linkedin: null, // Kann in config hinzugefügt werden
      email: null     // Kann in config hinzugefügt werden
    }
  };
}

/**
 * Generiert Projekte-Daten aus gecachten Repository-Daten (ohne Browser)
 * Inklusive Tech Stack Daten wenn verfügbar
 */
async function generateProjectsDataFromCache(repos: GitHubRepository[]): Promise<ProjectsData> {
  // Filtere relevante Repositories basierend auf Konfiguration
  const relevantRepos = repos.filter(repo => {
    const fetchOptions = config.github.fetchOptions;
    
    // Grundlegende Filter
    if (repo.visibility !== 'public') return false;
    if (!fetchOptions.includeForks && repo.fork) return false;
    if (!fetchOptions.includeTemplates && repo.is_template) return false;
    if (repo.stargazers_count < fetchOptions.minStars) return false;
    if (repo.size < fetchOptions.minSize) return false;
    
    // Sprache-Filter
    if (fetchOptions.languages.length > 0 && !fetchOptions.languages.includes(repo.language || '')) {
      return false;
    }
    
    // Topic-Filter
    if (fetchOptions.topics.length > 0) {
      const hasMatchingTopic = repo.topics?.some(topic => 
        fetchOptions.topics.includes(topic)
      );
      if (!hasMatchingTopic) return false;
    }
    
    // Ausschluss-Filter
    if (fetchOptions.excludeRepos.includes(repo.name)) return false;
    
    return true;
  });

  // Sortiere nach Stars und Update-Datum
  const sortedRepos = relevantRepos.sort((a, b) => {
    const starDiff = b.stargazers_count - a.stargazers_count;
    if (starDiff !== 0) return starDiff;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  // Generiere Projekte-Daten mit README Integration
  const readmeConfig = config.features?.projects?.readmeIntegration || {};
  const enableReadmeIntegration = readmeConfig.enabled !== false;
  
  console.log(`📦 Processing ${sortedRepos.length} repositories...`);
  const projects: ProjectData[] = await Promise.all(sortedRepos.map(async (repo) => {
    const featuredCriteria = config.features?.projects?.featuredCriteria || { minStars: 5, manualOverride: [], excludeFromFeatured: [] };
    
    // Bestimme ob Projekt featured ist
    let isFeatured = false;
    
    // Manuelle Override
    if (featuredCriteria.manualOverride.includes(repo.name)) {
      isFeatured = true;
    }
    // Ausschluss von Featured
    else if (featuredCriteria.excludeFromFeatured.includes(repo.name)) {
      isFeatured = false;
    }
    // Automatische Kriterien
    else if (repo.stargazers_count >= featuredCriteria.minStars) {
      isFeatured = true;
    }
    
    // README Integration
    let readmeContent: string | null = null;
    let processedReadme: string | null = null;
    let detectedAssets: any[] = [];
    let screenshots: string[] = [];
    
    if (enableReadmeIntegration) {
      try {
        // Fetch README
        console.log(`📄 Fetching README for ${repo.name}...`);
        readmeContent = await (apiScraping as any).fetchRepositoryReadme(repo.name);
        
        if (readmeContent) {
          console.log(`✅ README fetched for ${repo.name} (${readmeContent.length} chars)`);
          
          if (readmeConfig.fetchAssets) {
            console.log(`🔍 Detecting assets in README for ${repo.name}...`);
            // Detect assets
            detectedAssets = detectAssetsInReadme(readmeContent, repo.html_url);
            console.log(`📦 Found ${detectedAssets.length} assets for ${repo.name}`);
            
            // Log asset details
            if (detectedAssets.length > 0) {
              const assetTypes = detectedAssets.reduce((acc, asset) => {
                acc[asset.type] = (acc[asset.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              console.log(`   📋 Asset breakdown: ${Object.entries(assetTypes).map(([type, count]) => `${count} ${type}(s)`).join(', ')}`);
              console.log(`   🔗 Asset URLs: ${detectedAssets.slice(0, 3).map(a => a.url).join(', ')}${detectedAssets.length > 3 ? '...' : ''}`);
            }
            
            if (detectedAssets.length > 0) {
              // Download assets to PRIVATE directory (security!)
              // Assets will only be copied to public if project is public
              const outputDir = path.join(process.cwd(), 'private');
              console.log(`⬇️  Downloading ${detectedAssets.length} assets for ${repo.name} to ${outputDir}...`);
              const urlMapping = await downloadAssets(detectedAssets, repo.name, outputDir);
              
              console.log(`✅ Downloaded ${Object.keys(urlMapping).length} assets for ${repo.name}`);
              
              // Replace URLs in README
              if (readmeConfig.replaceAssetUrls) {
                processedReadme = replaceAssetUrls(readmeContent, urlMapping, repo.name);
                console.log(`🔄 Replaced asset URLs in README for ${repo.name}`);
              } else {
                processedReadme = readmeContent;
              }
              
              // Extract image assets for screenshots
              screenshots = detectedAssets
                .filter(asset => asset.type === 'image' && asset.localPath)
                .map(asset => asset.localPath);
              
              if (screenshots.length > 0) {
                console.log(`📸 Extracted ${screenshots.length} screenshots for ${repo.name}`);
              }
            } else {
              processedReadme = readmeContent;
            }
          } else {
            processedReadme = readmeContent;
          }
        } else {
          console.log(`⚠️  No README found for ${repo.name}`);
        }
      } catch (error) {
        console.error(`❌ Error processing README for ${repo.name}:`, (error as Error).message);
        // Continue without README
      }
    }
    
    return {
      id: repo.id,
      name: repo.name,
      description: repo.description || 'No description available',
      githubUrl: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics || [],
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      size: repo.size,
      // Zusätzliche Metadaten für Portfolio
      featured: isFeatured,
      category: getCategoryFromTopics(repo.topics || [], config.features?.projects?.categories?.customCategories || {}),
      technologies: getTechnologiesFromLanguage(repo.language),
      demoUrl: repo.homepage || null,
      // Erweiterte Metadaten
      readme: processedReadme || null,
      screenshots: screenshots, // Screenshots aus README oder custom
      longDescription: processedReadme || null, // Erweiterte Beschreibung aus Markdown
      tags: repo.topics || [],
      difficulty: getDifficultyLevel(repo.stargazers_count, repo.size),
      status: getProjectStatus(repo.updated_at),
      contributors: (repo as any).contributors_count || 1,
      // 🚀 TECH STACK DATEN
      techStack: repo.techStack
    };
  }));

  return {
    projects,
    totalCount: projects.length,
    featuredCount: projects.filter(p => p.featured).length,
    lastUpdated: new Date().toISOString(),
    generatedBy: repos.length > 0 ? 'github-scraper' : 'web-scraper'
  };
}

/**
 * Generiert Skills-Daten aus gecachten Repository-Daten (ohne Browser)
 */
async function generateSkillsDataFromCache(repos: GitHubRepository[]): Promise<SkillsData> {
  // Versuche API für Language-Daten (falls verfügbar)
  let allLanguages: { [language: string]: number } = {};
  if ((apiScraping as any).GITHUB_TOKEN) {
    allLanguages = await (apiScraping as any).fetchAllRepositoryLanguages(repos);
  }

  // Zähle Sprachen und deren Verwendung
  const languageStats: { [language: string]: number } = {};
  const topicsStats: { [topic: string]: number } = {};

  for (const repo of repos) {
    // Zähle Repository-Verwendung und Code-Zeilen
    if (repo.language) {
      if (!languageStats[repo.language]) {
        languageStats[repo.language] = 0;
      }
      // Verwende echte Code-Zeilen falls verfügbar
      languageStats[repo.language] += (repo as any).lines_of_code || repo.size || 1000;
    }
    
    // Falls Playwright language_stats hat, verwende diese
    if ((repo as any).language_stats) {
      Object.entries((repo as any).language_stats).forEach(([lang, lines]) => {
        if (!languageStats[lang]) {
          languageStats[lang] = 0;
        }
        languageStats[lang] += lines as number;
      });
    }
    
    if (repo.topics) {
      repo.topics.forEach(topic => {
        topicsStats[topic] = (topicsStats[topic] || 0) + 1;
      });
    }
  }

  // Berechne Gesamt-Code-Zeilen für Prozentberechnung
  let grandTotalLines = Object.values(allLanguages).reduce((sum, lines) => sum + lines, 0);
  
  // Falls API keine Daten hat, verwende Playwright-Daten
  if (grandTotalLines === 0) {
    grandTotalLines = repos.reduce((sum, repo) => sum + ((repo as any).lines_of_code || repo.size || 0), 0);
  }

  // Generiere Skills-Kategorien mit Code-Zeilen-Daten
  const skills = {
    languages: Object.entries(languageStats)
      .map(([name, codeLines]) => {
        // Verwende Playwright-Daten falls API-Daten nicht verfügbar
        const finalCodeLines = allLanguages[name] || codeLines;
        const percentage = grandTotalLines > 0 ? (finalCodeLines / grandTotalLines * 100) : 0;
        
        return {
          name,
          count: Math.ceil(finalCodeLines / 1000), // Estimate count based on lines
          codeLines: finalCodeLines,
          percentage: parseFloat(percentage.toFixed(1)),
          level: getSkillLevelFromCodeLines(finalCodeLines),
          category: 'Programming Languages',
          icon: getLanguageIcon(name)
        };
      })
      .sort((a, b) => b.codeLines - a.codeLines),

    frameworks: Object.entries(topicsStats)
      .filter(([topic]) => isFramework(topic))
      .map(([name, count]) => ({
        name,
        count,
        codeLines: 0, // Frameworks haben keine direkten Code-Zeilen
        percentage: 0,
        level: getSkillLevel(count),
        category: 'Frameworks & Libraries',
        icon: getFrameworkIcon(name)
      }))
      .sort((a, b) => b.count - a.count),

    tools: Object.entries(topicsStats)
      .filter(([topic]) => isTool(topic))
      .map(([name, count]) => ({
        name,
        count,
        codeLines: 0, // Tools haben keine direkten Code-Zeilen
        percentage: 0,
        level: getSkillLevel(count),
        category: 'Tools & Technologies',
        icon: getToolIcon(name)
      }))
      .sort((a, b) => b.count - a.count)
  };

  return {
    ...skills,
    totalLanguages: skills.languages.length,
    totalFrameworks: skills.frameworks.length,
    totalTools: skills.tools.length,
    lastUpdated: new Date().toISOString(),
    generatedBy: allLanguages && Object.keys(allLanguages).length > 0 ? 'github-scraper' : 'web-scraper',
    allLanguages: allLanguages // Exportiere Language-Daten für Timeline
  };
}

/**
 * Generiert Skills-Timeline-Daten aus gecachten Repository-Daten (ohne Browser)
 */
async function generateSkillsTimelineDataFromCache(repos: GitHubRepository[], existingLanguages: { [language: string]: number } = {}): Promise<TimelineData> {
  if (!config.features?.skills?.showTimeline) {
    return { timeline: [], milestones: [], lastUpdated: new Date().toISOString(), generatedBy: 'disabled' };
  }

  const timeline: TimelineEntry[] = [];
  const milestones: any[] = [];

  // Gruppiere Repos nach Jahr (verwende created_at für korrekte Timeline)
  const reposByYear: { [year: string]: GitHubRepository[] } = {};
  repos.forEach(repo => {
    const year = new Date(repo.created_at).getFullYear();
    if (!reposByYear[year]) {
      reposByYear[year] = [];
    }
    reposByYear[year].push(repo);
  });

  // Erstelle Timeline-Einträge mit Code-Zeilen-Daten
  for (const year of Object.keys(reposByYear).sort()) {
    const yearRepos = reposByYear[year];
    const languages: { [language: string]: number } = {};
    const frameworks: { [framework: string]: number } = {};
    const yearCodeLines: { [language: string]: number } = {};
    
    // Verwende bereits gefetchte Language-Daten (keine neuen API-Calls!)
    for (const repo of yearRepos) {
      // Verwende bereits vorhandene Language-Daten aus existingLanguages
      // Keine neuen API-Calls um Duplikate zu vermeiden
      
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
        
        // Verwende bereits gefetchte Code-Zeilen falls verfügbar
        if (existingLanguages[repo.language]) {
          if (!yearCodeLines[repo.language]) {
            yearCodeLines[repo.language] = 0;
          }
          yearCodeLines[repo.language] += existingLanguages[repo.language];
        }
      }
      
      if (repo.topics) {
        repo.topics.forEach(topic => {
          if (isFramework(topic) || isTool(topic)) {
            frameworks[topic] = (frameworks[topic] || 0) + 1;
          }
        });
      }
    }

    timeline.push({
      year: parseInt(year),
      projects: yearRepos.length,
      languages: Object.keys(languages),
      frameworks: Object.keys(frameworks),
      totalStars: yearRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalCodeLines: Object.values(yearCodeLines).reduce((sum, lines) => sum + lines, 0),
      codeLinesByLanguage: yearCodeLines,
      milestones: yearRepos.filter(repo => repo.stargazers_count > 0).map(repo => ({
        project: repo.name,
        stars: repo.stargazers_count,
        language: repo.language
      }))
    });
  }

  return {
    timeline,
    milestones,
    lastUpdated: new Date().toISOString(),
    generatedBy: (apiScraping as any).GITHUB_TOKEN ? 'timeline-generator' : 'web-scraper'
  };
}

/**
 * Generiert Blog-Daten aus Markdown-Dateien
 */
async function generateBlogData(): Promise<BlogData> {
  console.log('\n📝 Generating blog data...');
  
  if (!config.features?.blog?.enabled) {
    return { posts: [], totalCount: 0, categories: [], tags: [], lastUpdated: new Date().toISOString(), generatedBy: 'disabled' };
  }

  const blogDir = path.join(CONTENT_DIR, 'blog');
  if (!fs.existsSync(blogDir)) {
    console.log('⚠️  Blog directory not found, creating empty blog data');
    return { posts: [], totalCount: 0, categories: [], tags: [], lastUpdated: new Date().toISOString(), generatedBy: 'empty' };
  }

  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  const posts: BlogPost[] = [];
  const categories = new Set<string>();
  const tags = new Set<string>();

  for (const file of files) {
    try {
      const filePath = path.join(blogDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content } = matter(fileContent);
      
      const post: BlogPost = {
        id: frontmatter.id || path.parse(file).name,
        title: frontmatter.title || 'Untitled',
        excerpt: frontmatter.excerpt || content.substring(0, 200) + '...',
        content: content,
        publishedAt: frontmatter.date || frontmatter.publishedAt,
        updatedAt: frontmatter.updatedAt || new Date().toISOString(),
        author: frontmatter.author || config.seo.author,
        category: frontmatter.category || 'General',
        tags: frontmatter.tags || [],
        featured: frontmatter.featured || false,
        draft: frontmatter.draft || false,
        slug: frontmatter.slug || path.parse(file).name,
        readingTime: Math.ceil(content.split(' ').length / 200), // Geschätzte Lesezeit
        image: frontmatter.image || null
      };

      if (!post.draft) {
        posts.push(post);
        if (post.category) categories.add(post.category);
        post.tags.forEach(tag => tags.add(tag));
      }
    } catch (error) {
      console.error(`❌ Error processing blog post ${file}:`, (error as Error).message);
    }
  }

  // Sortiere Posts nach Datum
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    posts,
    totalCount: posts.length,
    categories: Array.from(categories),
    tags: Array.from(tags),
    lastUpdated: new Date().toISOString(),
    generatedBy: 'markdown-processor'
  };
}

// ==================== UTILITY FUNCTIONS ====================

function getCategoryFromTopics(topics: string[], customCategories: { [key: string]: string } = {}): string {
  const categoryMap: { [key: string]: string } = {
    'web-development': 'Web Development',
    'mobile': 'Mobile Development',
    'desktop': 'Desktop Applications',
    'cli': 'Command Line Tools',
    'api': 'API Development',
    'library': 'Libraries',
    'tool': 'Tools & Utilities',
    'automation': 'Automation',
    'security': 'Security',
    'gaming': 'Gaming',
    ...customCategories
  };
  
  for (const topic of topics) {
    if (categoryMap[topic]) {
      return categoryMap[topic];
    }
  }
  
  return 'Other';
}

function getDifficultyLevel(stars: number, size: number): string {
  if (stars >= 10 || size >= 10000) return 'Advanced';
  if (stars >= 5 || size >= 5000) return 'Intermediate';
  return 'Beginner';
}

function getProjectStatus(updatedAt: string): string {
  const daysSinceUpdate = (new Date().getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceUpdate <= 30) return 'Active';
  if (daysSinceUpdate <= 90) return 'Maintained';
  if (daysSinceUpdate <= 365) return 'Stable';
  return 'Archived';
}

async function loadAboutMeContent(markdownFile: string): Promise<any> {
  try {
    const filePath = path.join(__dirname, '..', '..', markdownFile);
    console.log(`🔍 Loading About Me content from: ${filePath}`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      console.log(`✅ Successfully loaded About Me content (${content.length} characters)`);
      return {
        content: markdownContent,
        frontmatter: frontmatter,
        lastModified: fs.statSync(filePath).mtime.toISOString()
      };
    } else {
      console.log(`❌ About Me file not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error loading About Me content:`, (error as Error).message);
  }
  return null;
}

function getTechnologiesFromLanguage(language: string | null): string[] {
  const techMap: { [key: string]: string[] } = {
    'TypeScript': ['TypeScript', 'JavaScript'],
    'JavaScript': ['JavaScript', 'Node.js'],
    'Python': ['Python'],
    'Java': ['Java'],
    'C++': ['C++'],
    'Rust': ['Rust'],
    'Go': ['Go'],
    'PHP': ['PHP'],
    'Ruby': ['Ruby']
  };
  
  return techMap[language || ''] || [language || 'Unknown'];
}

function getSkillLevel(count: number): string {
  if (count >= 10) return 'Expert';
  if (count >= 5) return 'Advanced';
  if (count >= 2) return 'Intermediate';
  return 'Beginner';
}

function getSkillLevelFromCodeLines(codeLines: number): string {
  if (codeLines >= 10000) return 'Expert';
  if (codeLines >= 5000) return 'Advanced';
  if (codeLines >= 1000) return 'Intermediate';
  return 'Beginner';
}

function getLanguageIcon(language: string): string {
  const icons: { [key: string]: string } = {
    'TypeScript': '🔷',
    'JavaScript': '🟨',
    'Python': '🐍',
    'Java': '☕',
    'C++': '⚡',
    'Rust': '🦀',
    'Go': '🐹',
    'PHP': '🐘',
    'Ruby': '💎'
  };
  return icons[language] || '💻';
}

function getFrameworkIcon(framework: string): string {
  const icons: { [key: string]: string } = {
    'react': '⚛️',
    'vue': '💚',
    'angular': '🅰️',
    'nextjs': '▲',
    'nuxt': '💚',
    'express': '🚀',
    'fastapi': '⚡',
    'django': '🎸',
    'flask': '🌶️'
  };
  return icons[framework.toLowerCase()] || '🔧';
}

function getToolIcon(tool: string): string {
  const icons: { [key: string]: string } = {
    'docker': '🐳',
    'kubernetes': '☸️',
    'aws': '☁️',
    'azure': '🔵',
    'gcp': '🌩️',
    'git': '📦',
    'github': '🐙',
    'gitlab': '🦊',
    'jenkins': '🔧',
    'terraform': '🏗️'
  };
  return icons[tool.toLowerCase()] || '🛠️';
}

function isFramework(topic: string): boolean {
  const frameworks = ['react', 'vue', 'angular', 'nextjs', 'nuxt', 'express', 'fastapi', 'django', 'flask', 'spring', 'laravel'];
  return frameworks.includes(topic.toLowerCase());
}

function isTool(topic: string): boolean {
  const tools = ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'gitlab', 'jenkins', 'terraform', 'ansible', 'vagrant'];
  return tools.includes(topic.toLowerCase());
}

// ==================== MAIN FUNCTION ====================

/**
 * Hauptfunktion mit Tech Stack Support
 */
async function main(enableTechStack: boolean = false): Promise<void> {
  console.log('🚀 Starting Data Orchestrator for Static Portfolio...\n');
  console.log(`🔍 Tech Stack Analysis: ${enableTechStack ? 'ENABLED' : 'DISABLED'}`);
  
  // Validiere Konfiguration
  try {
    (apiScraping as any).validateApiConfig();
    
    // Debug-Info falls aktiviert
    if (scriptsConfig?.debug?.enabled) {
      console.log('🔧 Debug Mode: Enabled');
      console.log(`📊 Scraping Order: ${(scriptsConfig?.scraping?.order || []).join(' → ')}`);
      console.log(`⏱️  API Timeout: ${scriptsConfig?.scraping?.timeouts?.api || 30000}ms`);
      console.log(`⏱️  Playwright Timeout: ${scriptsConfig?.scraping?.timeouts?.playwright || 60000}ms`);
      console.log(`⏱️  Web Timeout: ${scriptsConfig?.scraping?.timeouts?.web || 30000}ms`);
    }
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', (error as Error).message);
    process.exit(1);
  }
  
  // Erstelle Output-Verzeichnis
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
  }

  try {
    // Generiere alle Daten - mit geteilter Browser-Instanz
    console.log('📡 Fetching all GitHub data...');
    
    // Erst alle GitHub-Daten mit einem Browser holen
    console.log('🎭 Starting single browser session for all GitHub data...');
    const [userInfo, repos] = await fetchAllGitHubData(enableTechStack);
    
    // Dann alle anderen Daten generieren (ohne Browser)
    console.log('👤 Generating user data...');
    const userData = await generateUserDataFromCache(userInfo);
    
    console.log('🚀 Generating projects data...');
    console.log(`📋 Processing ${repos.length} repositories: Fetching README, detecting Assets & Docs...`);
    const projectsData = await generateProjectsDataFromCache(repos);
    
    console.log('🎯 Generating skills data...');
    const skillsData = await generateSkillsDataFromCache(repos);
    
    console.log('📝 Generating blog data...');
    const blogData = await generateBlogData();
    
    console.log('📈 Generating timeline data...');
    // Verwende bereits gefetchte Language-Daten aus skillsData um Duplikate zu vermeiden
    const timelineData = await generateSkillsTimelineDataFromCache(repos, skillsData.allLanguages || {});

    // Validiere dass alle kritischen Daten vorhanden sind
    if (!projectsData || !skillsData || !userData) {
      throw new Error('Critical data generation failed. Projects, skills, or user data is missing.');
    }

    // Schreibe JSON-Dateien (nested structure)
    const projectsOutputDir = path.join(OUTPUT_DIR, 'projects');
    if (!fs.existsSync(projectsOutputDir)) {
      fs.mkdirSync(projectsOutputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(projectsOutputDir, 'projects.json'),
      JSON.stringify(projectsData, null, 2)
    );
    console.log('✅ Generated projects/projects.json');

    // Schreibe skills/skills.json (nested structure)
    const skillsOutputDir = path.join(OUTPUT_DIR, 'skills');
    if (!fs.existsSync(skillsOutputDir)) {
      fs.mkdirSync(skillsOutputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(skillsOutputDir, 'skills.json'),
      JSON.stringify(skillsData, null, 2)
    );
    console.log('✅ Generated skills/skills.json');

    // Schreibe user/user.json (nested structure)
    const userOutputDir = path.join(OUTPUT_DIR, 'user');
    if (!fs.existsSync(userOutputDir)) {
      fs.mkdirSync(userOutputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(userOutputDir, 'user.json'),
      JSON.stringify(userData, null, 2)
    );
    console.log('✅ Generated user/user.json');

    // Schreibe Blog-Daten falls aktiviert (nested structure)
    if (config.features?.blog?.enabled) {
      const blogOutputDir = path.join(OUTPUT_DIR, 'blog');
      if (!fs.existsSync(blogOutputDir)) {
        fs.mkdirSync(blogOutputDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(blogOutputDir, 'blog.json'),
        JSON.stringify(blogData, null, 2)
      );
      console.log('✅ Generated blog/blog.json');
    }

    // Schreibe Timeline-Daten falls aktiviert (nested structure)
    if (config.features?.skills?.showTimeline) {
      const timelineOutputDir = path.join(OUTPUT_DIR, 'timeline');
      if (!fs.existsSync(timelineOutputDir)) {
        fs.mkdirSync(timelineOutputDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(timelineOutputDir, 'timeline.json'),
        JSON.stringify(timelineData, null, 2)
      );
      console.log('✅ Generated timeline/timeline.json');
    }

    // Schreibe Portfolio-Konfiguration für Frontend
    const publicConfig = {
      features: config.features ? { ...config.features } : {},
      layout: config.layout,
      seo: config.seo,
      theme: config.theme,
      lastUpdated: new Date().toISOString()
    };
    
    if (publicConfig.features?.auth && publicConfig.features?.auth?.adminPassword) {
      const { adminPassword, ...authWithoutPassword } = publicConfig.features.auth;
      publicConfig.features.auth = authWithoutPassword;
    }
    
    if (publicConfig.features?.terminal) {
      const { password, rootPassword, root_password, ...terminalWithoutPasswords } = publicConfig.features.terminal;
      publicConfig.features.terminal = terminalWithoutPasswords;
    }
    
    // Schreibe config/config.json (nested structure)
    const configOutputDir = path.join(OUTPUT_DIR, 'config');
    if (!fs.existsSync(configOutputDir)) {
      fs.mkdirSync(configOutputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(configOutputDir, 'config.json'),
      JSON.stringify(publicConfig, null, 2)
    );
    console.log('✅ Generated config/config.json');

    console.log('\n🎉 Static data generation completed successfully!');
    console.log(`📊 Generated ${projectsData.totalCount} projects, ${skillsData.totalLanguages + skillsData.totalFrameworks + skillsData.totalTools} skills`);
    
    // Tech Stack Summary
    if (enableTechStack) {
      const techStackProjects = projectsData.projects.filter(p => p.techStack && p.techStack.confidence > 0);
      console.log(`🚀 Tech Stack Analysis: ${techStackProjects.length}/${projectsData.totalCount} projects analyzed`);
    }
    
    // Prozess beenden um Hängen zu vermeiden
    process.exit(0);
    
    if (config.features.blog.enabled) {
      console.log(`📝 Generated ${blogData.totalCount} blog posts`);
    }
    if (config.features?.skills?.showTimeline) {
      console.log(`📈 Generated ${timelineData.timeline.length} timeline entries`);
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR: Failed to generate portfolio data');
    console.error('================================================');
    console.error(`Error: ${(error as Error).message}`);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your GitHub username in portfolio.config.js');
    console.error('2. Verify your GitHub token has proper permissions');
    console.error('3. Ensure you have internet connection');
    console.error('4. Check if GitHub API is accessible');
    console.error('\n💡 Only real GitHub data (API or web scraping) will be used - no hardcoded fallbacks.');
    
    process.exit(1);
  }
}

// ==================== CLI INTERFACE ====================

// CLI-Interface: Wenn das Script direkt ausgeführt wird
if (require.main === module) {
  const enableTechStack = process.argv[2] === 'techstack';
  
  console.log(`🚀 Starting Data Orchestrator...`);
  console.log(`🔍 Tech Stack Analysis: ${enableTechStack ? 'ENABLED' : 'DISABLED (default)'}`);
  
  // Führe das Script aus
  main(enableTechStack).catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

// ==================== EXPORTS ====================

export {
  fetchAllGitHubData,
  generateUserDataFromCache,
  generateProjectsDataFromCache,
  generateSkillsDataFromCache,
  generateBlogData,
  generateSkillsTimelineDataFromCache,
  main,
  // Types exportieren
  type UserData,
  type ProjectData,
  type ProjectsData,
  type SkillData,
  type SkillsData,
  type BlogPost,
  type BlogData,
  type TimelineEntry,
  type TimelineData
};
