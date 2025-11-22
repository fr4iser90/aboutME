import UnoCSS from '@unocss/webpack';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as webpack from 'webpack';
import * as fs from 'fs';
import { NextConfig } from 'next';

// Laden der .env-Datei aus dem Root-Verzeichnis
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Portfolio Configuration Check - Server Startup
 * BACKEND HANDLES THIS ALONE - NOT IN MIDDLEWARE OR API!
 * 
 * Smart Validation:
 * 1. Check if files exist
 * 2. Check if enabled features have valid data
 * 3. Only validate what's actually enabled in config
 */
function initializePortfolioConfig(): void {
  try {
    const DATA_DIR = path.join(__dirname, 'public/data');
    const configFile = path.join(DATA_DIR, 'config', 'config.json');
    const userFile = path.join(DATA_DIR, 'user', 'user.json');
    const projectsFile = path.join(DATA_DIR, 'projects', 'projects.json');
    const skillsFile = path.join(DATA_DIR, 'skills', 'skills.json');
    
    // Step 1: Check if critical files exist
    const criticalFiles = [configFile, userFile];
    let allCriticalFilesExist = true;
    
    for (const filePath of criticalFiles) {
      try {
        fs.accessSync(filePath);
      } catch {
        console.log(`⚠️  Missing critical file: ${path.basename(filePath)}`);
        allCriticalFilesExist = false;
        break;
      }
    }
    
    if (!allCriticalFilesExist) {
      logStructured('WARNING', 'setup_mode', 'Portfolio not configured - setup mode enabled', {
        reason: 'missing_critical_files',
        criticalFiles: criticalFiles.map(f => path.basename(f))
      });
      enableSetupMode();
      return;
    }
    
    // Step 2: Read config.json to check enabled features
    let config: any;
    try {
      const configContent = fs.readFileSync(configFile, 'utf-8');
      config = JSON.parse(configContent);
    } catch (error) {
      logStructured('ERROR', 'config_read', 'Could not read config.json - setup mode enabled', {
        error: error instanceof Error ? error.message : 'Unknown error',
        configFile: path.basename(configFile)
      });
      enableSetupMode();
      return;
    }
    
    // Step 3: Validate data for enabled features
    const validationErrors: string[] = [];
    
    // Check user.json for basic data
    try {
      const userContent = fs.readFileSync(userFile, 'utf-8');
      const userData = JSON.parse(userContent);
      
      if (!userData.username || !userData.name) {
        validationErrors.push('user.json missing username or name');
      }
      
      // Check About Me if enabled
      if (config.features?.aboutMe?.enabled) {
        if (!userData.aboutMe || userData.aboutMe === null) {
          validationErrors.push('About Me is enabled but user.aboutMe is null/missing');
        }
      }
    } catch (error) {
      validationErrors.push('Could not read/parse user.json');
    }
    
    // Check projects.json if enabled
    if (config.features?.projects?.enabled) {
      try {
        fs.accessSync(projectsFile);
        const projectsContent = fs.readFileSync(projectsFile, 'utf-8');
        const projectsData = JSON.parse(projectsContent);
        
        if (!projectsData.projects || projectsData.projects.length === 0) {
          validationErrors.push('Projects is enabled but projects.json has no projects');
        }
      } catch (error) {
        validationErrors.push('Projects is enabled but projects.json missing/invalid');
      }
    }
    
    // Check skills.json if enabled
    if (config.features?.skills?.enabled) {
      try {
        fs.accessSync(skillsFile);
        const skillsContent = fs.readFileSync(skillsFile, 'utf-8');
        const skillsData = JSON.parse(skillsContent);
        
        if (!skillsData.languages && !skillsData.frameworks && !skillsData.tools) {
          validationErrors.push('Skills is enabled but skills.json has no data');
        }
      } catch (error) {
        validationErrors.push('Skills is enabled but skills.json missing/invalid');
      }
    }
    
    // Step 4: Decide if setup mode is needed
    if (validationErrors.length > 0) {
      logStructured('WARNING', 'validation_failed', 'Portfolio validation failed - setup mode enabled', {
        validationErrors: validationErrors,
        errorCount: validationErrors.length
      });
      enableSetupMode();
    } else {
      const enabledFeatures = Object.keys(config.features || {}).filter(key => config.features[key]?.enabled);
      logStructured('INFO', 'portfolio_ready', 'Portfolio is fully configured - normal mode', {
        enabledFeatures: enabledFeatures,
        featureCount: enabledFeatures.length
      });
      process.env.SETUP_MODE = 'false';
    }
    
  } catch (error) {
    logStructured('CRITICAL', 'init_error', 'Error initializing portfolio config', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    enableSetupMode();
  }
}

/**
 * Structured logging according to 13th Factor principles
 * Logs to stdout/stderr as JSON with log levels and context
 */
function logStructured(
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL',
  event: string,
  message: string,
  context?: Record<string, any>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level,
    event: event,
    message: message,
    service: 'portfolio-config',
    environment: process.env.NODE_ENV || 'production',
    ...context
  };
  
  // Write to stdout (INFO, DEBUG) or stderr (WARNING, ERROR, CRITICAL)
  const output = ['WARNING', 'ERROR', 'CRITICAL'].includes(level) ? console.error : console.log;
  output(JSON.stringify(logEntry));
}

/**
 * Enable Setup Mode with proper environment configuration
 */
function enableSetupMode(): void {
  process.env.SETUP_MODE = 'true';
  // 🚀 SETUP MODUS: Editor und Auth temporär aktivieren
  process.env.ENABLE_EDITOR = 'true';
  process.env.ENABLE_AUTH = 'true';
  
  logStructured('INFO', 'setup_mode_enabled', 'Setup mode enabled - temporary features activated', {
    temporaryFeatures: ['ENABLE_EDITOR', 'ENABLE_AUTH'],
    setupMode: true
  });
}

// Initialize portfolio configuration at startup
initializePortfolioConfig();

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@next/font'],
  },
  // Turbopack configuration for Next.js 16
  turbopack: {},
}

export default nextConfig;
