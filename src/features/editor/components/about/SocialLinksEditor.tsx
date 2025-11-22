'use client'

import { type AboutSocialLinks } from '../../types/about'

interface SocialLinksEditorProps {
  socialLinks: AboutSocialLinks
  onChange: (socialLinks: AboutSocialLinks) => void
}

export default function SocialLinksEditor({ socialLinks, onChange }: SocialLinksEditorProps) {
  const handleChange = (key: keyof AboutSocialLinks, value: string) => {
    onChange({
      ...socialLinks,
      [key]: value || null
    })
  }

  return (
    <div className="about-social-links-editor">
      <h3 className="about-social-links-editor__title">Social Links</h3>
      <div className="about-social-links-editor__fields">
        <div className="about-social-links-editor__field">
          <label className="about-social-links-editor__label">
            <input
              type="checkbox"
              checked={!!socialLinks.github}
              onChange={(e) => handleChange('github', e.target.checked ? '' : '')}
              className="about-social-links-editor__checkbox"
            />
            GitHub
          </label>
          {socialLinks.github !== null && (
            <input
              type="url"
              value={socialLinks.github || ''}
              onChange={(e) => handleChange('github', e.target.value)}
              className="about-social-links-editor__input"
              placeholder="https://github.com/username"
            />
          )}
        </div>

        <div className="about-social-links-editor__field">
          <label className="about-social-links-editor__label">
            <input
              type="checkbox"
              checked={!!socialLinks.twitter}
              onChange={(e) => handleChange('twitter', e.target.checked ? '' : '')}
              className="about-social-links-editor__checkbox"
            />
            Twitter/X
          </label>
          {socialLinks.twitter !== null && (
            <input
              type="url"
              value={socialLinks.twitter || ''}
              onChange={(e) => handleChange('twitter', e.target.value)}
              className="about-social-links-editor__input"
              placeholder="https://twitter.com/username"
            />
          )}
        </div>

        <div className="about-social-links-editor__field">
          <label className="about-social-links-editor__label">
            <input
              type="checkbox"
              checked={!!socialLinks.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.checked ? '' : '')}
              className="about-social-links-editor__checkbox"
            />
            LinkedIn
          </label>
          {socialLinks.linkedin !== null && (
            <input
              type="url"
              value={socialLinks.linkedin || ''}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              className="about-social-links-editor__input"
              placeholder="https://linkedin.com/in/username"
            />
          )}
        </div>

        <div className="about-social-links-editor__field">
          <label className="about-social-links-editor__label">
            <input
              type="checkbox"
              checked={!!socialLinks.website}
              onChange={(e) => handleChange('website', e.target.checked ? '' : '')}
              className="about-social-links-editor__checkbox"
            />
            Website
          </label>
          {socialLinks.website !== null && (
            <input
              type="url"
              value={socialLinks.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              className="about-social-links-editor__input"
              placeholder="https://yourwebsite.com"
            />
          )}
        </div>

        <div className="about-social-links-editor__field">
          <label className="about-social-links-editor__label">
            <input
              type="checkbox"
              checked={!!socialLinks.email}
              onChange={(e) => handleChange('email', e.target.checked ? '' : '')}
              className="about-social-links-editor__checkbox"
            />
            Email
          </label>
          {socialLinks.email !== null && (
            <input
              type="email"
              value={socialLinks.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="about-social-links-editor__input"
              placeholder="your@email.com"
            />
          )}
        </div>
      </div>
    </div>
  )
}

