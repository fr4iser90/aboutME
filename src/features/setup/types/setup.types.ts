/**
 * Setup Wizard TypeScript Types
 * 
 * Defines all TypeScript interfaces and types for the setup wizard.
 */

export interface SetupWizardConfig {
  githubUsername: string;
  githubToken?: string;
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioAuthor: string;
  githubFilter?: GitHubFilterConfig;
  features?: {
    projects: boolean;
    skills: boolean;
    aboutMe: boolean;
    blog: boolean;
    terminal: boolean;
    auth: boolean;
    editor: boolean;
    fileUpload: boolean;
    guestbook: boolean;
  };
  auth?: {
    adminPassword: string;
    adminPasswordConfirm: string;
    passwordAlreadySet?: boolean;
  };
  appearance?: {
    design?: string;
    theme?: string;
    displayMode?: string;
    useDesignDefaults?: boolean;
  };
}

export interface GitHubFilterConfig {
  includeForks: boolean;
  includeTemplates: boolean;
  includePrivate: boolean; // Include private repositories
  minStars: number;
  excludeRepos: string[];
  featuredProjects: string[];
  selectedRepos?: string[]; // List of repo names to actually scrape
}

export interface ProgressStatus {
  progress: number;
  currentStep: number;
  setupComplete: boolean;
  validated: boolean;
  published: boolean;
  setupAt: string | null;
  validatedAt: string | null;
  publishedAt: string | null;
}

export interface StepState {
  step: number;
  isValid: boolean;
  isComplete: boolean;
  data?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  files: {
    path: string;
    valid: boolean;
    errors: string[];
    warnings: string[];
  }[];
}

export interface FeaturedCriteria {
  minStars: number;
  manualOverride: string[];
  excludeFromFeatured: string[];
}

