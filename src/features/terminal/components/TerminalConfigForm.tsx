'use client'

import { useState, FormEvent } from 'react'

interface TerminalConfigFormProps {
  onSubmit: (config: TerminalConfig) => void
  onGenerateFromTemplate: (config: TerminalConfig) => void
  onManualCreate: (config: TerminalConfig) => void
  initialConfig?: Partial<TerminalConfig>
}

export interface TerminalConfig {
  hostname: string
  username: string
  password: string
  rootPassword: string
  passwordHint?: string
  rootPasswordHint?: string
}

export default function TerminalConfigForm({
  onSubmit,
  onGenerateFromTemplate,
  onManualCreate,
  initialConfig
}: TerminalConfigFormProps) {
  const [config, setConfig] = useState<TerminalConfig>({
    hostname: initialConfig?.hostname || '',
    username: initialConfig?.username || '',
    password: initialConfig?.password || '',
    rootPassword: initialConfig?.rootPassword || '',
    passwordHint: initialConfig?.passwordHint || '',
    rootPasswordHint: initialConfig?.rootPasswordHint || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof TerminalConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!config.hostname.trim()) {
      newErrors.hostname = 'Hostname is required'
    }

    if (!config.username.trim()) {
      newErrors.username = 'Username is required'
    }

    if (!config.password.trim()) {
      newErrors.password = 'Password is required'
    }

    if (!config.rootPassword.trim()) {
      newErrors.rootPassword = 'Root password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(config)
    }
  }

  const handleGenerateFromTemplate = (e: FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onGenerateFromTemplate(config)
    }
  }

  const handleManualCreate = (e: FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onManualCreate(config)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#00d4ff' }}>
          Hostname
        </label>
        <input
          type="text"
          value={config.hostname}
          onChange={(e) => handleInputChange('hostname', e.target.value)}
          placeholder="portfolio-server"
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#2a2a2a',
            border: errors.hostname ? '1px solid #ff4444' : '1px solid #444',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px'
          }}
        />
        {errors.hostname && (
          <span style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.hostname}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#00d4ff' }}>
          Username
        </label>
        <input
          type="text"
          value={config.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="user"
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#2a2a2a',
            border: errors.username ? '1px solid #ff4444' : '1px solid #444',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px'
          }}
        />
        {errors.username && (
          <span style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.username}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#00d4ff' }}>
          Password
        </label>
        <input
          type="text"
          value={config.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          placeholder="password123"
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#2a2a2a',
            border: errors.password ? '1px solid #ff4444' : '1px solid #444',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px'
          }}
        />
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
          Terminal game password (visible for gameplay)
        </div>
        {errors.password && (
          <span style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.password}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#00d4ff' }}>
          Root Password
        </label>
        <input
          type="text"
          value={config.rootPassword}
          onChange={(e) => handleInputChange('rootPassword', e.target.value)}
          placeholder="root123"
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#2a2a2a',
            border: errors.rootPassword ? '1px solid #ff4444' : '1px solid #444',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px'
          }}
        />
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
          Terminal game root password (visible for gameplay)
        </div>
        {errors.rootPassword && (
          <span style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.rootPassword}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#00d4ff' }}>
          Password Hint (optional)
        </label>
        <input
          type="text"
          value={config.passwordHint || ''}
          onChange={(e) => handleInputChange('passwordHint', e.target.value)}
          placeholder="First letter is u"
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#00d4ff' }}>
          Root Password Hint (optional)
        </label>
        <input
          type="text"
          value={config.rootPasswordHint || ''}
          onChange={(e) => handleInputChange('rootPasswordHint', e.target.value)}
          placeholder="First letter is r"
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button
          type="button"
          onClick={handleGenerateFromTemplate}
          style={{
            padding: '10px 20px',
            background: '#00d4ff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Generate from Template
        </button>

        <button
          type="button"
          onClick={handleManualCreate}
          style={{
            padding: '10px 20px',
            background: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Create Manual
        </button>
      </div>
    </form>
  )
}

