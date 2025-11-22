import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface DataPipelineConfig {
  githubUsername: string;
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioAuthor: string;
  includeBlogPosts?: boolean;
  includeSkills?: boolean;
  includeTerminal?: boolean;
  playwrightMode?: 'headed' | 'headless';
  appearance?: {
    design?: string;
    theme?: string;
    displayMode?: string;
    useDesignDefaults?: boolean;
  };
  githubFilter?: {
    includeForks: boolean;
    includeTemplates: boolean;
    includePrivate: boolean;
    minStars: number;
    excludeRepos: string[];
    featuredProjects: string[];
    selectedRepos?: string[]; // List of repo names to actually scrape
  };
}

interface DataPipelineResult {
  data: {
    user?: any;
    projects?: any[];
    skills?: any[];
    blog?: any[];
    terminal?: any;
  };
  errors: string[];
  executionTime: number;
  validation?: {
    total: number;
    valid: number;
    invalid: number;
    results: Record<string, any>;
    invalidFiles: string[];
  };
}

class DataPipeline {
  private config: DataPipelineConfig;
  private startTime: number = 0;

  constructor(config: DataPipelineConfig) {
    this.config = config;
  }

  /**
   * Markdown conversion removed - JSON-only architecture
   * Data is now saved directly as JSON, no conversion needed
   */

  /**
   * Validate all JSON files after creation
   */
  private async validateJsonFiles(): Promise<{
    total: number;
    valid: number;
    invalid: number;
    results: Record<string, any>;
    invalidFiles: string[];
  }> {
    try {
      const { jsonValidator } = await import('@/features/editor/services/jsonValidator');
      const { getSchemaForPath } = await import('@/features/editor/services/jsonSchema');
      const { promises: fs } = await import('fs');
      const path = await import('path');
      
      const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');
      const results: Record<string, any> = {};
      const files: string[] = [];

      // Find all JSON files
      async function findJsonFiles(dir: string): Promise<string[]> {
        const found: string[] = [];
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              found.push(...(await findJsonFiles(fullPath)));
            } else if (entry.name.endsWith('.json')) {
              found.push(fullPath);
            }
          }
        } catch (error) {
          // Directory doesn't exist
        }
        return found;
      }

      const jsonFiles = await findJsonFiles(PRIVATE_DATA_DIR);

      // Filter out index files and config files - only validate detail files (project details, blog posts, etc.)
      const indexFiles = ['projects.json', 'blog.json', 'user.json', 'about.json', 'skills.json', 'config.json'];
      
      // Get selected repos to only validate files for currently generated projects
      const selectedRepos = this.config.githubFilter?.selectedRepos || [];
      const selectedRepoNames = selectedRepos.map((name: string) => name.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
      
      for (const filePath of jsonFiles) {
        try {
          const relativePath = path.relative(PRIVATE_DATA_DIR, filePath);
          const fileName = path.basename(relativePath);
          
          // Skip index files - they are auto-generated and not user-editable
          if (indexFiles.includes(fileName)) {
            continue;
          }
          
          // If selectedRepos is set, only validate project detail files for selected repos
          if (selectedRepos.length > 0 && relativePath.startsWith('projects/details/')) {
            // Extract project name from file path (e.g., "projects/details/codebreaker.json" -> "codebreaker")
            const projectName = fileName.replace('.json', '').toLowerCase();
            // Check if this project is in the selected repos list
            if (!selectedRepoNames.includes(projectName)) {
              continue; // Skip old/unselected project files
            }
          }
          
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          const schema = getSchemaForPath(relativePath);
          const result = jsonValidator.validate(data, schema);
          results[relativePath] = result;
          files.push(relativePath);
        } catch (error) {
          console.error(`Error validating ${filePath}:`, error);
          const relativePath = path.relative(PRIVATE_DATA_DIR, filePath);
          const fileName = path.basename(relativePath);
          
          // Skip index files even in error case
          if (!indexFiles.includes(fileName)) {
            results[relativePath] = {
              isValid: false,
              errors: [{ path: '/', message: error instanceof Error ? error.message : 'Validation error' }]
            };
          }
        }
      }

      const validFiles = Object.values(results).filter((r: any) => r.isValid).length;
      const invalidFiles = Object.values(results).filter((r: any) => !r.isValid).length;
      const invalidFilePaths = Object.entries(results)
        .filter(([_, result]: [string, any]) => !result.isValid)
        .map(([path]) => path);

      return {
        total: files.length,
        valid: validFiles,
        invalid: invalidFiles,
        results,
        invalidFiles: invalidFilePaths,
      };
    } catch (error) {
      console.error('Validation failed:', error);
      return {
        total: 0,
        valid: 0,
        invalid: 0,
        results: {},
        invalidFiles: [],
      };
    }
  }

  /**
   * Execute complete data pipeline
   */
  async execute(): Promise<DataPipelineResult> {
    this.startTime = Date.now();
    const errors: string[] = [];
    const data: any = {};

    try {
      console.log('🚀 Starting data pipeline execution...');
      
      // 1. Markdown conversion removed - JSON-only architecture
      // Data is now saved directly as JSON, no conversion needed

      // 2. Generate user data
      try {
        data.user = await this.generateUserData();
        console.log('✅ User data generated');
      } catch (error) {
        errors.push(`User data generation failed: ${error}`);
        console.error('❌ User data generation failed:', error);
      }

      // Step 2: Fetch and process GitHub projects
      try {
        data.projects = await this.fetchGitHubProjects();
        console.log(`✅ GitHub projects fetched: ${data.projects?.length || 0} projects`);
      } catch (error) {
        errors.push(`GitHub projects fetch failed: ${error}`);
        console.error('❌ GitHub projects fetch failed:', error);
      }

      // Step 3: Generate skills data
      if (this.config.includeSkills !== false) {
        try {
          data.skills = await this.generateSkillsData(data.projects || []);
          console.log('✅ Skills data generated');
        } catch (error) {
          errors.push(`Skills data generation failed: ${error}`);
          console.error('❌ Skills data generation failed:', error);
        }
      }

      // Step 4: Generate blog data
      if (this.config.includeBlogPosts !== false) {
        try {
          data.blog = await this.generateBlogData();
          console.log('✅ Blog data generated');
        } catch (error) {
          errors.push(`Blog data generation failed: ${error}`);
          console.error('❌ Blog data generation failed:', error);
        }
      }

      // Step 4.5: Generate about me data (always generate, can be edited later)
      try {
        data.about = await this.generateAboutData(data.user);
        console.log('✅ About Me data generated');
      } catch (error) {
        errors.push(`About Me data generation failed: ${error}`);
        console.error('❌ About Me data generation failed:', error);
      }

      // Step 5: Generate terminal data
      if (this.config.includeTerminal !== false) {
        try {
          data.terminal = await this.generateTerminalData();
          console.log('✅ Terminal data generated');
        } catch (error) {
          errors.push(`Terminal data generation failed: ${error}`);
          console.error('❌ Terminal data generation failed:', error);
        }
      }

      // Step 6: Save all data to files (in private/data - will be published later)
      await this.saveDataToFiles(data);
      
      // Step 7: Save appearance configuration
      await this.saveAppearanceConfig();
      
      // Step 8: Validate JSON files after creation
      console.log('🔍 Validating JSON files...');
      const validation = await this.validateJsonFiles();
      console.log(`✅ Validation complete: ${validation.valid}/${validation.total} files valid`);
      
      // Set setupComplete status after successful data generation
      try {
        const { writeSiteStatus } = await import('@/features/shared/utils/siteStatus');
        await writeSiteStatus({
          setupComplete: true,
          setupAt: new Date().toISOString()
        });
        console.log('✅ Setup status set to complete');
      } catch (error) {
        console.warn('⚠️ Failed to set setup status, but data was saved:', error);
      }

      const executionTime = Date.now() - this.startTime;
      console.log(`🎉 Data pipeline completed in ${executionTime}ms`);

      return {
        data,
        errors,
        executionTime,
        validation
      };

    } catch (error) {
      const executionTime = Date.now() - this.startTime;
      console.error('💥 Data pipeline failed:', error);
      
      return {
        data,
        errors: [...errors, `Pipeline execution failed: ${error}`],
        executionTime
      };
    }
  }

  /**
   * Generate user data from config
   */
  private async generateUserData(): Promise<any> {
    return {
      name: this.config.portfolioAuthor,
      username: this.config.githubUsername,
      bio: this.config.portfolioDescription,
      location: '',
      website: '',
      twitter: '',
      github: `https://github.com/${this.config.githubUsername}`,
      linkedin: '',
      email: '',
      avatar: `https://avatars.githubusercontent.com/${this.config.githubUsername}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 🧠 SIMPLE ENVIRONMENT DETECTION
   * Local = Headed, External = Headless
   */
  private detectServerEnvironment(): boolean {
    // Simple logic: If no display = external server
    const isExternal = !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY;
    
    console.log(`🔍 Environment: ${isExternal ? 'EXTERNAL' : 'LOCAL'}`);
    console.log(`🖥️ Display available: ${process.env.DISPLAY ? 'YES' : 'NO'}`);
    
    return isExternal;
  }

  /**
   * Apply GitHub filter to repositories
   */
  private applyGitHubFilter(repos: any[]): any[] {
    const filter = this.config.githubFilter || {
      includeForks: false,
      includeTemplates: false,
      includePrivate: false,
      minStars: 0,
      excludeRepos: [],
      featuredProjects: [],
      selectedRepos: undefined,
    };

    console.log('🔍 Applying filters:', JSON.stringify(filter, null, 2));
    console.log(`📊 Before filtering: ${repos.length} repositories`);

    let filtered = [...repos];
    const beforeCount = filtered.length;
    
    // If selectedRepos list exists, use it directly (from Step 2)
    if (filter.selectedRepos && Array.isArray(filter.selectedRepos) && filter.selectedRepos.length > 0) {
      console.log(`📋 Using selectedRepos list: ${filter.selectedRepos.length} repos`);
      filtered = repos.filter((repo: any) => filter.selectedRepos!.includes(repo.name));
      console.log(`✅ Filtered to ${filtered.length} repositories using selectedRepos list`);
      return filtered;
    }

    // Filter by forks
    if (!filter.includeForks) {
      const forkCount = filtered.filter((repo) => repo.fork).length;
      filtered = filtered.filter((repo) => !repo.fork);
      if (forkCount > 0) {
        console.log(`  ❌ Excluded ${forkCount} fork(s)`);
      }
    }

    // Filter by templates
    if (!filter.includeTemplates) {
      const templateCount = filtered.filter((repo) => repo.is_template).length;
      filtered = filtered.filter((repo) => !repo.is_template);
      if (templateCount > 0) {
        console.log(`  ❌ Excluded ${templateCount} template(s)`);
      }
    }

    // Filter by private repositories
    if (!filter.includePrivate) {
      const privateCount = filtered.filter((repo) => repo.visibility === 'private').length;
      filtered = filtered.filter((repo) => repo.visibility !== 'private');
      if (privateCount > 0) {
        console.log(`  ❌ Excluded ${privateCount} private repo(s)`);
      }
    }

    // Filter by minimum stars
    if (filter.minStars > 0) {
      const lowStarCount = filtered.filter(
        (repo) => (repo.stargazers_count || 0) < filter.minStars
      ).length;
      filtered = filtered.filter(
        (repo) => (repo.stargazers_count || 0) >= filter.minStars
      );
      if (lowStarCount > 0) {
        console.log(`  ❌ Excluded ${lowStarCount} repo(s) with < ${filter.minStars} stars`);
      }
    }

    // Exclude specific repositories
    if (filter.excludeRepos.length > 0) {
      const excluded = filtered.filter(
        (repo) => filter.excludeRepos.includes(repo.name)
      );
      filtered = filtered.filter(
        (repo) => !filter.excludeRepos.includes(repo.name)
      );
      if (excluded.length > 0) {
        console.log(`  ❌ Excluded ${excluded.length} repo(s): ${excluded.map(r => r.name).join(', ')}`);
      }
    }

    console.log(`✅ After filtering: ${filtered.length} repositories (removed ${beforeCount - filtered.length})`);
    
    return filtered;
  }

  /**
   * Fetch GitHub projects using intelligent strategy
   */
  private async fetchGitHubProjects(): Promise<any[]> {
    try {
      // Get selectedRepos list to scrape only these repos
      const selectedRepos = this.config.githubFilter?.selectedRepos;
      
      // If selectedRepos exists, scrape only those repos
      if (selectedRepos && Array.isArray(selectedRepos) && selectedRepos.length > 0) {
        console.log(`📋 Scraping only ${selectedRepos.length} selected repos: ${selectedRepos.join(', ')}`);
        return await this.fetchSelectedRepos(selectedRepos);
      }
      
      // Otherwise, scrape all repos and filter afterwards
      let allProjects: any[] = [];

      // Strategy 1: Try GitHub API (if token available)
      if (process.env.GITHUB_TOKEN) {
        try {
          console.log('🔑 Using GitHub API...');
  
          const { fetchAllGitHubDataWithApi } = await import('@/features/setup/scripts/api-scraper');
          const data = await fetchAllGitHubDataWithApi(true);
          allProjects = data.repositories || [];
          
          if (Array.isArray(allProjects) && allProjects.length > 0) {
            console.log('✅ GitHub API successful');
            return this.applyGitHubFilter(allProjects);
          }
        } catch (apiError) {
          console.warn('GitHub API failed, trying Playwright...', apiError);
        }
      }

      // Strategy 2: Try Playwright (no token needed)
      try {
        console.log('🎭 Using Playwright...');
        
        const { scrapeAllGitHubDataWithPlaywright } = await import('@/features/setup/scripts/playwright-scrapping');
        const data = await scrapeAllGitHubDataWithPlaywright();
        allProjects = data[1];
        
        if (Array.isArray(allProjects) && allProjects.length > 0) {
          console.log('✅ Playwright successful');
          return this.applyGitHubFilter(allProjects);
        }
      } catch (playwrightError) {
        console.warn('Playwright failed, trying HTTP...', playwrightError);
      }

      // Strategy 3: Try basic HTTP scraping
      try {
        console.log('🌐 Using basic HTTP...');
        
        const { scrapeRepositories } = await import('@/features/setup/scripts/web-scraper');
        allProjects = await scrapeRepositories() || [];
        
        if (Array.isArray(allProjects) && allProjects.length > 0) {
          console.log('✅ HTTP successful');
          return this.applyGitHubFilter(allProjects);
        }
      } catch (httpError) {
        console.warn('HTTP failed, using fallback data...', httpError);
      }

      // Strategy 4: Fallback data
      console.log('📝 Using fallback data');
      return this.createBasicProjectData();
      
    } catch (error) {
      console.error('All strategies failed:', error);
      return this.createBasicProjectData();
    }
  }

  /**
   * Fetch only selected repositories by name
   */
  private async fetchSelectedRepos(selectedRepos: string[]): Promise<any[]> {
    const results: any[] = [];
    
    // Try GitHub API first (most reliable)
    if (process.env.GITHUB_TOKEN) {
      try {
        console.log('🔑 Using GitHub API for selected repos...');
        const { fetchRepositoryByName } = await import('@/features/setup/scripts/api-scraper');
        
        for (const repoName of selectedRepos) {
          try {
            const repo = await fetchRepositoryByName(repoName);
            if (repo) {
              results.push(repo);
              console.log(`✅ Fetched ${repoName}`);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to fetch ${repoName}:`, error);
          }
        }
        
        if (results.length > 0) {
          return results;
        }
      } catch (error) {
        console.warn('GitHub API failed for selected repos, trying fallback...', error);
      }
    }
    
    // Fallback: Try Playwright for selected repos
    try {
      console.log('🎭 Fallback: Using Playwright for selected repos...');
      const { scrapeAllGitHubDataWithPlaywright } = await import('@/features/setup/scripts/playwright-scrapping');
      const data = await scrapeAllGitHubDataWithPlaywright(false, selectedRepos);
      const allRepos = data[1] || [];
      console.log(`✅ Playwright: Successfully scraped ${allRepos.length} repositories`);
      return allRepos; // Already filtered by Playwright
    } catch (error) {
      console.warn('Fallback failed:', error);
      // Even if there's an error, try to return any partial data
      // The error might be just about sending events, not about scraping
      console.warn('⚠️ Returning empty array due to error - projects may have been scraped but not returned');
      return [];
    }
  }

  /**
   * Create basic project data as fallback
   */
  private createBasicProjectData(): any[] {
    return [
      {
        id: 1,
        name: `${this.config.portfolioTitle} Portfolio`,
        description: this.config.portfolioDescription,
        html_url: `https://github.com/${this.config.githubUsername}`,
        homepage: '',
        stargazers_count: 0,
        topics: ['portfolio', 'website'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  /**
   * Generate skills data from projects
   */
  private async generateSkillsData(projects: any[]): Promise<any[]> {
    // Extract technologies from projects
    const technologies = new Set<string>();
    
    projects.forEach(project => {
      if (project.topics) {
        project.topics.forEach((topic: string) => {
          technologies.add(topic);
        });
      }
    });

    // Convert to skills array
    const skills = Array.from(technologies).map((tech, index) => ({
      name: tech,
      level: Math.floor(Math.random() * 5) + 1, // Random level 1-5
      category: this.categorizeTechnology(tech),
      years: Math.floor(Math.random() * 3) + 1, // Random years 1-3
      projects: Math.floor(Math.random() * 5) + 1, // Random project count
      description: `Experience with ${tech}`
    }));

    return skills;
  }

  /**
   * Categorize technology by type
   */
  private categorizeTechnology(tech: string): string {
    const categories: { [key: string]: string[] } = {
      'frontend': ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript'],
      'backend': ['node', 'python', 'java', 'php', 'ruby', 'go', 'rust'],
      'database': ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite'],
      'devops': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins'],
      'mobile': ['react-native', 'flutter', 'ios', 'android', 'swift', 'kotlin']
    };

    for (const [category, techs] of Object.entries(categories)) {
      if (techs.some(t => tech.toLowerCase().includes(t))) {
        return category;
      }
    }

    return 'other';
  }

  /**
   * Generate blog data
   */
  private async generateBlogData(): Promise<any[]> {
    // Create sample blog posts
    return [
      {
        id: '1',
        title: `Welcome to ${this.config.portfolioTitle}`,
        content: `Welcome to my portfolio! This is a sample blog post.`,
        excerpt: `Welcome to my portfolio!`,
        date: new Date().toISOString(),
        tags: ['welcome', 'portfolio'],
        slug: 'welcome-to-portfolio'
      }
    ];
  }

  /**
   * Generate about me data
   */
  private async generateAboutData(userData: any): Promise<any> {
    // Create about me content from user data
    const aboutContent = userData?.bio || this.config.portfolioDescription || '';
    
    return {
      content: aboutContent ? `# About Me\n\n${aboutContent}` : '# About Me\n\nAdd your about me content here...',
      htmlContent: null,
      metadata: {
        lastModified: new Date().toISOString(),
        generatedBy: 'setup-wizard'
      }
    };
  }

  /**
   * Generate terminal data
   * Note: Terminal data generation is now handled in the Terminal Editor.
   * This method returns empty data to indicate terminal should be configured in Editor.
   */
  private async generateTerminalData(): Promise<any> {
    // Terminal data generation moved to Terminal Editor
    // Setup wizard only enables/disables the terminal feature
    return null;
  }

  /**
   * Save all data to files (in private/data - will be published to public/data later)
   * Creates index files (minimal data) and detail files (full data) separately
   */
  private async saveDataToFiles(data: any): Promise<void> {
    const dataDir = path.join(process.cwd(), 'private/data');
    
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Save user data
    if (data.user) {
      const userDir = path.join(dataDir, 'user');
      await fs.mkdir(userDir, { recursive: true });
      await fs.writeFile(
        path.join(userDir, 'user.json'),
        JSON.stringify(data.user, null, 2)
      );
    }

    // Save projects: Index + Detail files
    if (data.projects && Array.isArray(data.projects)) {
      const projectsDir = path.join(dataDir, 'projects');
      const detailsDir = path.join(projectsDir, 'details');
      await fs.mkdir(detailsDir, { recursive: true });

      // Create index (minimal data, no content/readme)
      const projectsIndex = data.projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        githubUrl: project.githubUrl || project.html_url,
        homepage: project.homepage || null,
        demoUrl: project.demoUrl || null,
        language: project.language || null,
        stars: project.stars || project.stargazers_count || 0,
        forks: project.forks || project.forks_count || 0,
        topics: project.topics || [],
        tags: project.tags || [],
        updatedAt: project.updatedAt || project.updated_at,
        createdAt: project.createdAt || project.created_at,
        size: project.size || 0,
        featured: project.featured || false,
        category: project.category || 'Other',
        technologies: project.technologies || [],
        difficulty: project.difficulty || 'intermediate',
        status: project.status || 'active',
        contributors: project.contributors || 1,
        screenshots: project.screenshots || []
      }));

      await fs.writeFile(
        path.join(projectsDir, 'projects.json'),
        JSON.stringify(projectsIndex, null, 2)
      );

      // Create detail files (full data with content)
      for (const project of data.projects) {
        const fileName = `${project.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.json`;
        const detailFile = {
          id: project.id,
          name: project.name,
          description: project.description,
          content: project.readme || project.longDescription || project.content || '',
          htmlContent: project.htmlContent || null,
          githubUrl: project.githubUrl || project.html_url,
          homepage: project.homepage || null,
          demoUrl: project.demoUrl || null,
          language: project.language || null,
          stars: project.stars || project.stargazers_count || 0,
          forks: project.forks || project.forks_count || 0,
          topics: project.topics || [],
          tags: project.tags || [],
          updatedAt: project.updatedAt || project.updated_at,
          createdAt: project.createdAt || project.created_at,
          size: project.size || 0,
          featured: project.featured || false,
          category: project.category || 'Other',
          technologies: project.technologies || [],
          difficulty: project.difficulty || 'intermediate',
          status: project.status || 'active',
          contributors: project.contributors || 1,
          screenshots: project.screenshots || [],
          techStack: project.techStack || null,
          techStackSummary: project.techStackSummary || null,
          readme: project.readme || null,
          longDescription: project.longDescription || null
        };

        await fs.writeFile(
          path.join(detailsDir, fileName),
          JSON.stringify(detailFile, null, 2)
        );
      }

      console.log(`✅ Created ${projectsIndex.length} project index entries and detail files`);
    }

    // Save skills
    if (data.skills) {
      const skillsDir = path.join(dataDir, 'skills');
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.writeFile(
        path.join(skillsDir, 'skills.json'),
        JSON.stringify(data.skills, null, 2)
      );
    }

    // Save blog: Index + Detail files
    if (data.blog && Array.isArray(data.blog)) {
      const blogDir = path.join(dataDir, 'blog');
      const postsDir = path.join(blogDir, 'posts');
      await fs.mkdir(postsDir, { recursive: true });

      // Create index (minimal data, no content)
      const blogIndex = data.blog.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        excerpt: post.excerpt || '',
        publishedAt: post.publishedAt || post.date,
        updatedAt: post.updatedAt || post.date,
        author: post.author || '',
        category: post.category || '',
        tags: post.tags || [],
        featured: post.featured || false,
        draft: post.draft || false,
        status: post.status || 'published',
        readingTime: post.readingTime || 0,
        image: post.image || null
      }));

      await fs.writeFile(
        path.join(blogDir, 'blog.json'),
        JSON.stringify(blogIndex, null, 2)
      );

      // Create detail files (full data with content)
      for (const post of data.blog) {
        const slug = post.slug || post.id;
        const fileName = `${slug}.json`;
        const detailFile = {
          id: post.id,
          title: post.title,
          slug: slug,
          content: post.content || '',
          htmlContent: post.htmlContent || null,
          excerpt: post.excerpt || '',
          publishedAt: post.publishedAt || post.date,
          updatedAt: post.updatedAt || post.date,
          author: post.author || '',
          category: post.category || '',
          tags: post.tags || [],
          featured: post.featured || false,
          draft: post.draft || false,
          status: post.status || 'published',
          readingTime: post.readingTime || 0,
          image: post.image || null,
          difficulty: post.difficulty || null,
          technologies: post.technologies || []
        };

        await fs.writeFile(
          path.join(postsDir, fileName),
          JSON.stringify(detailFile, null, 2)
        );
      }

      console.log(`✅ Created ${blogIndex.length} blog index entries and detail files`);
    }

    // Save about (single file, no index needed)
    if (data.about) {
      const aboutDir = path.join(dataDir, 'about');
      await fs.mkdir(aboutDir, { recursive: true });
      await fs.writeFile(
        path.join(aboutDir, 'about.json'),
        JSON.stringify(data.about, null, 2)
      );
    }

    // Terminal files are not saved during setup
    // Terminal data generation happens in Terminal Editor after setup completion
  }

  /**
   * Markdown conversion removed - JSON-only architecture
   * Data is now saved in private/data during setup, published to public/data on Build & Publish
   */

  /**
   * Save appearance configuration (design, theme, display mode)
   */
  private async saveAppearanceConfig(): Promise<void> {
    if (!this.config.appearance) {
      return; // No appearance config to save
    }

    try {
      const configDir = path.join(process.cwd(), 'private/data/config');
      await fs.mkdir(configDir, { recursive: true });

      const configPath = path.join(configDir, 'config.json');
      let configJson: any = {};
      
      try {
        const existingContent = await fs.readFile(configPath, 'utf-8');
        configJson = JSON.parse(existingContent);
      } catch {
        // File doesn't exist, start with empty object
      }

      // Ensure portfolio.features.theme structure exists
      if (!configJson.portfolio) {
        configJson.portfolio = {};
      }
      if (!configJson.portfolio.features) {
        configJson.portfolio.features = {};
      }
      if (!configJson.portfolio.features.theme) {
        configJson.portfolio.features.theme = {};
      }

      // Save default design and theme
      if (this.config.appearance.design) {
        configJson.portfolio.features.theme.defaultDesign = this.config.appearance.design;
      }
      if (this.config.appearance.theme) {
        configJson.portfolio.features.theme.defaultTheme = this.config.appearance.theme;
      }

      // Save layout configuration (display mode)
      if (this.config.appearance.displayMode) {
        // Map display mode to layout template
        const displayModeToTemplate: Record<string, string> = {
          'portfolio': 'sidebar-left',
          'dashboard': 'two-column',
          'magazine': 'masonry',
          'minimal': 'centered',
          'grid': 'masonry',
          'split-screen': 'split-screen',
          'hero-content': 'hero-content',
          'carousel': 'carousel-layout',
          'sticky-sidebar': 'sticky-sidebar'
        };

        const template = displayModeToTemplate[this.config.appearance.displayMode] || 'sidebar-left';
        
        // Save to layout config
        const layoutConfigPath = path.join(process.cwd(), 'private/data/config/layout.json');
        const layoutConfig = {
          globalLayout: {
            template,
            displayMode: this.config.appearance.displayMode
          }
        };
        
        await fs.writeFile(layoutConfigPath, JSON.stringify(layoutConfig, null, 2));
        console.log('✅ Layout configuration saved');
      }

      // Write updated config.json
      await fs.writeFile(configPath, JSON.stringify(configJson, null, 2));
      console.log('✅ Appearance configuration saved');
    } catch (error) {
      console.warn('⚠️ Failed to save appearance configuration:', error);
      // Don't throw - appearance can be configured later
    }
  }
}

/**
 * Validiert GitHub Username Format
 * GitHub Username Regeln: 1-39 Zeichen, alphanumerisch + Bindestrich, nicht mit Bindestrich beginnen/enden
 */
function isValidGitHubUsername(username: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username);
}

/**
 * Validiert dass URL nur GitHub-Domains erlaubt (SSRF-Schutz)
 */
function isValidGitHubUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Nur github.com und api.github.com erlauben
    return parsed.hostname === 'github.com' || parsed.hostname === 'api.github.com';
  } catch {
    return false;
  }
}

// Helper function to read config.json
async function readConfigJson(): Promise<any> {
  try {
    // Try private/data first (during setup), fallback to public/data (after publish)
    const privateConfigPath = path.join(process.cwd(), 'private/data/config/config.json');
    const publicConfigPath = path.join(process.cwd(), 'public/data/config/config.json');
    
    let configPath = privateConfigPath;
    try {
      await fs.access(privateConfigPath);
    } catch {
      configPath = publicConfigPath;
    }
    const configContent = await fs.readFile(configPath, 'utf-8');
    
    if (!configContent || configContent.trim().length === 0) {
      return {};
    }
    
    return JSON.parse(configContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    console.warn('Could not read config.json:', error);
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    // Load githubFilter ONLY from config.json (single source of truth)
    const configJson = await readConfigJson();
    if (configJson.githubFilter) {
      config.githubFilter = configJson.githubFilter;
      console.log('📥 Loaded githubFilter from config.json, selectedRepos:', config.githubFilter.selectedRepos?.length || 0);
    } else {
      config.githubFilter = {
        includeForks: false,
        includeTemplates: false,
        includePrivate: false,
        minStars: 0,
        excludeRepos: [],
        featuredProjects: [],
      };
    }
    
    // Validate required fields - only githubUsername is required
    const { githubUsername } = config;
    
    if (!githubUsername) {
      return NextResponse.json({
        error: 'Missing required field: githubUsername'
      }, { status: 400 });
    }
    
    // 🔒 SICHERHEIT: Validiere GitHub Username Format
    if (!isValidGitHubUsername(githubUsername)) {
      return NextResponse.json({
        error: 'Invalid GitHub username format. Username must be 1-39 characters, alphanumeric with hyphens, and not start/end with hyphen.'
      }, { status: 400 });
    }
    
    // 🔒 SICHERHEIT: Validiere dass keine bösartigen URLs eingeschleust werden können
    const testUrl = `https://github.com/${githubUsername}`;
    if (!isValidGitHubUrl(testUrl)) {
      return NextResponse.json({
        error: 'Invalid URL format detected'
      }, { status: 400 });
    }
    
    // Check if client wants Server-Sent Events
    const acceptHeader = request.headers.get('accept');
    const wantsSSE = acceptHeader?.includes('text/event-stream');
    
    if (wantsSSE) {
      // 🚀 SERVER-SENT EVENTS für echte Live-Messages
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          let isClosed = false;
          
          const sendEvent = (data: any) => {
            if (isClosed) return; // Don't send if already closed
            try {
              const event = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(event));
            } catch (error) {
              // Controller might be closed, ignore
              isClosed = true;
            }
          };

          try {
            sendEvent({ type: 'start', message: '🚀 Starting data pipeline execution...' });
            
            const pipeline = new DataPipeline(config);
            
            // Track repository progress
            const repoProgress: Map<string, {
              name: string;
              status: 'scraping' | 'readme' | 'assets' | 'done' | 'error';
              readmeFound: boolean;
              readmeSize?: number;
              assetsCount: number;
              assetsTypes?: Record<string, number>;
              error?: string;
            }> = new Map();
            
            // Override console.log to send live messages
            const originalLog = console.log;
            console.log = (...args) => {
              originalLog(...args);
              const message = args.join(' ');
              
              // Parse repository progress messages
              // Match patterns like "for repo-name", "for repo_name", "for repoName"
              // BUT exclude common words and pure numbers
              const excludedWords = ['blog', 'project', 'all', 'ALL', 'Processing', 'Fetching', 'README', 'assets'];
              const repoNameMatch = message.match(/(?:for|Processing|Fetching README for|README for|assets for)\s+([a-zA-Z0-9_-]+)/);
              if (repoNameMatch) {
                const repoName = repoNameMatch[1];
                
                // Skip if it's a common word or pure number (like "1", "5", "4")
                if (excludedWords.includes(repoName) || /^\d+$/.test(repoName)) {
                  return;
                }
                
                // Only track repos that are in selectedRepos (if available)
                const filter = config.githubFilter;
                if (filter?.selectedRepos && filter.selectedRepos.length > 0) {
                  if (!filter.selectedRepos.includes(repoName)) {
                    return; // Skip tracking for excluded repos
                  }
                }
                
                if (!repoProgress.has(repoName)) {
                  repoProgress.set(repoName, {
                    name: repoName,
                    status: 'scraping',
                    readmeFound: false,
                    assetsCount: 0
                  });
                  sendEvent({ 
                    type: 'repo-start', 
                    repo: {
                      name: repoName,
                      status: 'scraping',
                      readmeFound: false,
                      assetsCount: 0
                    }
                  });
                }
                
                const repo = repoProgress.get(repoName)!;
                
                // README detection
                if (message.includes('📄 Fetching README') || message.includes('API Fetching README')) {
                  repo.status = 'readme';
                  sendEvent({ 
                    type: 'repo-progress', 
                    repo: { ...repo, status: 'readme' }
                  });
                }
                
                if (message.includes('✅ README fetched') || message.includes('✅ API Found README') || message.includes('✅ Found README')) {
                  const sizeMatch = message.match(/\((\d+)\s+chars\)/);
                  repo.readmeFound = true;
                  repo.readmeSize = sizeMatch ? parseInt(sizeMatch[1]) : undefined;
                  repo.status = 'assets';
                  sendEvent({ 
                    type: 'repo-progress', 
                    repo: { ...repo, readmeFound: true, readmeSize: repo.readmeSize, status: 'assets' }
                  });
                }
                
                if (message.includes('⚠️  No README found')) {
                  repo.readmeFound = false;
                  repo.status = 'done';
                  sendEvent({ 
                    type: 'repo-progress', 
                    repo: { ...repo, readmeFound: false, status: 'done' }
                  });
                }
                
                // Asset detection
                if (message.includes('📦 Found') && message.includes('assets')) {
                  const countMatch = message.match(/Found\s+(\d+)\s+assets/);
                  if (countMatch) {
                    repo.assetsCount = parseInt(countMatch[1]);
                    sendEvent({ 
                      type: 'repo-progress', 
                      repo: { ...repo, assetsCount: repo.assetsCount }
                    });
                  }
                }
                
                if (message.includes('📋 Asset breakdown:')) {
                  const breakdownMatch = message.match(/breakdown:\s*(.+?)(?:\s*$|,|\.)/);
                  if (breakdownMatch) {
                    const breakdown = breakdownMatch[1];
                    const types: Record<string, number> = {};
                    breakdown.split(',').forEach(part => {
                      const match = part.trim().match(/(\d+)\s+(\w+)/);
                      if (match) {
                        types[match[2]] = parseInt(match[1]);
                      }
                    });
                    repo.assetsTypes = types;
                    sendEvent({ 
                      type: 'repo-progress', 
                      repo: { ...repo, assetsTypes: types }
                    });
                  }
                }
                
                if (message.includes('✅ Downloaded') && message.includes('assets')) {
                  const countMatch = message.match(/Downloaded\s+(\d+)\s+assets/);
                  if (countMatch) {
                    repo.assetsCount = parseInt(countMatch[1]);
                    repo.status = 'done';
                    sendEvent({ 
                      type: 'repo-progress', 
                      repo: { ...repo, assetsCount: repo.assetsCount, status: 'done' }
                    });
                  }
                }
                
                if (message.includes('✅ Processed') && message.includes('assets')) {
                  const countMatch = message.match(/Processed\s+(\d+)\s+assets/);
                  if (countMatch) {
                    repo.assetsCount = parseInt(countMatch[1]);
                    repo.status = 'done';
                    sendEvent({ 
                      type: 'repo-progress', 
                      repo: { ...repo, assetsCount: repo.assetsCount, status: 'done' }
                    });
                  }
                }
                
                if (message.includes('📦 No assets found')) {
                  repo.assetsCount = 0;
                  repo.status = 'done';
                  sendEvent({ 
                    type: 'repo-progress', 
                    repo: { ...repo, assetsCount: 0, status: 'done' }
                  });
                }
                
                if (message.includes('❌ Error') || message.includes('⚠️  README/Assets fetch failed')) {
                  repo.status = 'error';
                  repo.error = message;
                  sendEvent({ 
                    type: 'repo-progress', 
                    repo: { ...repo, status: 'error', error: message }
                  });
                }
              }
              
              // General progress messages
              if (message.includes('🔍 Scraping repository') || message.includes('📊 Extracted:') || message.includes('📦 Processing')) {
                sendEvent({ type: 'progress', message: message.trim() });
              }
            };
            
            const result = await pipeline.execute();
            
            // Send final summary
            const repos = Array.from(repoProgress.values());
            const summary: {
              totalProjects: number;
              totalReadmes: number;
              totalAssets: number;
              repos: typeof repos;
            } = {
              totalProjects: repos.length || (result.data.projects?.length || 0),
              totalReadmes: repos.filter(r => r.readmeFound).length,
              totalAssets: repos.reduce((sum, r) => sum + r.assetsCount, 0),
              repos: repos
            };
            
            // Restore console.log
            console.log = originalLog;
            
            sendEvent({ 
              type: 'complete', 
              ...result.data,  // FLACH - alles auf oberster Ebene
              executionTime: result.executionTime,  // ECHTE ZEIT!
              validation: result.validation,  // Validation results
              scrapingSummary: summary  // Repository scraping summary
            });
            
          } catch (error) {
            if (!isClosed) {
              sendEvent({ type: 'error', message: `❌ Generation failed: ${error instanceof Error ? error.message : String(error)}` });
            }
          } finally {
            if (!isClosed) {
              isClosed = true;
              try {
                controller.close();
              } catch (error) {
                // Ignore if already closed
              }
            }
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Normal JSON response
      const pipeline = new DataPipeline(config);
      const result = await pipeline.execute();
      
      return NextResponse.json(result);
    }
    
  } catch (error) {
    console.error('Data pipeline API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {},
      errors: [`API error: ${error}`],
      executionTime: 0
    }, { status: 500 });
  }
}
