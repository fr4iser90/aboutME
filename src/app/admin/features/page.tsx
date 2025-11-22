'use client'

import { useState, useEffect } from 'react'
import AdminPageLayout from '@/features/admin/components/AdminPageLayout'
import FeatureManager from '@/features/admin/components/FeatureManager/FeatureManager'
import Notification, { NotificationProps } from '@/features/admin/components/Notification/Notification'

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Record<string, boolean>>({})
  const [originalFeatures, setOriginalFeatures] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<Omit<NotificationProps, 'onClose'> | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchFeatures()
  }, [])

  useEffect(() => {
    const changed = JSON.stringify(features) !== JSON.stringify(originalFeatures)
    setHasChanges(changed)
  }, [features, originalFeatures])

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/setup/config')
      if (response.ok) {
        const data = await response.json()
        const config = data.config || data
        
        const featureMap = {
          projects: config.features?.projects?.enabled !== false,
          skills: config.features?.skills?.enabled !== false,
          aboutMe: config.features?.aboutMe?.enabled !== false,
          blog: config.features?.blog?.enabled === true,
          contact: config.features?.contact?.enabled === true,
          auth: config.features?.auth?.enabled === true,
          editor: config.features?.editor?.enabled === true,
          fileUpload: config.features?.fileUpload?.enabled === true,
          guestbook: config.features?.guestbook?.enabled === true,
          terminal: config.features?.terminal?.enabled === true,
          hero: config.portfolio?.features?.hero?.enabled !== false,
          header: config.portfolio?.features?.header?.enabled !== false,
          footer: config.portfolio?.features?.footer?.enabled !== false,
          theme: config.portfolio?.features?.theme?.enabled !== false
        }
        
        setFeatures(featureMap)
        setOriginalFeatures(featureMap)
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching features:', err)
      setNotification({
        type: 'error',
        message: 'Failed to load features'
      })
      setLoading(false)
    }
  }

  const handleFeatureChange = (featureName: string, enabled: boolean) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: enabled
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/setup/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          features: {
            projects: { enabled: features.projects },
            skills: { enabled: features.skills },
            aboutMe: { enabled: features.aboutMe },
            blog: { enabled: features.blog },
            contact: { enabled: features.contact },
            auth: { enabled: features.auth },
            editor: { enabled: features.editor },
            fileUpload: { enabled: features.fileUpload },
            guestbook: { enabled: features.guestbook },
            terminal: { enabled: features.terminal }
          },
          portfolio: {
            features: {
              hero: { enabled: features.hero },
              header: { enabled: features.header },
              footer: { enabled: features.footer },
              theme: { enabled: features.theme }
            }
          }
        })
      })

      if (response.ok) {
        setOriginalFeatures(features)
        setNotification({
          type: 'success',
          message: 'Features updated successfully!'
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (err) {
      console.error('Error saving features:', err)
      setNotification({
        type: 'error',
        message: 'Failed to save features. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFeatures(originalFeatures)
    setNotification({
      type: 'info',
      message: 'Changes reset'
    })
  }

  return (
    <AdminPageLayout
      title="Feature Management"
      subtitle="Enable or disable portfolio features. All features are toggleable."
      centered={false}
      maxWidth="full"
    >
      {/* Feature Manager */}
      {loading ? (
        <p className="features-page__loading">Loading features...</p>
      ) : (
        <FeatureManager 
          features={features}
          onChange={handleFeatureChange}
        />
      )}

      {/* Action Buttons */}
      <div className={`glass-card features-page__actions ${!hasChanges ? 'features-page__actions--no-changes' : ''}`}>
        <div className="features-page__actions-status">
          {hasChanges && (
            <p className="features-page__actions-changes">● Unsaved changes</p>
          )}
        </div>
        <div className="features-page__actions-buttons">
          <button
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className={`features-page__button features-page__button--reset ${!hasChanges || saving ? 'features-page__button--disabled' : ''}`}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`features-page__button features-page__button--save ${!hasChanges || saving ? 'features-page__button--disabled' : ''} ${hasChanges && !saving ? 'features-page__button--active' : ''}`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
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
