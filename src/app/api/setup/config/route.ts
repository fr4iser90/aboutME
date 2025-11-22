import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { generateSecurePassword } from '@/features/auth/services/auth';

/**
 * PASSWORD STRENGTH VALIDATION
 */
function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors };
  }
  
  // Minimum length: 12 characters
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  // Must contain uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }
  
  // Must contain lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }
  
  // Must contain numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }
  
  // Must contain special characters
  if (!/[!@#$%^&*()_+=\-\[\]{};':"\\|,.<>?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Setup Config API Route
 * 
 * Handles portfolio configuration, environment variables, and feature toggles.
 * Reads/writes .env and portfolio.config.ts files.
 */

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data');
const ENV_FILE = path.join(process.cwd(), '.env');

// Helper function to read .env file
async function readEnvFile(): Promise<Record<string, string>> {
  try {
    const envContent = await fs.readFile(ENV_FILE, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.warn('Could not read .env file:', error);
    return {};
  }
}

// Helper function to write .env file (preserves comments and formatting)
async function writeEnvFile(envVars: Record<string, string>): Promise<void> {
  try {
    // Read existing .env content to preserve comments and formatting
    const existingContent = await fs.readFile(ENV_FILE, 'utf-8');
    const lines = existingContent.split('\n');
    
    // Create a map of existing key-value pairs
    const existingVars: Record<string, { value: string; lineIndex: number }> = {};
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          existingVars[key.trim()] = {
            value: valueParts.join('=').trim(),
            lineIndex: index
          };
        }
      }
    });
    
    // Update existing lines with new values - ONLY if value actually changed
    const updatedLines = [...lines];
    let hasChanges = false;
    
    Object.entries(envVars).forEach(([key, value]) => {
      if (existingVars[key]) {
        // Only update if value actually changed
        if (existingVars[key].value !== value) {
          const lineIndex = existingVars[key].lineIndex;
          updatedLines[lineIndex] = `${key}=${value}`;
          hasChanges = true;
        }
      } else {
        // Add new variable at the end (before any trailing comments)
        const lastVarIndex = existingVars && Object.keys(existingVars).length > 0
          ? Math.max(...Object.values(existingVars).map(v => v.lineIndex))
          : -1;
        updatedLines.splice(lastVarIndex + 1, 0, `${key}=${value}`);
        hasChanges = true;
      }
    });
    
    // Only write file if there are actual changes
    if (hasChanges) {
      await fs.writeFile(ENV_FILE, updatedLines.join('\n'));
    }
  } catch (error) {
    // Fallback: write simple format if reading fails
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    await fs.writeFile(ENV_FILE, envContent);
  }
}

// Helper function to read portfolio.config.ts
async function readPortfolioConfig(): Promise<any> {
  const configPath = path.join(process.cwd(), 'portfolio.config.ts');

  try {
    // Check if file exists without throwing error
    try {
      await fs.access(configPath);
    } catch {
      // File doesn't exist, return empty object silently
      return {};
    }

    const configContent = await fs.readFile(configPath, 'utf-8');
    
    // Try to match export default const config = { ... }
    const exportDefaultMatch = configContent.match(/export\s+default\s+({[\s\S]*?});?\s*$/);
    if (exportDefaultMatch) {
      try {
        const configStr = exportDefaultMatch[1];
        return eval(`(function() { const path = require('path'); return (${configStr}); })()`);
      } catch {
        // If eval fails, return empty object
        return {};
      }
    }
    
    return {};
  } catch (error) {
    // Silently return empty object (don't spam console)
    return {};
  }
}

// Helper function to read config.json (verschachtelte Struktur)
// Tries private/data first (during setup), falls back to public/data (after publish)
async function readConfigJson(): Promise<any> {
  try {
    // Try private/data first, then public/data
    const privateConfigPath = path.join(PRIVATE_DATA_DIR, 'config', 'config.json');
    const publicConfigPath = path.join(PUBLIC_DATA_DIR, 'config', 'config.json');
    
    let configPath = privateConfigPath;
    try {
      await fs.access(privateConfigPath);
    } catch {
      configPath = publicConfigPath;
    }
    const configContent = await fs.readFile(configPath, 'utf-8');
    
    // Check if file is empty or only whitespace
    if (!configContent || configContent.trim().length === 0) {
      return {};
    }
    
    return JSON.parse(configContent);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty object
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    // If JSON parse error, log but don't spam console
    if (error instanceof SyntaxError) {
      // Try to fix empty file by writing empty object
      try {
        const configPath = path.join(PRIVATE_DATA_DIR, 'config', 'config.json');
        await fs.mkdir(path.dirname(configPath), { recursive: true });
        await fs.writeFile(configPath, '{}', 'utf-8');
      } catch (writeError) {
        // Ignore write errors
      }
      return {};
    }
    console.warn('Could not read config.json:', error);
    return {};
  }
}

// GET: Read current configuration
export async function GET() {
  try {
    const envVars = await readEnvFile();
    const portfolioConfig = await readPortfolioConfig();
    const configJson = await readConfigJson();
    
    // Load all features from config.json (single source of truth)
    const featuresFromConfig = configJson.features || {};
    const features = {
      projects: featuresFromConfig.projects !== undefined ? featuresFromConfig.projects : true,
      skills: featuresFromConfig.skills !== undefined ? featuresFromConfig.skills : true,
      aboutMe: featuresFromConfig.aboutMe !== undefined ? featuresFromConfig.aboutMe : true,
      blog: featuresFromConfig.blog === true,
      terminal: featuresFromConfig.terminal === true,
      auth: featuresFromConfig.auth === true,
      editor: featuresFromConfig.editor === true,
      fileUpload: featuresFromConfig.fileUpload === true,
      guestbook: featuresFromConfig.guestbook === true
    };
    
    // 🧠 ENVIRONMENT DETECTION for Frontend
    const isLocal = !!process.env.DISPLAY;
    
    // Progress tracking
    const progress = configJson.progress || {
      progress: 0,
      currentStep: 1,
      setupComplete: false,
      validated: false,
      published: false,
      setupAt: null,
      validatedAt: null,
      publishedAt: null
    };

    // Featured criteria (moved from portfolio.config.ts)
    const featuredCriteria = configJson.featuredCriteria || {
      minStars: 5,
      manualOverride: [],
      excludeFromFeatured: []
    };

    // GitHub filter config
    const githubFilter = configJson.githubFilter || {
      includeForks: false,
      includeTemplates: false,
      includePrivate: false,
      minStars: 0,
      excludeRepos: [],
      featuredProjects: [],
    };

    return NextResponse.json({
      config: {
        features,
        seo: {
          title: configJson.portfolio?.title || configJson.seo?.title || '',
          description: configJson.portfolio?.description || configJson.seo?.description || '',
          author: configJson.portfolio?.author || configJson.seo?.author || ''
        },
        github: {
          username: envVars.GITHUB_USERNAME || configJson.portfolio?.githubUsername || ''
        },
        githubFilter, // Include githubFilter in response
        terminal: {
          enabled: features.terminal
          // Terminal config values are not stored, only feature flag
        },
        auth: {
          adminPassword: envVars.ADMIN_PASSWORD,
          passwordAlreadySet: !!envVars.ADMIN_PASSWORD
        },
        portfolio: {
          features: portfolioConfig.features || {},
          layout: portfolioConfig.layout || {}
        },
        // Progress tracking
        progress,
        // Featured criteria (moved from portfolio.config.ts)
        featuredCriteria,
        // 🖥️ Scraping Configuration
        scraping: {
          availableModes: isLocal ? ['headed', 'headless'] : ['headless'], // Local: both, External: only headless
          defaultMode: isLocal ? 'headed' : 'headless'
        }
      },
      environment: {
        isLocal,
        displayAvailable: !!process.env.DISPLAY
      }
    });
    
  } catch (error) {
    console.error('Setup config GET error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    // Read current environment variables
    const currentEnvVars = await readEnvFile();
    
    // CRITICAL: Only update env vars that are explicitly provided in the request
    // This prevents overwriting existing values when only config.json fields are updated
    const updatedEnvVars: Record<string, string> = {};
    let hasEnvChanges = false;
    
    // GitHub Configuration - only update if explicitly provided
    if (config.githubUsername !== undefined) {
      updatedEnvVars.GITHUB_USERNAME = config.githubUsername || currentEnvVars.GITHUB_USERNAME;
      hasEnvChanges = true;
    }
    
    // NOTE: GitHub Token is NEVER stored - it's only used temporarily during setup
    // Security: Tokens should never be persisted to disk
    
    // Portfolio Configuration - only update if explicitly provided
    if (config.portfolioTitle !== undefined) {
      updatedEnvVars.PORTFOLIO_TITLE = config.portfolioTitle || currentEnvVars.PORTFOLIO_TITLE || '';
      hasEnvChanges = true;
    }
    
    if (config.portfolioDescription !== undefined) {
      updatedEnvVars.PORTFOLIO_DESCRIPTION = config.portfolioDescription || currentEnvVars.PORTFOLIO_DESCRIPTION || '';
      hasEnvChanges = true;
    }
    
    if (config.portfolioAuthor !== undefined) {
      updatedEnvVars.PORTFOLIO_AUTHOR = config.portfolioAuthor || currentEnvVars.PORTFOLIO_AUTHOR || '';
      hasEnvChanges = true;
    }
    
    // Feature Flags - save to config.json only (not .env)
    // Features are now stored in config.json as single source of truth
    // No .env feature flags needed anymore
    
    // Portfolio Hero Feature - only update if explicitly provided
    if (config.portfolio?.features?.hero?.enabled !== undefined) {
      updatedEnvVars.ENABLE_HERO = config.portfolio.features.hero.enabled !== false ? 'true' : 'false';
      hasEnvChanges = true;
    }
    
    // Scraping Configuration - only update if explicitly provided
    if (config.scraping?.headless !== undefined) {
      updatedEnvVars.SCRAPING_HEADLESS = config.scraping.headless ? 'true' : 'false';
      hasEnvChanges = true;
    }
    
    // Auth Configuration - ONLY update if explicitly provided and not empty
    // CRITICAL: Never overwrite existing password unless user explicitly sets a new one
    if (config.auth?.adminPassword && config.auth.adminPassword.trim().length > 0) {
      // BACKEND PASSWORD STRENGTH VALIDATION
      if (config.features?.auth) {
        const passwordValidation = validatePasswordStrength(config.auth.adminPassword);
        if (!passwordValidation.valid) {
          return NextResponse.json({
            error: 'Password does not meet security requirements',
            details: passwordValidation.errors
          }, { status: 400 });
        }
        
        if (config.auth.adminPassword !== config.auth.adminPasswordConfirm) {
          return NextResponse.json({
            error: 'Admin password and confirmation do not match'
          }, { status: 400 });
        }
      }
      
      updatedEnvVars.ADMIN_PASSWORD = config.auth.adminPassword;
      hasEnvChanges = true;
    } else if (!currentEnvVars.ADMIN_PASSWORD && config.features?.auth) {
      // Only generate new password if no password exists AND auth is being enabled
      updatedEnvVars.ADMIN_PASSWORD = generateSecurePassword();
      hasEnvChanges = true;
    }
    
    // ONLY write .env file if there are actual env variable changes
    // This prevents overwriting when only config.json fields (like progress) are updated
    if (hasEnvChanges) {
      // Merge with existing vars to preserve all other values
      const finalEnvVars = { ...currentEnvVars, ...updatedEnvVars };
      await writeEnvFile(finalEnvVars);
    }
    
    // Save SEO Settings, Progress, FeaturedCriteria, and Features to config.json if provided
    // config.json is saved to private/data during setup, will be published later
    if (config.seo || config.github?.username || config.progress || config.featuredCriteria || config.githubFilter || config.features) {
      try {
        // Ensure data directory exists (verschachtelte Struktur)
        const configDir = path.join(PRIVATE_DATA_DIR, 'config');
        await fs.mkdir(configDir, { recursive: true });
        
        const configPath = path.join(configDir, 'config.json');
        let configJson: any = {};
        
        // Read existing config.json if it exists
        try {
          const existingContent = await fs.readFile(configPath, 'utf-8');
          // Check if file is empty or only whitespace
          if (existingContent && existingContent.trim().length > 0) {
            configJson = JSON.parse(existingContent);
          }
        } catch (error) {
          // File doesn't exist or is invalid, start with empty object
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.warn('Could not parse existing config.json, starting fresh:', error);
          }
        }

        // Update progress tracking if provided
        if (config.progress) {
          configJson.progress = {
            ...configJson.progress,
            ...config.progress
          };
        }

        // Update featuredCriteria if provided
        if (config.featuredCriteria) {
          configJson.featuredCriteria = {
            ...configJson.featuredCriteria,
            ...config.featuredCriteria
          };
        }

        // Update GitHub filter if provided
        if (config.githubFilter) {
          configJson.githubFilter = {
            ...configJson.githubFilter,
            ...config.githubFilter,
            // Keep selectedRepos if provided (list of repos to actually scrape)
            ...(config.githubFilter.selectedRepos && { selectedRepos: config.githubFilter.selectedRepos })
          };
        }
        
        // Update Features if provided (save to config.json only)
        if (config.features) {
          configJson.features = {
            ...configJson.features,
            ...config.features
          };
        }
        
        // Update SEO settings (stored in private/data during setup, published later)
        if (config.seo) {
          configJson.seo = {
            title: config.seo.title || configJson.seo?.title || configJson.portfolio?.title || '',
            description: config.seo.description || configJson.seo?.description || configJson.portfolio?.description || '',
            author: config.seo.author || configJson.seo?.author || configJson.portfolio?.author || ''
          };
          // Also update portfolio for backward compatibility
          if (!configJson.portfolio) {
            configJson.portfolio = {};
          }
          configJson.portfolio.title = configJson.seo.title;
          configJson.portfolio.description = configJson.seo.description;
          configJson.portfolio.author = configJson.seo.author;
        }
        
        // Update GitHub username
        if (config.github?.username) {
          if (!configJson.portfolio) {
            configJson.portfolio = {};
          }
          configJson.portfolio.githubUsername = config.github.username;
        }
        
        // Update Background Config (wenn vorhanden)
        if (config.portfolio?.features?.background) {
          if (!configJson.portfolio) {
            configJson.portfolio = {};
          }
          if (!configJson.portfolio.features) {
            configJson.portfolio.features = {};
          }
          configJson.portfolio.features.background = config.portfolio.features.background;
        }
        
        // Update Hero Config (wenn vorhanden)
        if (config.portfolio?.features?.hero) {
          if (!configJson.portfolio) {
            configJson.portfolio = {};
          }
          if (!configJson.portfolio.features) {
            configJson.portfolio.features = {};
          }
          configJson.portfolio.features.hero = config.portfolio.features.hero;
        }

        // Update Header Config (wenn vorhanden)
        if (config.portfolio?.features?.header) {
          if (!configJson.portfolio) {
            configJson.portfolio = {};
          }
          if (!configJson.portfolio.features) {
            configJson.portfolio.features = {};
          }
          configJson.portfolio.features.header = config.portfolio.features.header;
        }

        // Update Footer Config (wenn vorhanden)
        if (config.portfolio?.features?.footer) {
          if (!configJson.portfolio) {
            configJson.portfolio = {};
          }
          if (!configJson.portfolio.features) {
            configJson.portfolio.features = {};
          }
          configJson.portfolio.features.footer = config.portfolio.features.footer;
        }
        
        // Ensure setup object exists
        if (!configJson.setup) {
          configJson.setup = {
            completed: true,
            completedAt: new Date().toISOString(),
            version: '1.0.0'
          };
        }
        
        // Ensure directory exists before writing
        await fs.mkdir(path.dirname(configPath), { recursive: true });
        
        // Write config.json with proper formatting
        const configContent = JSON.stringify(configJson, null, 2);
        await fs.writeFile(configPath, configContent, 'utf-8');
        
        console.log('✅ Saved config.json with', Object.keys(configJson).length, 'keys');
      } catch (error) {
        console.error('❌ Error saving config.json:', error);
        // Continue even if config.json save fails
      }
    }
    
    // Validate required fields for initial setup
    const { portfolioTitle, portfolioDescription, portfolioAuthor, githubUsername } = config;
    
    if (portfolioTitle && portfolioDescription && portfolioAuthor && githubUsername) {
      // Ensure data directory exists (verschachtelte Struktur)
      // All data goes to private/data during setup, published later
      const configDir = path.join(PRIVATE_DATA_DIR, 'config');
      await fs.mkdir(configDir, { recursive: true });
      
      // Create config.json
      const setupConfig = {
        portfolio: {
          title: portfolioTitle,
          description: portfolioDescription,
          author: portfolioAuthor,
          githubUsername: githubUsername
        },
        setup: {
          completed: true,
          completedAt: new Date().toISOString(),
          version: '1.0.0'
        },
        security: {
          adminPasswordSet: true,
          setupModeDisabled: false // Will be disabled after data generation
        },
        progress: {
          progress: 0,
          currentStep: 1,
          setupComplete: false,
          validated: false,
          published: false,
          setupAt: null,
          validatedAt: null,
          publishedAt: null
        },
        featuredCriteria: {
          minStars: 5,
          manualOverride: [],
          excludeFromFeatured: []
        }
      };
      
      const configPath = path.join(configDir, 'config.json');
      await fs.writeFile(configPath, JSON.stringify(setupConfig, null, 2));
      
      // Create initial user.json
      const userData = {
        name: portfolioAuthor,
        username: githubUsername,
        bio: portfolioDescription,
        location: '',
        website: '',
        twitter: '',
        github: `https://github.com/${githubUsername}`,
        linkedin: '',
        email: '',
        avatar: `https://avatars.githubusercontent.com/${githubUsername}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Create user/user.json (verschachtelte Struktur) - in private/data
      const userDir = path.join(PRIVATE_DATA_DIR, 'user');
      await fs.mkdir(userDir, { recursive: true });
      const userPath = path.join(userDir, 'user.json');
      await fs.writeFile(userPath, JSON.stringify(userData, null, 2));
      
      // Create initial projects/projects.json (empty array)
      const projectsData: any[] = [];
      // Create projects/projects.json (verschachtelte Struktur) - in private/data
      const projectsDir = path.join(PRIVATE_DATA_DIR, 'projects');
      await fs.mkdir(projectsDir, { recursive: true });
      const projectsPath = path.join(projectsDir, 'projects.json');
      await fs.writeFile(projectsPath, JSON.stringify(projectsData, null, 2));
      
      // Create initial skills/skills.json (empty array, verschachtelte Struktur) - in private/data
      const skillsData: any[] = [];
      const skillsDir = path.join(PRIVATE_DATA_DIR, 'skills');
      await fs.mkdir(skillsDir, { recursive: true });
      const skillsPath = path.join(skillsDir, 'skills.json');
      await fs.writeFile(skillsPath, JSON.stringify(skillsData, null, 2));
      
      // Create initial blog/blog.json (empty array, verschachtelte Struktur) - in private/data
      const blogData: any[] = [];
      const blogDir = path.join(PRIVATE_DATA_DIR, 'blog');
      await fs.mkdir(blogDir, { recursive: true });
      const blogPath = path.join(blogDir, 'blog.json');
      await fs.writeFile(blogPath, JSON.stringify(blogData, null, 2));
      
      return NextResponse.json({
        message: 'Setup configuration and features updated successfully',
        config: {
          features: config.features,
          envFile: ENV_FILE,
          configFile: configPath,
          userFile: userPath,
          projectsFile: projectsPath,
          skillsFile: skillsPath,
          blogFile: blogPath
        }
      });
    } else {
      // Just update features without full setup
      return NextResponse.json({
        message: 'Feature configuration updated successfully',
        config: {
          features: config.features,
          envFile: ENV_FILE
        }
      });
    }
    
  } catch (error) {
    console.error('Setup config API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
