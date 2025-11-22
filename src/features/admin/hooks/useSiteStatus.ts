import { useState, useEffect } from 'react';

// Types defined here to avoid importing from server-only module
export interface SiteStatus {
  setupComplete: boolean;
  validated: boolean;
  published: boolean;
  setupAt: string | null;
  validatedAt: string | null;
  publishedAt: string | null;
}

export type CurrentStatus = 'setup_required' | 'ready_to_build' | 'validated' | 'published';

function calculateCurrentStatus(status: SiteStatus): CurrentStatus {
  if (!status.setupComplete) {
    return 'setup_required';
  }
  if (status.setupComplete && !status.validated) {
    return 'ready_to_build';
  }
  if (status.validated && !status.published) {
    return 'validated';
  }
  return 'published';
}

export interface SiteStatusHook {
  setupComplete: boolean;
  validated: boolean;
  published: boolean;
  currentStatus: CurrentStatus;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage site status
 */
export function useSiteStatus(): SiteStatusHook {
  const [status, setStatus] = useState<SiteStatus>({
    setupComplete: false,
    validated: false,
    published: false,
    setupAt: null,
    validatedAt: null,
    publishedAt: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/site/status');
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }
      const data = await response.json();
      setStatus({
        setupComplete: data.setupComplete ?? false,
        validated: data.validated ?? false,
        published: data.published ?? false,
        setupAt: data.setupAt ?? null,
        validatedAt: data.validatedAt ?? null,
        publishedAt: data.publishedAt ?? null
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const currentStatus = calculateCurrentStatus(status);

  return {
    setupComplete: status.setupComplete,
    validated: status.validated,
    published: status.published,
    currentStatus,
    isLoading,
    error,
    refresh: fetchStatus
  };
}

