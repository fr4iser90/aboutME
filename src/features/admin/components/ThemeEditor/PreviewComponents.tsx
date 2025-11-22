'use client'

import React from 'react'

interface PreviewComponentsProps {
  themeConfig: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
  }
  design?: string
}

export function PreviewHeader({ themeConfig, design }: PreviewComponentsProps) {
  return (
    <div 
      className="preview-components__header" 
      style={{ color: themeConfig.text }}
    >
      <div className="preview-components__header-content">
        <div className="preview-components__logo">Portfolio</div>
        <nav className="preview-components__nav">
          <a href="#" style={{ color: themeConfig.text }}>Home</a>
          <a href="#" style={{ color: themeConfig.text }}>Projects</a>
          <a href="#" style={{ color: themeConfig.text }}>About</a>
        </nav>
      </div>
    </div>
  )
}

export function PreviewCard({ themeConfig, design }: PreviewComponentsProps) {
  return (
    <div 
      className="preview-components__card"
      style={{ color: themeConfig.text }}
    >
      <h4 className="preview-components__card-title">Card Title</h4>
      <p className="preview-components__card-text">
        This is a sample card showing how content will look with the selected theme and design.
      </p>
    </div>
  )
}

export function PreviewButtons({ themeConfig, design }: PreviewComponentsProps) {
  return (
    <div className="preview-components__buttons">
      <button
        className="preview-components__button preview-components__button--primary"
        style={{
          backgroundColor: themeConfig.primary,
          color: themeConfig.text
        }}
      >
        Primary Button
      </button>
      <button
        className="preview-components__button preview-components__button--secondary"
        style={{
          backgroundColor: themeConfig.secondary,
          color: themeConfig.text
        }}
      >
        Secondary Button
      </button>
      <button
        className="preview-components__button preview-components__button--disabled"
        style={{
          backgroundColor: themeConfig.surface,
          color: themeConfig.text,
          opacity: 0.5
        }}
        disabled
      >
        Disabled Button
      </button>
    </div>
  )
}

export function PreviewTypography({ themeConfig }: PreviewComponentsProps) {
  return (
    <div className="preview-components__typography" style={{ color: themeConfig.text }}>
      <h1 className="preview-components__heading preview-components__heading--h1">Heading 1</h1>
      <h2 className="preview-components__heading preview-components__heading--h2">Heading 2</h2>
      <h3 className="preview-components__heading preview-components__heading--h3">Heading 3</h3>
      <p className="preview-components__paragraph">
        This is a paragraph with regular text. It shows how body text will appear with the selected theme.
      </p>
      <a href="#" className="preview-components__link" style={{ color: themeConfig.primary }}>
        This is a link
      </a>
    </div>
  )
}

export function PreviewFormElements({ themeConfig }: PreviewComponentsProps) {
  return (
    <div className="preview-components__form">
      <div className="preview-components__form-field">
        <label className="preview-components__form-label" style={{ color: themeConfig.text }}>
          Input Field
        </label>
        <input
          type="text"
          className="preview-components__form-input"
          style={{
            backgroundColor: themeConfig.surface,
            color: themeConfig.text,
            borderColor: themeConfig.primary
          }}
          placeholder="Enter text..."
        />
      </div>
      <div className="preview-components__form-field">
        <label className="preview-components__form-label" style={{ color: themeConfig.text }}>
          Select Field
        </label>
        <select
          className="preview-components__form-select"
          style={{
            backgroundColor: themeConfig.surface,
            color: themeConfig.text,
            borderColor: themeConfig.primary
          }}
        >
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
      </div>
    </div>
  )
}

export default function PreviewComponents({ themeConfig, design }: PreviewComponentsProps) {
  return (
    <div className="preview-components">
      <PreviewHeader themeConfig={themeConfig} />
      <div className="preview-components__content">
        <PreviewCard themeConfig={themeConfig} design={design} />
        <PreviewButtons themeConfig={themeConfig} />
        <PreviewTypography themeConfig={themeConfig} />
        <PreviewFormElements themeConfig={themeConfig} />
      </div>
    </div>
  )
}

