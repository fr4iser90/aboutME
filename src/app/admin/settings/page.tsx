'use client'

import { useState, useEffect } from 'react'
import AdminPageLayout from '@/features/admin/components/AdminPageLayout'
import Notification, { NotificationProps } from '@/features/admin/components/Notification/Notification'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    title: '',
    description: '',
    author: '',
    githubUsername: ''
  })
  const [originalSettings, setOriginalSettings] = useState(settings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<Omit<NotificationProps, 'onClose'> | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings)
    setHasChanges(changed)
  }, [settings, originalSettings])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/setup/config')
      if (response.ok) {
        const data = await response.json()
        const config = data.config || data
        
        const settingsData = {
          title: config.seo?.title || '',
          description: config.seo?.description || '',
          author: config.seo?.author || '',
          githubUsername: config.github?.username || ''
        }
        
        setSettings(settingsData)
        setOriginalSettings(settingsData)
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching settings:', err)
      setNotification({
        type: 'error',
        message: 'Failed to load settings'
      })
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!settings.title.trim()) {
      setNotification({
        type: 'error',
        message: 'Title is required'
      })
      return
    }

    if (!settings.author.trim()) {
      setNotification({
        type: 'error',
        message: 'Author is required'
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/setup/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seo: {
            title: settings.title,
            description: settings.description,
            author: settings.author
          },
          github: {
            username: settings.githubUsername
          }
        })
      })

      if (response.ok) {
        setOriginalSettings(settings)
        setNotification({
          type: 'success',
          message: 'Settings saved successfully!'
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (err) {
      console.error('Error saving settings:', err)
      setNotification({
        type: 'error',
        message: 'Failed to save settings. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(originalSettings)
    setNotification({
      type: 'info',
      message: 'Changes reset'
    })
  }

  return (
    <AdminPageLayout
      title="Settings"
      subtitle="Configure your portfolio settings"
      centered={false}
      maxWidth="full"
    >
      {/* Settings Form */}
      {loading ? (
        <p className="settings-page__loading">Loading settings...</p>
      ) : (
        <div className="glass-card settings-page__form">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
            className="settings-form"
          >
            {/* Portfolio Title */}
            <div className="settings-form__field">
              <label htmlFor="title" className="settings-form__label">
                Portfolio Title *
              </label>
              <input
                id="title"
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                required
                className="settings-form__input"
              />
            </div>

            {/* Portfolio Description */}
            <div className="settings-form__field">
              <label htmlFor="description" className="settings-form__label">
                Description
              </label>
              <textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={3}
                className="settings-form__textarea"
              />
            </div>

            {/* Author */}
            <div className="settings-form__field">
              <label htmlFor="author" className="settings-form__label">
                Author *
              </label>
              <input
                id="author"
                type="text"
                value={settings.author}
                onChange={(e) => setSettings({ ...settings, author: e.target.value })}
                required
                className="settings-form__input"
              />
            </div>

            {/* GitHub Username */}
            <div className="settings-form__field">
              <label htmlFor="githubUsername" className="settings-form__label">
                GitHub Username
              </label>
              <input
                id="githubUsername"
                type="text"
                value={settings.githubUsername}
                onChange={(e) => setSettings({ ...settings, githubUsername: e.target.value })}
                className="settings-form__input"
              />
            </div>
          </form>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`glass-card settings-page__actions ${!hasChanges ? 'settings-page__actions--no-changes' : ''}`}>
        <div className="settings-page__actions-status">
          {hasChanges && (
            <p className="settings-page__actions-changes">● Unsaved changes</p>
          )}
        </div>
        <div className="settings-page__actions-buttons">
          <button
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className={`settings-page__button settings-page__button--reset ${!hasChanges || saving ? 'settings-page__button--disabled' : ''}`}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`settings-page__button settings-page__button--save ${!hasChanges || saving ? 'settings-page__button--disabled' : ''} ${hasChanges && !saving ? 'settings-page__button--active' : ''}`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </AdminPageLayout>
  )
}
