'use client'

import { useState } from 'react'
import { BaseModal } from '@/features/shared'

interface NewFileModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (filename: string, category: 'about' | 'blog' | 'projects', template: string) => void
}

const TEMPLATES = {
  about: `---
title: "About Me"
created: "${new Date().toISOString().split('T')[0]}"
updated: "${new Date().toISOString().split('T')[0]}"
---

# About Me

Write your about content here...

## Skills

- Skill 1
- Skill 2
- Skill 3

## Experience

### Job Title at Company
**Period:** 2020 - Present

Description of your experience...

## Education

### Degree
**Institution:** University Name
**Year:** 2020
`,

  blog: `---
title: "New Blog Post"
date: "${new Date().toISOString().split('T')[0]}"
author: "Your Name"
category: "general"
tags: []
featured: false
draft: true
---

# New Blog Post

Write your blog post content here...

## Introduction

Start with an engaging introduction...

## Main Content

Add your main content here...

## Conclusion

Wrap up your thoughts...
`,

  projects: `---
title: "New Project"
status: "active"
featured: false
category: "tool"
created: "${new Date().toISOString().split('T')[0]}"
updated: "${new Date().toISOString().split('T')[0]}"
layout:
  type: "grid"
  columns: 3
  aspectRatio: "auto"
screenshots: []
---

# New Project

## Description

Describe your project here...

## Features

- Feature 1
- Feature 2
- Feature 3

## Technologies

- Technology 1
- Technology 2
- Technology 3

## Links

- GitHub: [Repository URL]
- Demo: [Demo URL]
- Homepage: [Homepage URL]
`
}

export default function NewFileModal({ isOpen, onClose, onCreate }: NewFileModalProps) {
  const [filename, setFilename] = useState('')
  const [category, setCategory] = useState<'about' | 'blog' | 'projects'>('projects')
  const [error, setError] = useState('')

  const handleCreate = () => {
    // Validate filename
    if (!filename.trim()) {
      setError('Filename is required')
      return
    }

    // Sanitize filename
    const sanitized = filename
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    if (!sanitized) {
      setError('Invalid filename')
      return
    }

    // Ensure .md extension
    const finalFilename = sanitized.endsWith('.md') ? sanitized : `${sanitized}.md`

    // Get template
    const template = TEMPLATES[category]

    onCreate(finalFilename, category, template)
    
    // Reset form
    setFilename('')
    setCategory('projects')
    setError('')
    onClose()
  }

  const handleClose = () => {
    setFilename('')
    setCategory('projects')
    setError('')
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Create New File">
      <div className="new-file-modal">
        <div className="new-file-modal__content">
          <div className="new-file-modal__section">
            <label className="new-file-modal__label">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="new-file-modal__select"
              >
                <option value="projects">📁 Projects</option>
                <option value="blog">📝 Blog</option>
                <option value="about">ℹ️ About</option>
              </select>
            </label>
          </div>

          <div className="new-file-modal__section">
            <label className="new-file-modal__label">
              Filename
              <input
                type="text"
                value={filename}
                onChange={(e) => {
                  setFilename(e.target.value)
                  setError('')
                }}
                placeholder="my-new-file"
                className="new-file-modal__input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreate()
                  }
                }}
              />
              <div className="new-file-modal__hint">
                File will be created as: <code>{filename.trim() || 'filename'}{!filename.trim().endsWith('.md') && filename.trim() ? '.md' : ''}</code>
              </div>
              {error && (
                <div className="new-file-modal__error">{error}</div>
              )}
            </label>
          </div>

          <div className="new-file-modal__preview">
            <div className="new-file-modal__preview-title">Template Preview:</div>
            <pre className="new-file-modal__preview-content">
              {TEMPLATES[category].split('\n').slice(0, 10).join('\n')}...
            </pre>
          </div>
        </div>

        <div className="new-file-modal__actions">
          <button
            onClick={handleClose}
            className="new-file-modal__btn new-file-modal__btn--secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="new-file-modal__btn new-file-modal__btn--primary"
            disabled={!filename.trim()}
          >
            ✨ Create File
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

