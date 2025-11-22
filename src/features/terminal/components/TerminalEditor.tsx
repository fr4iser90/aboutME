'use client'

import { useState, useEffect } from 'react'
import TerminalConfigForm, { TerminalConfig } from './TerminalConfigForm'

interface TerminalFilesStatus {
  filesExist: boolean
  filesStatus: Record<string, boolean>
  files: Record<string, any> | null
}

export default function TerminalEditor() {
  const [loading, setLoading] = useState(true)
  const [filesStatus, setFilesStatus] = useState<TerminalFilesStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mode, setMode] = useState<'setup' | 'edit'>('setup')

  useEffect(() => {
    checkTerminalFiles()
  }, [])

  const checkTerminalFiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/editor/terminal')
      if (!response.ok) {
        throw new Error('Failed to check terminal files')
      }

      const data = await response.json()
      setFilesStatus(data)
      setMode(data.filesExist ? 'edit' : 'setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFromTemplate = async (config: TerminalConfig) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/editor/terminal/generate-from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate from template')
      }

      const data = await response.json()
      setSuccess(`Successfully generated ${data.savedFiles.length} terminal files from templates`)
      
      // Refresh file status
      await checkTerminalFiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleManualCreate = async (config: TerminalConfig) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // For manual creation, user will fill in the data in a separate view
      // For now, we'll show a message
      setSuccess('Manual creation mode - implement manual data entry form here')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (config: TerminalConfig) => {
    // This will be used when editing existing files
    setSuccess('Save functionality - to be implemented for edit mode')
  }

  if (loading && !filesStatus) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        <p>Loading terminal configuration...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#00d4ff', marginBottom: '8px' }}>Terminal Editor</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Configure terminal settings and generate terminal data files
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#3a1a1a',
          border: '1px solid #ff4444',
          borderRadius: '4px',
          color: '#ff4444',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          background: '#1a3a1a',
          border: '1px solid #44ff44',
          borderRadius: '4px',
          color: '#44ff44',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}

      {mode === 'setup' && (
        <div>
          <div style={{
            background: '#2a2a2a',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#00d4ff', marginBottom: '12px' }}>Terminal Setup</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
              Terminal files do not exist yet. Choose how you want to create them:
            </p>
            <ul style={{ color: '#94a3b8', fontSize: '14px', paddingLeft: '20px', marginBottom: '16px' }}>
              <li><strong>Generate from Template:</strong> Creates all 6 terminal files from templates with your configuration</li>
              <li><strong>Create Manual:</strong> Create terminal data files manually (advanced)</li>
            </ul>
          </div>

          <TerminalConfigForm
            onSubmit={handleSave}
            onGenerateFromTemplate={handleGenerateFromTemplate}
            onManualCreate={handleManualCreate}
          />
        </div>
      )}

      {mode === 'edit' && filesStatus && (
        <div>
          <div style={{
            background: '#2a2a2a',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#00d4ff', marginBottom: '12px' }}>Edit Existing Terminal Files</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
              Terminal files exist. You can regenerate from templates or edit manually.
            </p>
            
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#00d4ff', marginBottom: '8px', fontSize: '14px' }}>File Status:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {Object.entries(filesStatus.filesStatus).map(([fileName, exists]) => (
                  <div key={fileName} style={{
                    padding: '8px',
                    background: exists ? '#1a3a1a' : '#3a1a1a',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: exists ? '#44ff44' : '#ff4444'
                  }}>
                    {exists ? '✅' : '❌'} {fileName}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <TerminalConfigForm
            onSubmit={handleSave}
            onGenerateFromTemplate={handleGenerateFromTemplate}
            onManualCreate={handleManualCreate}
            initialConfig={filesStatus.files?.['terminal-user-info.json'] || {}}
          />
        </div>
      )}
    </div>
  )
}

