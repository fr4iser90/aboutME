/**
 * Setup Wizard Component
 * 
 * Main component for the 11-step setup wizard flow.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminPageLayout from '@/features/admin/components/AdminPageLayout';
import { SetupWizardConfig, GitHubFilterConfig, ProgressStatus } from '../types/setup.types';
import { updateProgress, getProgress } from '../services/progressTracker';
import {
  BasicInfoStep,
  GitHubFilterStep,
  FeaturesStep,
  ReviewStep,
  GenerateStep,
  EditStep,
  AppearanceStep,
  QualityCheckStep,
  PreviewStep,
  IntegrityCheckStep,
  BuildPublishStep,
} from './steps';

interface SetupWizardProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, label: 'Basic Info', description: 'GitHub & Portfolio details' },
  { id: 2, label: 'GitHub Filter', description: 'Filter repositories' },
  { id: 3, label: 'Features', description: 'Configure portfolio features' },
  { id: 4, label: 'Review', description: 'Check your configuration' },
  { id: 5, label: 'Generate', description: 'Create your portfolio' },
  { id: 6, label: 'Edit', description: 'Edit markdown files' },
  { id: 7, label: 'Appearance', description: 'Design, Theme & Layout' },
  { id: 8, label: 'Quality Check', description: 'Validate all files' },
  { id: 9, label: 'Preview', description: 'Preview portfolio' },
  { id: 10, label: 'Integrity Check', description: 'Final verification' },
  { id: 11, label: 'Build & Publish', description: 'Publish portfolio' },
];

export default function SetupWizard({ onComplete, onCancel }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<SetupWizardConfig>({
    githubUsername: '',
    githubToken: '',
    portfolioTitle: '',
    portfolioDescription: '',
    portfolioAuthor: '',
    githubFilter: {
      includeForks: false,
      includeTemplates: false,
      includePrivate: false,
      minStars: 0,
      excludeRepos: [],
      featuredProjects: [],
    },
    features: {
      projects: true,
      skills: true,
      aboutMe: true,
      blog: false,
      terminal: false,
      auth: false,
      editor: false,
      fileUpload: false,
      guestbook: false,
    },
    auth: {
      adminPassword: '',
      adminPasswordConfirm: '',
      passwordAlreadySet: false,
    },
    appearance: {
      design: 'glassmorphism',
      theme: 'dark',
      displayMode: 'portfolio',
      useDesignDefaults: true,
    },
  });
  const [filteredRepositories, setFilteredRepositories] = useState<any[]>([]);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  // Only save progress when step changes, NOT when config changes
  // Config changes should be saved explicitly by the user or step components
  useEffect(() => {
    saveProgress();
  }, [step]); // Removed 'config' from dependencies to prevent infinite loop

  const loadProgress = async () => {
    try {
      const progress = await getProgress();
      console.log('Loading progress:', progress);
      
      // Load config from API first
      const response = await fetch('/api/setup/config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig((prev) => ({
            ...prev,
            githubUsername: data.config.github?.username || prev.githubUsername,
            // githubToken is NOT loaded from API - it's only kept in memory during setup
            portfolioTitle: data.config.seo?.title || prev.portfolioTitle,
            portfolioDescription: data.config.seo?.description || prev.portfolioDescription,
            portfolioAuthor: data.config.seo?.author || prev.portfolioAuthor,
            features: data.config.features || prev.features,
            appearance: data.config.appearance || prev.appearance,
            githubFilter: data.config.githubFilter || prev.githubFilter,
            auth: {
              adminPassword: prev.auth?.adminPassword || '',
              adminPasswordConfirm: prev.auth?.adminPasswordConfirm || '',
              passwordAlreadySet: data.config.auth?.passwordAlreadySet || false,
            },
          }));
        }
      }
      
      // Set initialized FIRST, then set step to prevent saveProgress from running with step 1
      setIsInitialized(true);
      
      // Now set the step - this will trigger saveProgress, but isInitialized is already true
      if (progress && progress.currentStep) {
        console.log('Setting step to:', progress.currentStep);
        setStep(progress.currentStep);
      }
    } catch (error) {
      console.warn('Could not load progress:', error);
      setIsInitialized(true); // Still mark as initialized even on error
    }
  };

  const saveProgress = async () => {
    try {
      await updateProgress(step, {
        currentStep: step,
        progress: Math.round((step / 11) * 100),
      });
    } catch (error) {
      console.warn('Could not save progress:', error);
    }
  };

  const handleNext = async () => {
    // Clear any previous errors
    setStepError(null);
    
    // Validate current step before proceeding
    if (!isStepValid()) {
      if (step === 3 && config.features?.auth) {
        setStepError('Please configure a valid admin password: min 12 characters, uppercase, lowercase, number, special character, and passwords must match');
        // Auto-scroll to error (will scroll to auth section in FeaturesStep)
        setTimeout(() => {
          const authSection = document.querySelector('.setup-page__auth-section');
          if (authSection) {
            authSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
      return;
    }
    
    if (step < 11) {
      // Save configuration when leaving steps
      try {
        if (step === 1) {
          // Save Basic Info to .env
          await fetch('/api/setup/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              githubUsername: config.githubUsername,
              // githubToken is NOT sent to API - it's only used temporarily during setup
              portfolioTitle: config.portfolioTitle,
              portfolioDescription: config.portfolioDescription,
              portfolioAuthor: config.portfolioAuthor,
              seo: {
                title: config.portfolioTitle,
                description: config.portfolioDescription,
                author: config.portfolioAuthor,
              },
              github: {
                username: config.githubUsername,
                // Token is NEVER stored for security reasons
              },
            }),
          });
        } else if (step === 2) {
          // Save GitHub Filter to config.json
          // Calculate filtered repo names by applying filters to all repos
          const filteredRepoNames = filteredRepositories
            .filter(repo => {
              if (!config.githubFilter?.includeForks && repo.fork) return false;
              if (!config.githubFilter?.includeTemplates && repo.is_template) return false;
              if (!config.githubFilter?.includePrivate && repo.visibility === 'private') return false;
              if (config.githubFilter?.minStars && (repo.stargazers_count || 0) < config.githubFilter.minStars) return false;
              if (config.githubFilter?.excludeRepos?.includes(repo.name)) return false;
              return true;
            })
            .map(repo => repo.name);
          
          await fetch('/api/setup/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              githubFilter: {
                ...config.githubFilter,
                selectedRepos: filteredRepoNames,
              },
            }),
          });
        } else if (step === 3) {
          // Save Features to config.json (all features including projects, skills, aboutMe)
          // Only send password if it's not the placeholder asterisks
          const authToSave = config.auth?.passwordAlreadySet 
            ? { passwordAlreadySet: true } // Don't send asterisks to API
            : config.auth; // Send actual password if user entered a new one
          
          await fetch('/api/setup/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              features: {
                projects: config.features?.projects ?? true,
                skills: config.features?.skills ?? true,
                aboutMe: config.features?.aboutMe ?? true,
                blog: config.features?.blog ?? false,
                terminal: config.features?.terminal ?? false,
                auth: config.features?.auth ?? false,
                editor: config.features?.editor ?? false,
                fileUpload: config.features?.fileUpload ?? false,
                guestbook: config.features?.guestbook ?? false,
              },
              auth: authToSave,
            }),
          });
        }
      } catch (error) {
        console.warn('Could not save config:', error);
      }
      
      const newStep = step + 1;
      setStep(newStep);
      await updateProgress(newStep, {
        currentStep: newStep,
        progress: Math.round((newStep / 11) * 100),
      });
    }
  };

  const handlePrevious = async () => {
    if (step > 1) {
      const newStep = step - 1;
      setStep(newStep);
      await updateProgress(newStep, {
        currentStep: newStep,
        progress: Math.round((newStep / 11) * 100),
      });
      
      // Reload config from API when going back to ensure we have saved data
      try {
        const response = await fetch('/api/setup/config');
        if (response.ok) {
          const data = await response.json();
          if (data.config) {
            setConfig((prev) => ({
              ...prev,
              githubUsername: data.config.github?.username || prev.githubUsername,
              portfolioTitle: data.config.seo?.title || prev.portfolioTitle,
              portfolioDescription: data.config.seo?.description || prev.portfolioDescription,
              portfolioAuthor: data.config.seo?.author || prev.portfolioAuthor,
              features: data.config.features || prev.features,
              appearance: data.config.appearance || prev.appearance,
              githubFilter: data.config.githubFilter || prev.githubFilter,
            }));
          }
        }
      } catch (error) {
        console.warn('Could not reload config:', error);
      }
    }
  };

  // Navigate to a previously visited step (only to steps <= current step)
  const goToStep = async (targetStep: number) => {
    // Only allow navigation to steps that have been visited (<= current step)
    // and not to the current step itself
    if (targetStep <= step && targetStep !== step && targetStep >= 1 && targetStep <= STEPS.length) {
      setStepError(null); // Clear any errors
      setStep(targetStep);
      await updateProgress(targetStep, {
        currentStep: targetStep,
        progress: Math.round((targetStep / 11) * 100),
      });
      
      // Reload config from API to ensure we have saved data
      try {
        const response = await fetch('/api/setup/config');
        if (response.ok) {
          const data = await response.json();
          if (data.config) {
            setConfig((prev) => ({
              ...prev,
              githubUsername: data.config.github?.username || prev.githubUsername,
              portfolioTitle: data.config.seo?.title || prev.portfolioTitle,
              portfolioDescription: data.config.seo?.description || prev.portfolioDescription,
              portfolioAuthor: data.config.seo?.author || prev.portfolioAuthor,
              features: data.config.features || prev.features,
              appearance: data.config.appearance || prev.appearance,
              githubFilter: data.config.githubFilter || prev.githubFilter,
            }));
          }
        }
      } catch (error) {
        console.warn('Could not reload config:', error);
      }
    }
  };

  // Check if a step can be navigated to (only visited steps, not current step)
  const canNavigateToStep = (targetStep: number): boolean => {
    return targetStep <= step && targetStep !== step && targetStep >= 1 && targetStep <= STEPS.length;
  };

  const handleConfigUpdate = useCallback((updates: Partial<SetupWizardConfig>) => {
    try {
      setConfig((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating config:', error);
    }
  }, []);

  const handleGitHubFilterUpdate = useCallback((filter: GitHubFilterConfig) => {
    setConfig((prev) => {
      // Only update if filter actually changed
      if (JSON.stringify(prev.githubFilter) === JSON.stringify(filter)) {
        return prev;
      }
      return { ...prev, githubFilter: filter };
    });
  }, []);

  const handleGenerateComplete = async (result: any) => {
    setGenerationResult(result);
    await updateProgress(step, {
      setupComplete: true,
      setupAt: new Date().toISOString(),
    });
    // Don't auto-advance - let user click Continue in action bar
  };

  const handleEditFiles = () => {
    setStep(6); // Edit step
  };

  const handleEditComplete = async () => {
    await updateProgress(step, {
      validated: true,
      validatedAt: new Date().toISOString(),
    });
    handleNext();
  };

  const handlePublishComplete = async () => {
    await updateProgress(step, {
      published: true,
      publishedAt: new Date().toISOString(),
    });
    onComplete({ success: true });
  };

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return !!config.githubUsername;
      case 2:
        return true; // GitHub filter is optional
      case 3:
        if (config.features?.auth) {
          // If password is already set, step is valid
          if (config.auth?.passwordAlreadySet) {
            return true;
          }
          
          const password = config.auth?.adminPassword || '';
          const passwordConfirm = config.auth?.adminPasswordConfirm || '';
          
          // Same validation rules as backend
          const hasMinLength = password.length >= 12;
          const hasUppercase = /[A-Z]/.test(password);
          const hasLowercase = /[a-z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          const hasSpecialChar = /[!@#$%^&*()_+=\-\[\]{};':"\\|,.<>?]/.test(password);
          const passwordsMatch = password === passwordConfirm;
          
          return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar && passwordsMatch;
        }
        return true;
      case 4:
        return true; // Review step is always valid
      case 5:
        return !!generationResult; // Must have generated data
      case 6:
        return true; // Edit step validation handled internally
      case 7:
        return true; // Appearance step is always valid
      case 8:
        return true; // Quality check validation handled internally
      case 9:
        return true; // Preview step is always valid
      case 10:
        return true; // Integrity check handled internally
      case 11:
        return true; // Build & publish handled internally
      default:
        return false;
    }
  };

  const renderStep = () => {
    try {
      switch (step) {
        case 1:
          return (
            <BasicInfoStep
              config={config}
              onUpdate={handleConfigUpdate}
            />
          );
        case 2:
          return (
            <GitHubFilterStep
              config={config}
              onUpdate={handleGitHubFilterUpdate}
              onReposUpdate={setFilteredRepositories}
            />
          );
        case 3:
          return (
            <FeaturesStep
              config={config || {}}
              onUpdate={handleConfigUpdate}
            />
          );
      case 4:
        // Use selectedRepos list
        const selectedRepoNames = config.githubFilter?.selectedRepos || [];
        const reviewRepos = filteredRepositories.filter(repo => 
          selectedRepoNames.includes(repo.name)
        );
        return (
          <ReviewStep
            config={config}
            repositories={reviewRepos}
          />
        );
      case 5:
        return (
          <GenerateStep
            config={config}
            onComplete={handleGenerateComplete}
          />
        );
      case 6:
        return (
          <EditStep
            onComplete={handleEditComplete}
            onBack={() => setStep(5)}
          />
        );
      case 7:
        return (
          <AppearanceStep
            config={config}
            onUpdate={(appearance) => handleConfigUpdate({ appearance })}
          />
        );
      case 8:
        return (
          <QualityCheckStep
            onComplete={handleNext}
            onBack={() => setStep(6)}
          />
        );
      case 9:
        return (
          <PreviewStep
            onComplete={handleNext}
            onBack={() => setStep(8)}
          />
        );
      case 10:
        return (
          <IntegrityCheckStep
            onComplete={handleNext}
            onCancel={onCancel}
            onBack={() => setStep(9)}
          />
        );
      case 11:
        return (
          <BuildPublishStep
            onComplete={handlePublishComplete}
          />
        );
      default:
        return null;
      }
    } catch (error) {
      console.error('Error rendering step:', error);
      return (
        <div className="glass-card setup-page__form">
          <h3 className="setup-page__form-title">❌ Error</h3>
          <p className="setup-form__error">
            An error occurred while loading this step. Please refresh the page.
          </p>
          <p className="setup-form__hint">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      );
    }
  };

  return (
    <AdminPageLayout
      title="🚀 Portfolio Setup"
      subtitle="Configure your portfolio in 11 steps"
      centered={false}
      maxWidth="full"
    >
      <div className="setup-page__wrapper">
        {/* Progress Bar */}
        <div className="setup-page__progress">
          {STEPS.map((stepItem, index) => {
            const isClickable = canNavigateToStep(stepItem.id);
            const isActive = step === stepItem.id;
            const isCompleted = step > stepItem.id;
            const isPending = step < stepItem.id;
            
            return (
              <div 
                key={stepItem.id} 
                className={`setup-page__progress-item ${
                  isClickable ? 'setup-page__progress-item--clickable' : ''
                } ${isPending ? 'setup-page__progress-item--disabled' : ''}`}
                onClick={isClickable ? () => goToStep(stepItem.id) : undefined}
                title={isClickable ? `Click to go back to: ${stepItem.label}` : isPending ? 'Complete previous steps first' : ''}
              >
                <div
                  className={`setup-page__progress-step ${
                    isCompleted
                      ? 'setup-page__progress-step--completed'
                      : isActive
                      ? 'setup-page__progress-step--active'
                      : 'setup-page__progress-step--pending'
                  }`}
                >
                  {isCompleted ? '✓' : stepItem.id}
                </div>
                <div className="setup-page__progress-content">
                  <div className="setup-page__progress-label">{stepItem.label}</div>
                  <div className="setup-page__progress-description">{stepItem.description}</div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`setup-page__progress-line ${
                      isCompleted ? 'setup-page__progress-line--completed' : ''
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="setup-page__content">{renderStep()}</div>

        {/* Actions */}
        <div className="glass-card setup-page__actions">
        <div className="setup-page__actions-left">
          {step > 1 && (
            <button
              className="setup-page__button setup-page__button--reset"
              onClick={handlePrevious}
            >
              ← Previous
            </button>
          )}
        </div>

        <div className="setup-page__actions-right">
          {stepError && (
            <span className="setup-page__action-error">{stepError}</span>
          )}
          {step < 11 && step !== 6 && step !== 8 && step !== 9 && step !== 10 && step !== 11 && (
            <button
              className={`setup-page__button setup-page__button--primary ${
                !isStepValid() ? 'setup-page__button--disabled' : ''
              }`}
              onClick={() => {
                if (!isStepValid() && step === 3 && config.features?.auth) {
                  // Focus and scroll to admin password field when disabled
                  setTimeout(() => {
                    const passwordInput = document.getElementById('admin-password-input');
                    if (passwordInput) {
                      passwordInput.focus();
                      passwordInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                } else if (step === 5 && generationResult) {
                  // For step 5, continue with the generation result
                  handleNext();
                } else {
                  handleNext();
                }
              }}
              disabled={!isStepValid()}
              title={!isStepValid() && step === 3 && config.features?.auth 
                ? 'Please configure a valid admin password: min 12 characters, uppercase, lowercase, number, special character, and passwords must match' 
                : !isStepValid() && step === 5
                ? 'Please generate the portfolio data first'
                : undefined}
            >
              {step === 5 ? 'Continue' : 'Next →'}
            </button>
          )}

          <button
            className="setup-page__button setup-page__button--reset"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
      </div>
    </AdminPageLayout>
  );
}
