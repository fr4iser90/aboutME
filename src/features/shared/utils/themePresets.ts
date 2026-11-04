/**
 * Curated theme presets — 3 recommended theme+design combinations.
 */
export const THEME_PRESETS = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean dark portfolio',
    theme: 'dark',
    design: 'minimal',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    description: 'Glass / neon developer look',
    theme: 'dark',
    design: 'glassmorphism',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Light, content-first',
    theme: 'light',
    design: 'clean',
  },
] as const

export type ThemePresetId = (typeof THEME_PRESETS)[number]['id']

export function getThemePreset(id: string) {
  return THEME_PRESETS.find((t) => t.id === id) || THEME_PRESETS[0]
}
