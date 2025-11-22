#!/usr/bin/env node

/**
 * Skill Calculator - Ehrliche Skill-Einschätzung basierend auf GitHub-Repositories
 * 
 * Features:
 * - Code-Qualität basierend auf Repository-Metriken
 * - Projekt-Komplexität berechnen
 * - Maintenance-Aktivität bewerten
 * - AI-Usage-Factor berücksichtigen (30% Reduktion)
 * - Vollständig TypeScript mit Type Safety
 */

import * as fs from 'fs';
import * as path from 'path';

// Lade .env-Datei aus dem Root-Verzeichnis
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

// Lade Portfolio-Konfiguration
// Lade Portfolio-Konfiguration - use runtime loading to avoid build-time errors
const config: any = {
  github: {
    username: process.env.GITHUB_USERNAME || ''
  }
};

// GitHub API Konfiguration
const GITHUB_USERNAME: string = config.github.username;
const GITHUB_TOKEN: string | undefined = process.env.GITHUB_TOKEN;
const API_BASE = 'https://api.github.com';

// ==================== INTERFACES ====================

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  size: number;
  topics: string[];
  updated_at: string;
  created_at: string;
  has_readme: boolean;
  has_issues: boolean;
  fork: boolean;
  private: boolean;
}

interface LanguageStats {
  repos: GitHubRepository[];
  count: number;
}

interface SkillAnalysis {
  [language: string]: {
    count: number;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    repos: Array<{
      name: string;
      size: number;
      stars: number;
      updated: string;
      topics: string[];
    }>;
  };
}

interface ApiConfig {
  username: string;
  token?: string;
  hasToken: boolean;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Validiert API-Konfiguration
 */
function validateApiConfig(): ApiConfig {
  if (!GITHUB_USERNAME) {
    throw new Error('GitHub username not configured');
  }
  
  return {
    username: GITHUB_USERNAME,
    token: GITHUB_TOKEN,
    hasToken: !!GITHUB_TOKEN
  };
}

/**
 * Fetcht GitHub-Daten mit Error-Handling
 */
async function fetchGitHubData(url: string): Promise<any> {
  try {
    console.log(`📡 Fetching: ${url}`);
    
    const headers: { [key: string]: string } = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Skill-Analyzer/1.0'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const response = await fetch(url, { 
      headers
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, (error as Error).message);
    return null;
  }
}

/**
 * Berechnet Code-Qualität basierend auf Repository-Metriken
 */
function calculateCodeQuality(repo: GitHubRepository): number {
  let quality = 0;
  
  // README vorhanden
  if (repo.has_readme) quality += 2;
  
  // Tests vorhanden (basierend auf Dateinamen)
  const testFiles = ['test', 'spec', '__tests__', '.test.', '.spec.'];
  const hasTests = testFiles.some(pattern => 
    repo.name.toLowerCase().includes(pattern) || 
    (repo.description && repo.description.toLowerCase().includes(pattern))
  );
  if (hasTests) quality += 2;
  
  // Dokumentation
  if (repo.description && repo.description.length > 50) quality += 1;
  
  // CI/CD Pipeline
  if (repo.has_issues) quality += 1;
  
  // Repository-Größe (nicht nur Hello World)
  if (repo.size > 1000) quality += 1;
  
  return Math.min(quality, 7); // Max 7 Punkte
}

/**
 * Berechnet Projekt-Komplexität
 */
function calculateComplexity(repo: GitHubRepository): number {
  let complexity = 0;
  
  // Repository-Größe
  if (repo.size > 5000) complexity += 2;
  else if (repo.size > 1000) complexity += 1;
  
  // Topics (verschiedene Technologien)
  if (repo.topics && repo.topics.length > 3) complexity += 2;
  else if (repo.topics && repo.topics.length > 1) complexity += 1;
  
  // Stars (Community-Bewertung)
  if (repo.stargazers_count > 10) complexity += 1;
  
  // Forks (wird verwendet)
  if (repo.forks_count > 5) complexity += 1;
  
  return Math.min(complexity, 6); // Max 6 Punkte
}

/**
 * Berechnet Maintenance-Aktivität
 */
function calculateMaintenance(repo: GitHubRepository): number {
  let maintenance = 0;
  
  // Letzte Aktivität
  const lastUpdate = new Date(repo.updated_at);
  const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  
  if (lastUpdate > sixMonthsAgo) {
    maintenance += 3; // Aktiv in letzten 6 Monaten
  } else if (lastUpdate > new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)) {
    maintenance += 1; // Aktiv in letzten 12 Monaten
  }
  
  // Commits (geschätzt basierend auf Größe)
  if (repo.size > 10000) maintenance += 2;
  else if (repo.size > 1000) maintenance += 1;
  
  return Math.min(maintenance, 5); // Max 5 Punkte
}

/**
 * Berechnet ehrliche Skill-Levels
 */
function getHonestSkillLevel(repos: GitHubRepository[], language: string): 'Beginner' | 'Intermediate' | 'Advanced' {
  const languageRepos = repos.filter(r => r.language === language);
  
  if (languageRepos.length === 0) return 'Beginner';
  
  // Nur aktive Repositories (letzte 12 Monate)
  const activeRepos = languageRepos.filter(r => {
    const lastUpdate = new Date(r.updated_at);
    const twelveMonthsAgo = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000);
    return lastUpdate > twelveMonthsAgo;
  });
  
  if (activeRepos.length === 0) return 'Beginner';
  
  // Berechne Durchschnittswerte
  const avgQuality = activeRepos.reduce((sum, repo) => 
    sum + calculateCodeQuality(repo), 0) / activeRepos.length;
  
  const avgComplexity = activeRepos.reduce((sum, repo) => 
    sum + calculateComplexity(repo), 0) / activeRepos.length;
  
  const avgMaintenance = activeRepos.reduce((sum, repo) => 
    sum + calculateMaintenance(repo), 0) / activeRepos.length;
  
  // Gewichtung: 40% Qualität, 35% Komplexität, 25% Maintenance
  const totalScore = (avgQuality * 0.4) + (avgComplexity * 0.35) + (avgMaintenance * 0.25);
  
  // AI-Usage-Factor: Reduziert alle Skills um 30% (weil hauptsächlich AI genutzt wird)
  const aiAdjustedScore = totalScore * 0.7;
  
  console.log(`📊 ${language}: Quality=${avgQuality.toFixed(1)}, Complexity=${avgComplexity.toFixed(1)}, Maintenance=${avgMaintenance.toFixed(1)}, Total=${totalScore.toFixed(1)}, AI-Adjusted=${aiAdjustedScore.toFixed(1)}`);
  
  // Ehrliche Einschätzung
  if (aiAdjustedScore >= 5) return 'Advanced';
  if (aiAdjustedScore >= 3) return 'Intermediate';
  return 'Beginner';
}

// ==================== MAIN CLASS ====================

class SkillCalculator {
  private config: ApiConfig;
  
  constructor() {
    this.config = validateApiConfig();
  }
  
  /**
   * Validiert Konfiguration
   */
  validateConfig(): void {
    console.log('👤 Skill Calculator: Using GitHub username:', this.config.username);
    console.log('🔑 GitHub token:', this.config.hasToken ? 'Configured' : 'Not configured');
  }
  
  /**
   * Hauptfunktion: Analysiert Skills
   */
  async analyzeSkills(): Promise<SkillAnalysis> {
    console.log('🔍 Starting honest skill analysis...');
    
    // Fetche alle Repositories
    const repos = await fetchGitHubData(`${API_BASE}/users/${this.config.username}/repos?per_page=100&sort=updated`);
    
    if (!repos) {
      throw new Error('Failed to fetch repositories');
    }
    
    console.log(`📦 Found ${repos.length} repositories`);
    
    // Gruppiere nach Sprache
    const languageStats: { [language: string]: LanguageStats } = {};
    
    repos.forEach((repo: GitHubRepository) => {
      if (repo.language) {
        if (!languageStats[repo.language]) {
          languageStats[repo.language] = {
            repos: [],
            count: 0
          };
        }
        languageStats[repo.language].repos.push(repo);
        languageStats[repo.language].count++;
      }
    });
    
    // Analysiere jede Sprache
    const skillAnalysis: SkillAnalysis = {};
    
    for (const [language, data] of Object.entries(languageStats)) {
      if (data.count >= 1) { // Nur Sprachen mit mindestens 1 Repo
        const level = getHonestSkillLevel(repos, language);
        skillAnalysis[language] = {
          count: data.count,
          level: level,
          repos: data.repos.map(r => ({
            name: r.name,
            size: r.size,
            stars: r.stargazers_count,
            updated: r.updated_at,
            topics: r.topics || []
          }))
        };
      }
    }
    
    return skillAnalysis;
  }
  
  /**
   * Speichert Skill-Analyse
   */
  async saveSkillAnalysis(skillAnalysis: SkillAnalysis, outputPath: string): Promise<void> {
    fs.writeFileSync(outputPath, JSON.stringify(skillAnalysis, null, 2));
    console.log('✅ Analysis complete! Check skill-analysis.json');
    
    // Zeige Zusammenfassung
    console.log('\n📋 Skill Summary:');
    Object.entries(skillAnalysis).forEach(([lang, data]) => {
      console.log(`  ${lang}: ${data.level} (${data.count} repos)`);
    });
  }
}

// ==================== MAIN FUNCTION ====================

async function main(): Promise<void> {
  try {
    const calculator = new SkillCalculator();
    calculator.validateConfig();
    
    const skillAnalysis = await calculator.analyzeSkills();
    
    // Output in Root-Verzeichnis
    const outputPath = path.resolve(__dirname, '../../../../skill-analysis.json');
    await calculator.saveSkillAnalysis(skillAnalysis, outputPath);
    
    // Prozess beenden um Hängen zu vermeiden
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Skill analysis failed:', (error as Error).message);
    process.exit(1);
  }
}

// ==================== CLI INTERFACE ====================

if (require.main === module) {
  main();
}

// ==================== EXPORTS ====================

export {
  SkillCalculator,
  main,
  // Types exportieren
  type GitHubRepository,
  type LanguageStats,
  type SkillAnalysis,
  type ApiConfig
};
