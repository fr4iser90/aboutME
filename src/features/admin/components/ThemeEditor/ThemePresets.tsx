'use client'

import { THEME_PRESETS } from '@/features/shared/utils/themePresets'
import { applyThemeDesign, type DesignType, type ThemeType } from '@/features/shared/utils/themeDesign'

type Props = {
  onApply?: (theme: string, design: string) => void
}

/** Quick-apply curated theme presets (Minimal / Terminal / Editorial). */
export default function ThemePresets({ onApply }: Props) {
  const apply = (theme: string, design: string) => {
    applyThemeDesign(theme as ThemeType, design as DesignType)
    try {
      localStorage.setItem('portfolio-theme', theme)
      localStorage.setItem('portfolio-design', design)
    } catch {
      /* ignore */
    }
    onApply?.(theme, design)
  }

  return (
    <div className="appearance-editor__section">
      <h2 className="appearance-editor__section-title">Theme presets</h2>
      <p className="text-sm opacity-70 mb-3">
        Three curated looks. Full design library remains available below.
      </p>
      <div className="flex flex-wrap gap-2">
        {THEME_PRESETS.map((pack) => (
          <button
            key={pack.id}
            type="button"
            className="appearance-editor__btn appearance-editor__btn--apply"
            title={pack.description}
            onClick={() => apply(pack.theme, pack.design)}
          >
            {pack.label}
          </button>
        ))}
      </div>
    </div>
  )
}
