#!/usr/bin/env node

/**
 * Add Frontmatter to Existing Project Files - TypeScript Version
 * 
 * Fügt Frontmatter zu allen bestehenden Projekt-Dateien hinzu
 * Mit TypeScript-Types und besserer Fehlerbehandlung
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// ==================== INTERFACES ====================

interface GitHubProject {
  name: string;
  full_name: string;
  topics: string[];
  stargazers_count: number;
  description?: string;
  html_url?: string;
  language?: string;
}

interface ProjectFrontmatter {
  status: string;
  featured: boolean;
  category: string;
  created: string;
  updated: string;
}

interface FrontmatterStats {
  processed: number;
  updated: number;
  added: number;
  errors: number;
}

// ==================== CONFIGURATION ====================

// Load configuration
// Load config at runtime - avoid build-time require
const config: any = {
  paths: {
    CONTENT_DIR: process.env.CONTENT_DIR || path.join(process.cwd(), 'private/data'),
    OUTPUT_DIR: process.env.OUTPUT_DIR || path.join(process.cwd(), 'public/data'),
  }
};

const PROJECTS_DIR = path.join(config.paths.OUTPUT_DIR, 'projects', 'details');
const PROJECTS_JSON = path.join(config.paths.OUTPUT_DIR, 'projects', 'projects.json');

// ==================== CATEGORY MAPPING ====================

const CATEGORY_MAP: Record<string, string> = {
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
  'nixos': 'System Management',
  'devops': 'DevOps',
  'hackathon': 'Hackathon Projects'
};

const FILENAME_CATEGORY_MAP: Record<string, string> = {
  'nixos': 'System Management',
  'ncc': 'System Management',
  'game': 'Gaming',
  'idle': 'Gaming',
  'blog': 'Web Development',
  'portfolio': 'Web Development',
  'hackathon': 'Hackathon Projects',
  'vibe': 'Hackathon Projects'
};

// ==================== MAIN CLASS ====================

class FrontmatterAdder {
  private githubProjects: GitHubProject[] = [];
  private stats: FrontmatterStats = {
    processed: 0,
    updated: 0,
    added: 0,
    errors: 0
  };

  constructor() {
    this.loadGitHubProjects();
  }

  /**
   * Load GitHub project data
   */
  private loadGitHubProjects(): void {
    try {
      if (fs.existsSync(PROJECTS_JSON)) {
        const projectsData = fs.readFileSync(PROJECTS_JSON, 'utf8');
        const parsedData = JSON.parse(projectsData);
        this.githubProjects = parsedData.projects || parsedData || [];
        console.log(`📊 Loaded ${this.githubProjects.length} GitHub projects`);
      } else {
        console.log('⚠️  projects.json not found, using fallback categories');
      }
    } catch (error) {
      console.log('⚠️  Could not load projects.json, using fallback categories');
      this.githubProjects = [];
    }
  }

  /**
   * Get category from GitHub topics
   */
  private getCategoryFromTopics(topics: string[], customCategories: Record<string, string> = {}): string {
    const categoryMap = { ...CATEGORY_MAP, ...customCategories };
    
    for (const topic of topics) {
      if (categoryMap[topic]) {
        return categoryMap[topic];
      }
    }
    
    return 'Other';
  }

  /**
   * Find GitHub project for a filename
   */
  private findGitHubProject(filename: string): GitHubProject | undefined {
    const projectName = filename.replace('.md', '');
    return this.githubProjects.find(project => 
      project.name.toLowerCase() === projectName.toLowerCase() ||
      project.full_name.toLowerCase().includes(projectName.toLowerCase())
    );
  }

  /**
   * Get category from filename (fallback)
   */
  private getCategoryFromFilename(filename: string): string {
    const lowerFilename = filename.toLowerCase();
    
    for (const [keyword, category] of Object.entries(FILENAME_CATEGORY_MAP)) {
      if (lowerFilename.includes(keyword)) {
        return category;
      }
    }
    
    return 'Other';
  }

  /**
   * Generate frontmatter for a project file
   */
  private generateFrontmatter(filename: string): ProjectFrontmatter {
    const today = new Date().toISOString().split('T')[0];
    
    // Find GitHub project
    const githubProject = this.findGitHubProject(filename);
    let category = 'Other';
    let featured = false;
    
    if (githubProject) {
      // Use GitHub category
      category = this.getCategoryFromTopics(githubProject.topics || []);
      
      // Determine featured status based on stars
      featured = githubProject.stargazers_count >= 5;
      
      console.log(`📁 ${filename}: GitHub category "${category}", featured: ${featured}`);
    } else {
      // Fallback based on filename
      category = this.getCategoryFromFilename(filename);
      console.log(`📁 ${filename}: Fallback category "${category}"`);
    }
    
    return {
      status: 'active',
      featured,
      category,
      created: today,
      updated: today
    };
  }

  /**
   * Add or update frontmatter for a single file
   */
  private processFile(filePath: string, filename: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if frontmatter already exists
      const hasExistingFrontmatter = content.startsWith('---');
      
      if (hasExistingFrontmatter) {
        console.log(`🔄 Updating frontmatter for ${filename}`);
      }
      
      // Generate new frontmatter
      const frontmatterData = this.generateFrontmatter(filename);
      
      let newContent: string;
      
      if (hasExistingFrontmatter) {
        // Replace existing frontmatter and remove empty lines
        const markdownContent = content.replace(/^---\n[\s\S]*?\n---\n\s*/, '');
        newContent = matter.stringify(markdownContent, frontmatterData);
      } else {
        // Add new frontmatter
        newContent = matter.stringify(content, frontmatterData);
      }
      
      // Write updated content
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      // Update stats
      this.stats.processed++;
      if (hasExistingFrontmatter) {
        this.stats.updated++;
        console.log(`✅ Updated frontmatter for ${filename}`);
      } else {
        this.stats.added++;
        console.log(`✅ Added frontmatter to ${filename}`);
      }
      
    } catch (error) {
      this.stats.errors++;
      console.error(`❌ Error processing ${filename}:`, (error as Error).message);
    }
  }

  /**
   * Main function: Add frontmatter to all project files
   */
  async addFrontmatterToProjects(): Promise<void> {
    console.log('🔧 Adding frontmatter to existing project files...');
    
    try {
      // Check if projects directory exists
      if (!fs.existsSync(PROJECTS_DIR)) {
        console.error(`❌ Projects directory not found: ${PROJECTS_DIR}`);
        return;
      }
      
      const files = fs.readdirSync(PROJECTS_DIR);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      if (mdFiles.length === 0) {
        console.log('⚠️  No markdown files found in projects directory');
        return;
      }
      
      console.log(`📁 Found ${mdFiles.length} markdown files to process`);
      
      // Process each markdown file
      for (const file of mdFiles) {
        const filePath = path.join(PROJECTS_DIR, file);
        this.processFile(filePath, file);
      }
      
      // Print final statistics
      this.printStats();
      
    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * Print processing statistics
   */
  private printStats(): void {
    console.log('\n📊 Frontmatter Processing Statistics:');
    console.log(`- Total processed: ${this.stats.processed}`);
    console.log(`- Added: ${this.stats.added}`);
    console.log(`- Updated: ${this.stats.updated}`);
    console.log(`- Errors: ${this.stats.errors}`);
    
    if (this.stats.processed > 0) {
      console.log(`\n🎉 Successfully processed ${this.stats.processed} project files!`);
    }
  }

  /**
   * Validate configuration
   */
  validateConfig(): void {
    if (!fs.existsSync(PROJECTS_DIR)) {
      throw new Error(`Projects directory not found: ${PROJECTS_DIR}`);
    }
  }
}

// ==================== CLI INTERFACE ====================

/**
 * CLI Interface
 */
async function main(): Promise<void> {
  const adder = new FrontmatterAdder();
  
  try {
    adder.validateConfig();
    await adder.addFrontmatterToProjects();
    
  } catch (error) {
    console.error('❌ Frontmatter addition failed:', (error as Error).message);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

// ==================== EXPORTS ====================

export {
  FrontmatterAdder,
  type GitHubProject,
  type ProjectFrontmatter,
  type FrontmatterStats
};
