'use client'

import { useState, useEffect } from 'react'
import { isSystemConfigured, getPortfolioStatus } from '@/features/setup/services/setup-mode'

interface SetupStatus {
  isConfigured: boolean
  isLoading: boolean
  error: Error | null
  portfolioStatus: 'unconfigured' | 'building' | 'active' | null
  setupModeEnabled: boolean | null
}

/**
 * Custom hook for setup status management
 * 
 * Fetches setup status from API and provides loading/error states
 * Uses existing setup-mode service functions for consistency
 */
export function useSetupStatus(): SetupStatus {
  const [isConfigured, setIsConfigured] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [portfolioStatus, setPortfolioStatus] = useState<'unconfigured' | 'building' | 'active' | null>(null)
  const [setupModeEnabled, setSetupModeEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchSetupStatus = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch from API to get all status info including setupModeEnabled
        const response = await fetch('/api/setup/status')
        const data = await response.json()

        if (mounted) {
          setIsConfigured(data.isConfigured)
          setPortfolioStatus(data.portfolioStatus)
          setSetupModeEnabled(data.setupModeEnabled)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setIsConfigured(false)
          setPortfolioStatus('unconfigured')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchSetupStatus()

    return () => {
      mounted = false
    }
  }, [])

  return {
    isConfigured,
    isLoading,
    error,
    portfolioStatus,
    setupModeEnabled
  }
}

