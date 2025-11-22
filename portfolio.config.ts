/**
 * Portfolio Konfiguration
 * 
 * Diese Datei definiert alle Einstellungen für dein Portfolio
 * Du kannst hier anpassen, welche Features aktiviert sind und wie sie konfiguriert werden
 */

import * as path from 'path';
import * as fs from 'fs';

// TypeScript Interfaces
interface PathConfig {
  DATA_DIR: string;
  about: {
    markdown: string;
    json: string;
  };
  blog: {
    postsDir: string;
    json: string;
  };
  projects: {
    detailsDir: string;
    json: string;
  };
  CONTENT_DIR: string;
  OUTPUT_DIR: string;
  blogDir: string;
  projectDir: string;
  aboutFile: string;
}

interface GitHubConfig {
  username: string | undefined;
  fetchOptions: {
    includeForks: boolean;
    includeTemplates: boolean;
    minStars: number;
    minSize: number;
    languages: string[];
    topics: string[];
    excludeRepos: string[];
  };
}

interface ReadmeIntegrationConfig {
  enabled: boolean;
  useAsDefault: boolean;
  fetchAssets: boolean;
  fetchDocs: boolean;
  assetDir: string;
  maxAssetSize: number;
  allowedAssetTypes: string[];
  replaceAssetUrls: boolean;
  cleanupOldAssets?: boolean; // Remove assets that are no longer in README
  integrateDocs?: 'append' | 'replace' | 'inline';
}

interface ProjectsConfig {
  enabled: boolean;
  showFeatured: boolean;
  showAll: boolean;
  featuredCriteria: {
    minStars: number;
    manualOverride: string[];
    excludeFromFeatured: string[];
  };
  categories: {
    enabled: boolean;
    customCategories: Record<string, string>;
  };
  readmeIntegration?: ReadmeIntegrationConfig;
}

interface SkillsConfig {
  enabled: boolean;
  showTimeline: boolean;
  timelineOptions: {
    groupByYear: boolean;
    showProgress: boolean;
    includeProjects: boolean;
  };
  categories: {
    languages: boolean;
    frameworks: boolean;
    tools: boolean;
    databases: boolean;
    cloud: boolean;
  };
}

interface AboutMeConfig {
  enabled: boolean;
  markdownFile: string;
  showStats: boolean;
  showSocialLinks: boolean;
  customBio: string;
  profileImage: string;
}

interface BlogConfig {
  enabled: boolean;
  markdownDir: string;
  postFormat: string;
  showExcerpts: boolean;
  postsPerPage: number;
  categories: boolean;
  tags: boolean;
}

interface ContactField {
  required: boolean;
  label: string;
  type?: string;
}

interface ContactConfig {
  enabled: boolean;
  service: string;
  endpoint: string;
  fields: Record<string, ContactField>;
  successMessage: string;
  errorMessage: string;
}

interface TerminalConfig {
  enabled: boolean;
  hostname: string | undefined;
  username: string | undefined;
  password: string | undefined;
  rootPassword: string | undefined;
  showWelcomeMessage: boolean;
  enableFileSystem: boolean;
  enableCommands: boolean;
}

interface AuthConfig {
  enabled: boolean;
  adminPassword: string | undefined;
  sessionSecret: string | undefined;
  features: {
    editor: boolean;
    fileUpload: boolean;
    guestbook: boolean;
  };
}

interface DesignConfig {
  id: 'glassmorphism' | 'flat' | 'minimal';
  name: string;
  description: string;
  enabled: boolean;
}

interface ThemeConfig {
  enabled: boolean;
  defaultTheme: string;
  defaultDesign: 'glassmorphism' | 'flat' | 'minimal';
  themes: {
    dark: {
      name: string;
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
    };
    light: {
      name: string;
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
    };
  };
  designs: {
    glassmorphism: DesignConfig;
    flat: DesignConfig;
    minimal: DesignConfig;
  };
  persistChoice: boolean;
  publicSwitcher?: {
    enabled: boolean;
    allowThemeSwitch: boolean;
    allowDesignSwitch: boolean;
    availableThemes: string[];
    availableDesigns: string[];
    switcherType: 'separate' | 'combined';
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
}

interface ResponsiveConfig {
  enabled: boolean;
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  mobileFirst: boolean;
  touchOptimized: boolean;
}

interface HeroConfig {
  enabled: boolean;
  variant: 'floating' | 'card' | 'fullscreen' | 'minimal' | 'split';
  animation?: {
    enabled: boolean;
    type: 'fade' | 'slide' | 'zoom' | 'none';
    duration: number;
  };
  showStats?: boolean;
  showSocialLinks?: boolean;
  image?: {
    useDefault: boolean;
    customImage?: string;
  };
}

interface BackgroundConfig {
  useDefault: boolean;
  defaultImage?: string;
  customImage?: string;
}

interface HeaderConfig {
  enabled: boolean;
  variant: 'default' | 'minimal' | 'transparent';
  showBranding?: boolean;
  showNavigation?: boolean;
}

interface FooterConfig {
  enabled: boolean;
  variant: 'default' | 'minimal' | 'centered';
  showCopyright?: boolean;
  showTerminalButton?: boolean;
}

interface UploadConfig {
  enabled: boolean;
  basePath: string;
  maxFileSize: number;
  maxTotalSize: number;
  maxTotalFiles: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  categoryLimits: {
    hero: { maxSize: number; maxFiles: number };
    background: { maxSize: number; maxFiles: number };
    projects: { maxSize: number; maxFiles: number };
    blog: { maxSize: number; maxFiles: number };
    about: { maxSize: number; maxFiles: number };
    general: { maxSize: number; maxFiles: number };
  };
}

interface FeaturesConfig {
  projects: ProjectsConfig;
  skills: SkillsConfig;
  aboutMe: AboutMeConfig;
  blog: BlogConfig;
  contact: ContactConfig;
  terminal: TerminalConfig;
  auth: AuthConfig;
  hero: HeroConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  upload: UploadConfig;
  background: BackgroundConfig;
  theme: ThemeConfig;
  responsive: ResponsiveConfig;
}

interface LayoutConfig {
  header: {
    showNavigation: boolean;
    showLogo: boolean;
    sticky: boolean;
  };
  footer: {
    showSocialLinks: boolean;
    showCopyright: boolean;
    showTechStack: boolean;
  };
  sections: {
    order: string[];
    spacing: string;
  };
}

interface SeoConfig {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  ogImage: string;
  twitterCard: string;
  canonicalUrl: string | undefined;
}

interface AnalyticsConfig {
  enabled: boolean;
  googleAnalytics: string;
  plausible: string;
  umami: string;
}

interface PerformanceConfig {
  lazyLoading: boolean;
  imageOptimization: boolean;
  minifyAssets: boolean;
  preloadCritical: boolean;
}

interface PortfolioConfig {
  paths: PathConfig;
  isBlogEnabled: boolean;
  github: GitHubConfig;
  features: FeaturesConfig;
  layout: LayoutConfig;
  seo: SeoConfig;
  analytics: AnalyticsConfig;
  performance: PerformanceConfig;
}

// Automatische Blog-Erkennung (nutzt die Pfad-Konfiguration)
const isBlogEnabled = (() => {
  if (typeof window !== 'undefined') return false; // Client-Side: immer false
  const blogDir = path.join(__dirname, 'private/data/blog/posts');
  if (!fs || !fs.existsSync(blogDir)) return false;
  
  const files = fs.readdirSync(blogDir);
  return files.some(file => file.endsWith('.md'));
})();

const config: PortfolioConfig = {
  // Zentrale Pfad-Konfiguration - NEUE STRUKTUR
  paths: {
    // Basis-Verzeichnisse
    DATA_DIR: path.join(__dirname, 'public/data'),
    
    // About-Sektion
    about: {
      markdown: path.join(__dirname, 'private/data/about/about.md'),
      json: path.join(__dirname, 'public/data/about/about.json')
    },
    
    // Blog-Sektion
    blog: {
      postsDir: path.join(__dirname, 'private/data/blog/posts'),
      json: path.join(__dirname, 'public/data/blog/blog.json')
    },
    
    // Projects-Sektion
    projects: {
      detailsDir: path.join(__dirname, 'private/data/projects/details'),
      json: path.join(__dirname, 'public/data/projects/projects.json')
    },

    // Legacy-Support (für Übergangszeit)
    CONTENT_DIR: path.join(__dirname, 'private/data'),
    OUTPUT_DIR: path.join(__dirname, 'public/data'),
    blogDir: path.join(__dirname, 'private/data/blog/posts'),
    projectDir: path.join(__dirname, 'private/data/projects/details'),
    aboutFile: path.join(__dirname, 'private/data/about/about.md')
  },

  // Automatische Blog-Erkennung (nutzt die Pfad-Konfiguration)
  isBlogEnabled,

  // GitHub Konfiguration
  github: {
    username: process.env.GITHUB_USERNAME,
    // Welche Repositories sollen gefetcht werden
    fetchOptions: {
      includeForks: false,           // Forks einbeziehen?
      includeTemplates: false,      // Template-Repos einbeziehen?
      minStars: 0,                  // Mindestanzahl Stars
      minSize: 0,                   // Mindestgröße in KB
      languages: [],                // Spezifische Sprachen (leer = alle)
      topics: [],                   // Spezifische Topics (leer = alle)
      excludeRepos: []              // Repos die ausgeschlossen werden sollen
    }
  },

  // Portfolio Features (alle optional)
  features: {
    // Projekte-Sektion (Standard Portfolio - Default ON)
    projects: {
      enabled: process.env.ENABLE_PROJECTS !== 'false', // Default: true
      showFeatured: true,           // Featured Projects anzeigen
      showAll: true,               // All Projects anzeigen
      // NOTE: featuredCriteria has been moved to config.json
      // This field is kept for backward compatibility but should be migrated to config.json
      // TODO: Remove this field after migration is complete
      featuredCriteria: {
        minStars: 5,               // Mindestanzahl Stars für Featured
        manualOverride: [],        // Manuell als Featured markierte Repos
        excludeFromFeatured: []    // Von Featured ausschließen
      },
      categories: {
        enabled: true,             // Kategorien anzeigen
        customCategories: {        // Custom Kategorien
          'homelab': 'Homelab & Infrastructure',
          'automation': 'Automation & Scripts',
          'web-development': 'Web Development',
          'cli': 'Command Line Tools',
          'raspberry-pi': 'Raspberry Pi Projects',
          'nixos': 'NixOS Configurations',
          'tool': 'Tools & Utilities',
          'security': 'Security & Privacy',
          'gaming': 'Gaming Projects',
          'iot': 'IoT & Hardware'
        }
      },
      // README Integration (Default ON)
      readmeIntegration: {
        enabled: process.env.ENABLE_README_INTEGRATION !== 'false', // Default: true
        useAsDefault: true,        // Use README as default content
        fetchAssets: true,         // Automatically fetch assets
        fetchDocs: false,           // Fetch linked documentation (future feature)
        assetDir: 'private/data/projects',  // Assets bei Projekt-Daten (zusammen mit Markdown)
        maxAssetSize: 10 * 1024 * 1024, // 10MB
        allowedAssetTypes: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.pdf'],
        replaceAssetUrls: true,    // Replace URLs with local paths
        cleanupOldAssets: true,    // Remove assets that are no longer in README
        integrateDocs: 'append'    // How to integrate docs: 'append' | 'replace' | 'inline'
      }
    },

    // Skills-Sektion (Standard Portfolio - Default ON)
    skills: {
      enabled: process.env.ENABLE_SKILLS !== 'false', // Default: true
      showTimeline: true,          // Skills-Timeline anzeigen
      timelineOptions: {
        groupByYear: true,         // Nach Jahren gruppieren
        showProgress: true,       // Fortschritt anzeigen
        includeProjects: true     // Projekte in Timeline einbeziehen
      },
      categories: {
        languages: true,          // Programmiersprachen
        frameworks: true,         // Frameworks & Libraries
        tools: true,             // Tools & Technologies
        databases: true,         // Datenbanken
        cloud: true              // Cloud Services
      }
    },

    // About Me Sektion (Standard Portfolio - Default ON)
    aboutMe: {
      enabled: process.env.ENABLE_ABOUT_ME !== 'false', // Default: true
      markdownFile: './content/about.md',  // Pfad zur Markdown-Datei
      showStats: true,            // GitHub Stats anzeigen
      showSocialLinks: true,      // Social Links anzeigen
      customBio: '',             // Custom Bio (überschreibt GitHub Bio)
      profileImage: ''            // Custom Profilbild (überschreibt GitHub Avatar)
    },

    // Blog-Sektion (Optional Feature - Default OFF)
    blog: {
      enabled: process.env.ENABLE_BLOG === 'true', // Default: false
      markdownDir: './content/blog/',  // Verzeichnis für Blog-Posts
      postFormat: 'markdown',     // Format der Posts
      showExcerpts: true,         // Excerpts anzeigen
      postsPerPage: 5,           // Posts pro Seite
      categories: true,          // Kategorien unterstützen
      tags: true                 // Tags unterstützen
    },

    // Contact-Form (Optional Feature - Default OFF)
    contact: {
      enabled: process.env.ENABLE_CONTACT === 'true', // Default: false
      service: 'netlify',        // 'netlify', 'formspree', 'emailjs', 'custom'
      endpoint: '',              // Custom Endpoint
      fields: {                  // Formular-Felder
        name: { required: true, label: 'Name' },
        email: { required: true, label: 'Email' },
        subject: { required: true, label: 'Subject' },
        message: { required: true, label: 'Message', type: 'textarea' },
        company: { required: false, label: 'Company' },
        phone: { required: false, label: 'Phone' }
      },
      successMessage: 'Thank you for your message! I\'ll get back to you soon.',
      errorMessage: 'Sorry, there was an error sending your message. Please try again.'
    },

    // Terminal Game (Optional Feature - Default OFF)
    terminal: {
      enabled: process.env.ENABLE_TERMINAL === 'true', // Default: false
      hostname: process.env.TERMINAL_HOSTNAME,                  // Terminal Hostname
      username: process.env.TERMINAL_USERNAME,                   // Terminal Username
      password: process.env.TERMINAL_PASSWORD,                   // Terminal Password
      rootPassword: process.env.TERMINAL_ROOTSPASSWORD,          // Root Password
      showWelcomeMessage: true,   // Welcome Message anzeigen
      enableFileSystem: true,    // Fake Filesystem aktivieren
      enableCommands: true       // Terminal Commands aktivieren
    },

    // Auth System (Optional Feature - Default OFF)
    auth: {
      enabled: process.env.ENABLE_AUTH === 'true', // Default: false
      adminPassword: process.env.ADMIN_PASSWORD,
      sessionSecret: process.env.SESSION_SECRET,
      features: {
        editor: process.env.ENABLE_AUTH === 'true',
        fileUpload: process.env.ENABLE_FILE_UPLOAD === 'true',
        guestbook: process.env.ENABLE_GUESTBOOK === 'true'
      }
    },

    // Hero Section (Optional Feature - Default ON)
    hero: {
      enabled: process.env.ENABLE_HERO !== 'false', // Default: true
      variant: (process.env.HERO_VARIANT as 'floating' | 'card' | 'fullscreen' | 'minimal' | 'split') || 'floating',
      animation: {
        enabled: process.env.HERO_ANIMATION_ENABLED !== 'false', // Default: true
        type: (process.env.HERO_ANIMATION_TYPE as 'fade' | 'slide' | 'zoom' | 'none') || 'fade',
        duration: parseInt(process.env.HERO_ANIMATION_DURATION || '500', 10)
      },
      showStats: process.env.HERO_SHOW_STATS !== 'false', // Default: true
      showSocialLinks: process.env.HERO_SHOW_SOCIAL_LINKS !== 'false', // Default: true
      image: {
        useDefault: process.env.HERO_USE_DEFAULT_IMAGE !== 'false', // Default: true
        customImage: process.env.HERO_CUSTOM_IMAGE
      }
    },

    // Background Configuration
    background: {
      useDefault: process.env.BACKGROUND_USE_DEFAULT !== 'false', // Default: true
      defaultImage: '/assets/galaxy.png', // Default background
      customImage: process.env.BACKGROUND_CUSTOM_IMAGE // Custom uploaded background
    },

    // Header (Optional Feature - Default ON)
    header: {
      enabled: process.env.ENABLE_HEADER !== 'false', // Default: true
      variant: (process.env.HEADER_VARIANT as 'default' | 'minimal' | 'transparent') || 'default',
      showBranding: process.env.HEADER_SHOW_BRANDING !== 'false', // Default: true
      showNavigation: process.env.HEADER_SHOW_NAVIGATION !== 'false' // Default: true
    },

    // Footer (Optional Feature - Default ON)
    footer: {
      enabled: process.env.ENABLE_FOOTER !== 'false', // Default: true
      variant: (process.env.FOOTER_VARIANT as 'default' | 'minimal' | 'centered') || 'default',
      showCopyright: process.env.FOOTER_SHOW_COPYRIGHT !== 'false', // Default: true
      showTerminalButton: process.env.FOOTER_SHOW_TERMINAL_BUTTON !== 'false' // Default: true
    },

    // File Upload (Optional Feature - Default OFF)
    upload: {
      enabled: process.env.ENABLE_FILE_UPLOAD === 'true', // Default: false
      basePath: path.join(__dirname, 'public/uploads'),
      maxFileSize: 10 * 1024 * 1024, // 10MB default
      maxTotalSize: 500 * 1024 * 1024, // 500MB total
      maxTotalFiles: 1000,
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.pdf'],
      allowedMimeTypes: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm', 'application/pdf'
      ],
      categoryLimits: {
        hero: { maxSize: 2 * 1024 * 1024, maxFiles: 1 },
        background: { maxSize: 3 * 1024 * 1024, maxFiles: 1 },
        projects: { maxSize: 10 * 1024 * 1024, maxFiles: 50 },
        blog: { maxSize: 5 * 1024 * 1024, maxFiles: 200 },
        about: { maxSize: 2 * 1024 * 1024, maxFiles: 5 },
        general: { maxSize: 5 * 1024 * 1024, maxFiles: 100 }
      }
    },

    // Theme-Switcher
    theme: {
      enabled: true,             // Dark/Light Mode aktivieren?
      defaultTheme: 'dark',      // 'dark', 'light', 'auto'
      defaultDesign: 'glassmorphism', // 'glassmorphism', 'flat', 'minimal'
      themes: {
        dark: {
          name: 'Dark',
          primary: '#6366f1',
          secondary: '#8b5cf6',
          background: '#0f0f23',
          surface: '#1a1a2e',
          text: '#ffffff'
        },
        light: {
          name: 'Light',
          primary: '#3b82f6',
          secondary: '#6366f1',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1e293b'
        }
      },
      designs: {
        glassmorphism: {
          id: 'glassmorphism',
          name: 'Glassmorphism',
          description: 'Glass effects with blur, transparency, and glowing borders',
          enabled: true
        },
        flat: {
          id: 'flat',
          name: 'Flat',
          description: 'Solid backgrounds, no blur effects, clean borders',
          enabled: true
        },
        minimal: {
          id: 'minimal',
          name: 'Minimal',
          description: 'Very clean, sharp borders, minimal effects',
          enabled: true
        }
      },
      persistChoice: true,        // Theme-Wahl speichern
      publicSwitcher: {
        enabled: false,           // Public switcher button enabled
        allowThemeSwitch: true,   // Allow theme switching
        allowDesignSwitch: true,  // Allow design switching
        availableThemes: ['dark', 'light'],
        availableDesigns: ['glassmorphism', 'flat', 'minimal'],
        switcherType: 'combined',  // 'separate' | 'combined'
        position: 'top-right'      // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
      }
    },

    // Responsive Design
    responsive: {
      enabled: true,             // Responsive Design aktivieren?
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1280px'
      },
      mobileFirst: true,         // Mobile-First Approach
      touchOptimized: true       // Touch-Optimierung
    }
  },

  // Layout-Konfiguration
  layout: {
    header: {
      showNavigation: true,      // Navigation anzeigen
      showLogo: true,           // Logo anzeigen
      sticky: true              // Sticky Header
    },
    footer: {
      showSocialLinks: true,    // Social Links anzeigen
      showCopyright: true,      // Copyright anzeigen
      showTechStack: true       // Tech Stack anzeigen
    },
    sections: {
      order: [                   // Reihenfolge der Sektionen
        'hero',
        'about',
        'projects',
        'skills',
        'blog',
        'contact'
      ],
      spacing: 'large'          // 'small', 'medium', 'large'
    }
  },

  // SEO & Meta
  seo: {
    title: 'Patrick B. - Tech Enthusiast & Homelab Stuff',
    description: 'Vibecoder mit Leidenschaft für Technologie, Homelab und Automatisierung',
    keywords: ['portfolio', 'homelab', 'nixos', 'raspberry-pi', 'tech-enthusiast', 'hobby-projects', 'automation'],
    author: 'Patrick B.',
    ogImage: '/assets/og-image.png',
    twitterCard: 'summary_large_image',
    canonicalUrl: process.env.CANONICAL_URL || process.env.DOMAIN  // ← Dynamisch!
  },

  // Analytics (optional)
  analytics: {
    enabled: false,              // Analytics aktivieren?
    googleAnalytics: '',         // GA4 Measurement ID
    plausible: '',              // Plausible Domain
    umami: ''                   // Umami Website ID
  },

  // Performance
  performance: {
    lazyLoading: true,          // Lazy Loading für Bilder
    imageOptimization: true,    // Bild-Optimierung
    minifyAssets: true,         // Assets minifizieren
    preloadCritical: true       // Kritische Ressourcen preloaden
  }
};

export default config;
