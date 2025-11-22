'use client'

interface ThemeConfig {
  name: string
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
}

interface ColorPickerProps {
  themeConfig: ThemeConfig
  onColorChange: (colorKey: keyof ThemeConfig, value: string) => void
}

const colorFields: Array<{ key: keyof ThemeConfig; label: string; description: string }> = [
  { key: 'primary', label: 'Primary Color', description: 'Main accent color' },
  { key: 'secondary', label: 'Secondary Color', description: 'Secondary accent color' },
  { key: 'background', label: 'Background Color', description: 'Main background color' },
  { key: 'surface', label: 'Surface Color', description: 'Card and surface color' },
  { key: 'text', label: 'Text Color', description: 'Main text color' }
]

export default function ColorPicker({
  themeConfig,
  onColorChange
}: ColorPickerProps) {
  return (
    <div className="color-picker">
      <div className="color-picker__grid">
        {colorFields.map((field) => (
          <div key={field.key} className="color-picker__item">
            <label className="color-picker__label">
              <span className="color-picker__label-text">{field.label}</span>
              <span className="color-picker__description">{field.description}</span>
              <div className="color-picker__input-group">
                <input
                  type="color"
                  value={themeConfig[field.key]}
                  onChange={(e) => onColorChange(field.key, e.target.value)}
                  className="color-picker__color-input"
                />
                <input
                  type="text"
                  value={themeConfig[field.key]}
                  onChange={(e) => onColorChange(field.key, e.target.value)}
                  className="color-picker__text-input"
                  placeholder="#000000"
                />
              </div>
            </label>
            <div
              className="color-picker__preview"
              style={{ backgroundColor: themeConfig[field.key] }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

