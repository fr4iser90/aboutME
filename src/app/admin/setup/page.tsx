'use client'

import { useRouter } from 'next/navigation'
import SetupWizard from '@/features/setup/components/SetupWizard'

interface DataPipelineResult {
  data: any
  errors: string[]
  executionTime: number
}

/**
 * Admin Setup Page
 * 
 * Integrates SetupWizard component into admin panel
 * Redirects to admin dashboard on completion
 */
export default function AdminSetupPage() {
  const router = useRouter()

  const handleSetupComplete = (result: DataPipelineResult) => {
    // Redirect is handled inside SetupWizard component
    if (result.errors?.length === 0) {
      // Additional handling if needed
    }
  }

  const handleSetupCancel = () => {
    router.push('/admin')
  }

  return (
    <SetupWizard
      onComplete={handleSetupComplete}
      onCancel={handleSetupCancel}
    />
  )
}

