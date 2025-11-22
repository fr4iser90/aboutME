/**
 * Progress Tracking Service
 * 
 * Manages and persists the setup wizard's progress status.
 */

import { ProgressStatus } from '../types/setup.types';

const CONFIG_JSON_PATH = 'config.json';

/**
 * Get current progress status
 */
export async function getProgress(): Promise<ProgressStatus> {
  try {
    const response = await fetch('/api/setup/config');
    if (response.ok) {
      const data = await response.json();
      const progress = data.config?.progress || getDefaultProgress();
      console.log('getProgress() returned:', progress);
      return progress;
    }
  } catch (error) {
    console.warn('Could not load progress:', error);
  }
  const defaultProgress = getDefaultProgress();
  console.log('getProgress() returning default:', defaultProgress);
  return defaultProgress;
}

/**
 * Update progress status
 * 
 * NOTE: This function makes a GET request to get current progress, then a POST to save.
 * To avoid unnecessary API calls, consider passing currentProgress as parameter if available.
 */
export async function updateProgress(
  step: number,
  status: Partial<ProgressStatus>,
  currentProgress?: ProgressStatus // Optional: pass current progress to avoid extra GET request
): Promise<ProgressStatus> {
  // Only fetch if not provided
  const progress = currentProgress || await getProgress();
  
  const updatedProgress: ProgressStatus = {
    ...progress,
    ...status,
    currentStep: step,
    progress: Math.round((step / 11) * 100),
  };

  if (status.setupComplete && !progress.setupComplete) {
    updatedProgress.setupAt = new Date().toISOString();
  }
  if (status.validated && !progress.validated) {
    updatedProgress.validatedAt = new Date().toISOString();
  }
  if (status.published && !progress.published) {
    updatedProgress.publishedAt = new Date().toISOString();
  }

  await saveProgress(updatedProgress);
  return updatedProgress;
}

/**
 * Save progress to config.json
 */
export async function saveProgress(progress: ProgressStatus): Promise<void> {
  try {
    await fetch('/api/setup/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        progress,
      }),
    });
  } catch (error) {
    console.error('Could not save progress:', error);
    throw error;
  }
}

/**
 * Load progress from config.json
 */
export async function loadProgress(): Promise<ProgressStatus> {
  return getProgress();
}

/**
 * Get default progress status
 */
function getDefaultProgress(): ProgressStatus {
  return {
    progress: 0,
    currentStep: 1,
    setupComplete: false,
    validated: false,
    published: false,
    setupAt: null,
    validatedAt: null,
    publishedAt: null,
  };
}

/**
 * Reset progress to initial state
 */
export async function resetProgress(): Promise<void> {
  await saveProgress(getDefaultProgress());
}

