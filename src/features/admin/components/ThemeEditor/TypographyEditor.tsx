'use client'

import { useState } from 'react'

const fontFamilies = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Raleway'
]

const fontSizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
]

const fontWeights = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'bold', label: 'Bold' }
]

export default function TypographyEditor() {
  const [fontFamily, setFontFamily] = useState('Inter')
  const [fontSize, setFontSize] = useState('medium')
  const [fontWeight, setFontWeight] = useState('normal')
  const [lineHeight, setLineHeight] = useState(1.5)

  return (
    <div className="typography-editor">
      <div className="typography-editor__grid">
        <label className="typography-editor__label">
          Font Family:
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="typography-editor__select"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>

        <label className="typography-editor__label">
          Font Size:
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="typography-editor__select"
          >
            {fontSizes.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </label>

        <label className="typography-editor__label">
          Font Weight:
          <select
            value={fontWeight}
            onChange={(e) => setFontWeight(e.target.value)}
            className="typography-editor__select"
          >
            {fontWeights.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </label>

        <label className="typography-editor__label">
          Line Height:
          <input
            type="number"
            value={lineHeight}
            onChange={(e) => setLineHeight(parseFloat(e.target.value) || 1.5)}
            className="typography-editor__input"
            min="1"
            max="3"
            step="0.1"
          />
        </label>
      </div>

      <div className="typography-editor__preview">
        <h3 className="typography-editor__preview-title">Preview</h3>
        <div
          className="typography-editor__preview-text"
          style={{
            fontFamily,
            fontSize: fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px',
            fontWeight,
            lineHeight
          }}
        >
          The quick brown fox jumps over the lazy dog. 1234567890
        </div>
      </div>
    </div>
  )
}

