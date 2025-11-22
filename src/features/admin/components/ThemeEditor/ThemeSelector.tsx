'use client'

interface ThemeSelectorProps {
  currentTheme: 'dark' | 'light'
  onThemeChange: (theme: 'dark' | 'light') => void
}

const themes = [
  { id: 'dark' as const, name: 'Dark', icon: '🌙', description: 'Dark theme with neon accents' },
  { id: 'light' as const, name: 'Light', icon: '☀️', description: 'Light theme with blue accents' }
]

export default function ThemeSelector({
  currentTheme,
  onThemeChange
}: ThemeSelectorProps) {
  return (
    <div className="theme-selector">
      <div className="theme-selector__grid">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`theme-selector__card ${
              currentTheme === theme.id ? 'theme-selector__card--selected' : ''
            }`}
          >
            <div className="theme-selector__icon">{theme.icon}</div>
            <div className="theme-selector__name">{theme.name}</div>
            <div className="theme-selector__description">{theme.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

