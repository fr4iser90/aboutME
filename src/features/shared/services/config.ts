import path from 'path';

/**
 * Frontend-spezifische Konfiguration
 * 
 * Diese Config ist für die Next.js API Routes und Frontend-Komponenten gedacht.
 * Sie verwendet statische Pfade für Client-Side Code.
 */

export const config = {
  
  // Backend Features
  backend: {
    enabled: process.env.AUTH_ENABLED === 'true',
    auth: process.env.AUTH_ENABLED === 'true',
    editor: process.env.AUTH_ENABLED === 'true',
    features: {
      blogEditor: process.env.AUTH_ENABLED === 'true',
      projectEditor: process.env.AUTH_ENABLED === 'true',
      guestbookManager: process.env.AUTH_ENABLED === 'true',
      fileUpload: process.env.AUTH_ENABLED === 'true',
      markdownPreview: process.env.AUTH_ENABLED === 'true'
    }
  },

  paths: {
    // Frontend-spezifische Pfade - statische Pfade für Client
    publicDir: path.join(process.cwd(), 'public'),
    
    // Content-Verzeichnisse - neue Struktur (statische Pfade)
    contentDir: path.join(process.cwd(), 'public/data/about'),
    blogDir: path.join(process.cwd(), 'public/data/blog/posts'),
    projectDir: path.join(process.cwd(), 'public/data/projects/details'),
    
    // Output-Verzeichnisse
    outputDir: path.join(process.cwd(), 'public/data'),
    dataDir: path.join(process.cwd(), 'public/data'),
    
    // Spezifische Dateien - neue Struktur (statische Pfade)
    aboutFile: path.join(process.cwd(), 'public/data/about/about.md'),
  },
  
  // API-Endpunkte für Frontend-Komponenten - neue Struktur
  api: {
    // Static Data - verschachtelte Struktur (konsistent)
    user: '/data/user/user.json',
    projects: '/data/projects/projects.json',
    skills: '/data/skills/skills.json',
    config: '/data/config/config.json',
    timeline: '/data/timeline/timeline.json',
    blog: '/data/blog/blog.json',
    about: '/data/about/about.json',

    
    // Terminal-spezifische Daten (verschachtelte Struktur)
    terminalUserInfo: '/data/terminal/terminal-user-info.json',
    terminalCommands: '/data/terminal/terminal-commands.json',
    terminal: '/data/terminal/terminal.json',
    
    // Puzzle-spezifische Daten (verschachtelte Struktur)
    puzzleFiles: '/data/terminal/puzzle-files.json',
    fakeOsStructure: '/data/terminal/fake-os-structure.json',
    permissionRules: '/data/terminal/permission-rules.json',
  },
  
  // Blog-spezifische Einstellungen
  blog: {
    // Erlaubte Dateierweiterungen
    allowedExtensions: ['.md'],
    
    // Erlaubte Slug-Pattern
    allowedSlugPattern: /^[a-zA-Z0-9-_]+$/,
    
    // Standard-Werte
    defaults: {
      author: 'Unknown',
      category: 'General',
      readingTime: 1,
    }
  },
  
  // Sicherheits-Einstellungen
  security: {
    // Maximale Dateigröße (in Bytes)
    maxFileSize: 1024 * 1024, // 1MB
    
    // Erlaubte MIME-Types
    allowedMimeTypes: ['text/markdown', 'text/plain'],
  }
};

export default config;
