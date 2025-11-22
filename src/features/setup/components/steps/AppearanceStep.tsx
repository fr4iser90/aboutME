/**
 * Appearance Step Component
 * 
 * Step 7: Configure design, theme, and display mode with preview
 */

'use client';

import { useState, useEffect } from 'react';

interface AppearanceStepProps {
  config: {
    appearance?: {
      design?: string;
      theme?: string;
      displayMode?: string;
      useDesignDefaults?: boolean;
    };
  };
  onUpdate: (appearance: {
    design: string;
    theme: string;
    displayMode: string;
    useDesignDefaults: boolean;
  }) => void;
}

export default function AppearanceStep({ config, onUpdate }: AppearanceStepProps) {
  const [design, setDesign] = useState(config.appearance?.design || 'glassmorphism');
  const [theme, setTheme] = useState(config.appearance?.theme || 'dark');
  const [displayMode, setDisplayMode] = useState(config.appearance?.displayMode || 'portfolio');
  const [useDesignDefaults, setUseDesignDefaults] = useState(
    config.appearance?.useDesignDefaults ?? true
  );

  useEffect(() => {
    onUpdate({
      design,
      theme,
      displayMode,
      useDesignDefaults,
    });
  }, [design, theme, displayMode, useDesignDefaults, onUpdate]);

  const designs = [
    { value: 'glassmorphism', label: 'Glassmorphism' },
    { value: 'flat', label: 'Flat' },
    { value: 'minimal', label: 'Minimal' },
  ];

  const themes = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'ocean', label: 'Ocean' },
    { value: 'sunset', label: 'Sunset' },
  ];

  const displayModes = [
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'magazine', label: 'Magazine' },
    { value: 'minimal', label: 'Minimal' },
  ];

  return (
    <div className="glass-card setup-page__form">
      <h3 className="setup-page__form-title">🎨 Appearance</h3>
      <p className="setup-page__form-description">
        Configure how your portfolio looks and feels
      </p>

      <div className="setup-form">
        <div className="setup-form__field">
          <label className="setup-form__label">Design</label>
          <select
            className="setup-form__select"
            value={design}
            onChange={(e) => setDesign(e.target.value)}
          >
            {designs.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="setup-form__field">
          <label className="setup-form__label">Theme</label>
          <select
            className="setup-form__select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {themes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="setup-form__field">
          <label className="setup-form__label">Display Mode</label>
          <select
            className="setup-form__select"
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value)}
          >
            {displayModes.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="setup-form__field">
          <label className="setup-form__checkbox-label">
            <input
              type="checkbox"
              checked={useDesignDefaults}
              onChange={(e) => setUseDesignDefaults(e.target.checked)}
            />
            <span>Use Design Defaults</span>
          </label>
        </div>

        {/* Preview Window Placeholder */}
        <div className="setup-form__field">
          <div className="setup-form__preview-window">
            <h4>Preview</h4>
            <p className="setup-form__hint">
              Preview will show how your portfolio looks with real project data
            </p>
            <div className="setup-form__preview-placeholder">
              <p>Design: {design} | Theme: {theme} | Mode: {displayMode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

