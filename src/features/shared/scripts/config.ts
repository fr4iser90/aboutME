#!/usr/bin/env node

/**
 * Scripts Configuration
 * 
 * Zentrale Konfiguration für alle Scripts:
 * - Scraping-Methoden und Reihenfolge
 * - Playwright/Browser-Einstellungen
 * - Terminal-System-Konfiguration
 * - Debugging und Logging
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Lade .env-Datei um Token-Status zu prüfen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// TypeScript Interfaces
interface ScrapingTimeouts {
  api: number;
  playwright: number;
  web: number;
}

interface RetryConfig {
  maxAttempts: number;
  delay: number;
}

interface ScrapingConfig {
  get order(): string[];
  timeouts: ScrapingTimeouts;
  retries: RetryConfig;
}

interface BrowserConfig {
  headless: boolean;
  args: string[];
}

interface PageConfig {
  viewport: { width: number; height: number };
  userAgent: string;
  timeout: number;
}

interface NavigationConfig {
  waitUntil: string;
  timeout: number;
}

interface RateLimitConfig {
  delayBetweenRequests: number;
  maxConcurrentRequests: number;
}

interface PlaywrightConfig {
  browser: BrowserConfig;
  page: PageConfig;
  navigation: NavigationConfig;
  rateLimit: RateLimitConfig;
}

interface OsScanConfig {
  maxDepth: number;
  excludeDirs: string[];
  excludeFiles: string[];
  includeHidden: string[];
}

interface FilesystemConfig {
  excludePortfolioFiles: string[];
  fileSizeRange: { min: number; max: number };
  directorySize: number;
  permissions: {
    defaultPermissions: {
      file: string;
      directory: string;
    };
    specialPermissions: Record<string, string>;
  };
}

interface TerminalConfig {
  osScan: OsScanConfig;
  filesystem: FilesystemConfig;
}

interface DebugFlags {
  api: boolean;
  playwright: boolean;
  web: boolean;
  terminal: boolean;
  filesystem: boolean;
}

interface DebugConfig {
  enabled: boolean;
  verbose: boolean;
  flags: DebugFlags;
  logLevel: string;
  saveHtml: boolean;
  htmlOutputDir: string;
}

interface ConcurrencyConfig {
  maxConcurrent: number;
  batchSize: number;
}

interface MemoryConfig {
  gcInterval: number;
  maxMemoryUsage: string;
}

interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: string;
}

interface PerformanceConfig {
  concurrency: ConcurrencyConfig;
  memory: MemoryConfig;
  cache: CacheConfig;
}

interface FallbackConfig {
  enabled: boolean;
  maxFallbacks: number;
}

interface ErrorHandlingConfig {
  strategy: string;
  logErrors: boolean;
  saveErrorLog: boolean;
  errorLogFile: string;
  fallback: FallbackConfig;
}

interface ValidationConfig {
  validateInputs: boolean;
  validateOutputs: boolean;
  useSchemaValidation: boolean;
  schemaPath: string;
}

interface Config {
  scraping: ScrapingConfig;
  playwright: PlaywrightConfig;
  terminal: TerminalConfig;
  debug: DebugConfig;
  performance: PerformanceConfig;
  errorHandling: ErrorHandlingConfig;
  validation: ValidationConfig;
}

// Dynamische Scraping-Order basierend auf Token-Verfügbarkeit
function getScrapingOrder(): string[] {
  // Token kann aus .env kommen ODER temporär aus setup.js gesetzt werden
  const hasToken = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim() !== '');
  
  if (hasToken) {
    console.log('🔑 Config: GitHub token detected, using API-ONLY mode');
    return ['api']; // NUR API wenn Token vorhanden!
  } else {
    console.log('⚠️  Config: No GitHub token, using fallback order: playwright → web');
    return ['playwright', 'web']; // Keine API ohne Token
  }
}

const config: Config = {
  // ===========================================
  // SCRAPING CONFIGURATION
  // ===========================================
  
  scraping: {
    // Reihenfolge der Scraping-Methoden (Fallback-System)
    // Wird dynamisch basierend auf Token-Status bestimmt
    get order(): string[] {
      return getScrapingOrder();
    },
    
    // Timeouts für verschiedene Methoden
    timeouts: {
      api: 30000,        // 30 Sekunden
      playwright: 60000, // 60 Sekunden (Browser braucht länger)
      web: 15000         // 15 Sekunden
    },
    
    // Retry-Konfiguration
    retries: {
      maxAttempts: 3,
      delay: 2000        // 2 Sekunden zwischen Versuchen
    }
  },

  // ===========================================
  // PLAYWRIGHT CONFIGURATION
  // ===========================================
  
  playwright: {
    // Browser-Einstellungen
    browser: {
      headless: false,    // Set to false for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-default-apps'
      ]
    },
    
    // Page-Einstellungen
    page: {
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      timeout: 30000
    },
    
    // Navigation-Einstellungen
    navigation: {
      waitUntil: 'domcontentloaded',  // Schneller als networkidle - wartet nur auf DOM
      timeout: 30000  // 30 Sekunden reichen für DOM-Load
    },
    
    // Rate Limiting (GitHub-freundlich)
    rateLimit: {
      delayBetweenRequests: 1000,  // 1 Sekunde zwischen Requests
      maxConcurrentRequests: 3
    }
  },

  // ===========================================
  // TERMINAL SYSTEM CONFIGURATION
  // ===========================================
  
  terminal: {
    // OS-Struktur-Scanning
    osScan: {
      maxDepth: 4,        // Maximale Verzeichnistiefe
      excludeDirs: [
        'node_modules', '.git', '.vscode', '.cache', 'cache',
        'tmp', 'temp', 'logs', 'log', '.npm', '.yarn',
        'dist', 'build', 'target', 'bin', 'obj', '.idea',
        '.vs', 'venv', 'env', '__pycache__', '.pytest_cache',
        'coverage', '.coverage', 'vendor', 'packages',
        'lib64', 'run', 'srv', 'media', 'mnt', 'Documents'
      ],
      excludeFiles: [
        '.DS_Store', 'Thumbs.db', 'desktop.ini',
        '.log', '.tmp', '.cache', '.pid', '.lock'
      ],
      includeHidden: ['.bashrc', '.zshrc', '.vimrc', '.gitconfig', '.ssh']
    },
    
    // Filesystem-Konvertierung
    filesystem: {
      // Portfolio-Dateien die ausgeschlossen werden sollen
      excludePortfolioFiles: ['about', 'projects', 'skills', 'blog', 'contact', 'README.md'],
      
      // Dateigrößen-Generierung (wird dynamisch aus echtem System übernommen)
      fileSizeRange: { min: 100, max: 10000 },
      directorySize: 4096,
      
      // Berechtigungen-Simulation
      permissions: {
        // Standard-Berechtigungen für verschiedene Pfade
        defaultPermissions: {
          file: '-rw-r--r--',
          directory: 'drwxr-xr-x'
        },
        
        // Spezielle Berechtigungen für bestimmte Pfade
        specialPermissions: {
          '/home': 'drwxr-xr-x',
          '/root': 'drwxr-x---',
          '/tmp': 'drwxrwxrwt'
        }
      }
    }
  },

  // ===========================================
  // DEBUGGING & LOGGING
  // ===========================================
  
  debug: {
    // Allgemeine Debug-Einstellungen
    enabled: false,
    verbose: false,
    
    // Spezifische Debug-Flags
    flags: {
      api: false,           // API-Request-Details
      playwright: false,    // Browser-Aktionen
      web: false,           // Web-Scraping-Details
      terminal: false,      // Terminal-System-Details
      filesystem: false     // Filesystem-Operationen
    },
    
    // Logging-Level
    logLevel: 'info',       // 'debug', 'info', 'warn', 'error'
    
    // HTML-Debugging (speichert HTML für Analyse)
    saveHtml: false,
    htmlOutputDir: './debug-html'
  },

  // ===========================================
  // PERFORMANCE CONFIGURATION
  // ===========================================
  
  performance: {
    // Parallel-Verarbeitung
    concurrency: {
      maxConcurrent: 5,     // Maximale parallele Operationen
      batchSize: 10         // Batch-Größe für große Operationen
    },
    
    // Memory-Management
    memory: {
      gcInterval: 100,      // Garbage Collection alle X Operationen
      maxMemoryUsage: '512MB'
    },
    
    // Caching
    cache: {
      enabled: true,
      ttl: 3600000,         // 1 Stunde Cache-TTL
      maxSize: '100MB'
    }
  },

  // ===========================================
  // ERROR HANDLING
  // ===========================================
  
  errorHandling: {
    // Fehlerbehandlung-Strategien
    strategy: 'graceful',   // 'strict', 'graceful', 'continue'
    
    // Fehler-Logging
    logErrors: true,
    saveErrorLog: true,
    errorLogFile: './error.log',
    
    // Fallback-Verhalten
    fallback: {
      enabled: true,
      maxFallbacks: 2
    }
  },

  // ===========================================
  // VALIDATION
  // ===========================================
  
  validation: {
    // Input-Validierung
    validateInputs: true,
    
    // Output-Validierung
    validateOutputs: true,
    
    // Schema-Validierung
    useSchemaValidation: false,
    schemaPath: './schemas/'
  }
};

export default config;
