'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '@/domain/entities/Theme';
import { themeApi } from '@/domain/shared/utils/themeApi';
import { resolveThemeVariables } from '@/domain/shared/utils/themeVariableResolver';

interface ThemeContextType {
  theme: Theme | null;
  isLoading: boolean;
  error: Error | null;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const applyThemeToCssVariables = (theme: import('@/domain/shared/utils/themeApi').Theme) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const vars = resolveThemeVariables(theme.style_properties.colors);
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Farben (ALLE relevanten Felder aus dem Theme-Objekt)
    const sp = theme.style_properties;
    const c = sp.colors;
    root.style.setProperty('--theme-primary', c.primary || '#3B82F6');
    root.style.setProperty('--theme-secondary', c.secondary || '#10B981');
    root.style.setProperty('--theme-accent', c.accent || '#007bff');
    root.style.setProperty('--theme-body-background-start', c.backgroundStart || c.background || 'rgb(2, 6, 23)');
    root.style.setProperty('--theme-body-background-end', c.backgroundEnd || c.background || 'rgb(15, 23, 42)');
    root.style.setProperty('--theme-body-foreground', c.text || c.foreground || '#fff');
    root.style.setProperty('--theme-background', c.background || 'rgb(2, 6, 23)');
    root.style.setProperty('--theme-card-bg', c.cardBg || 'rgba(30,41,59,0.5)');
    root.style.setProperty('--theme-card-border', c.cardBorder || '#a78bfa33');
    root.style.setProperty('--theme-card-shadow', c.cardShadow || '0 4px 24px rgba(167,139,250,0.1)');
    root.style.setProperty('--theme-card-title-color', c.cardTitle || '#fff');
    root.style.setProperty('--theme-card-text-color', c.cardText || '#b0b0b0');
    root.style.setProperty('--theme-card-list-item-color', c.cardListItem || '#b0b0b0');
    root.style.setProperty('--theme-card-list-icon-color', c.cardListIcon || '#a78bfa');
    root.style.setProperty('--theme-navbar-background', c.navbarBg || '#020617');
    root.style.setProperty('--theme-navbar-link-color', c.navbarText || '#b0b0b0');
    root.style.setProperty('--theme-navbar-border', c.navbarBorder || '1px solid #e5e7eb');
    root.style.setProperty('--theme-navbar-button-bg', c.navbarButtonBg || '#010971');
    root.style.setProperty('--theme-navbar-button-color', c.navbarButtonText || '#fff');
    root.style.setProperty('--theme-navbar-button-hover-bg', c.navbarButtonHoverBg || '#a78bfa');
    root.style.setProperty('--theme-navbar-button-hover-color', c.navbarButtonHoverText || '#fff');
    root.style.setProperty('--theme-navbar-link-hover-bg', c.navbarLinkHoverBg || '#7c3aed33');
    root.style.setProperty('--theme-navbar-link-active-bg', c.navbarLinkActiveBg || '#7c3aed');
    root.style.setProperty('--theme-navbar-link-active-color', c.navbarLinkActiveText || '#fff');
    root.style.setProperty('--theme-section-link-color', c.sectionLink || c.link || '#a78bfa');
    root.style.setProperty('--theme-section-heading-color', c.sectionHeading || '#fff');
    root.style.setProperty('--theme-section-paragraph-color', c.sectionParagraph || '#b0b0b0');
    root.style.setProperty('--theme-button-bg', c.buttonBg || '#3B82F6');
    root.style.setProperty('--theme-button-text', c.buttonText || '#fff');
    root.style.setProperty('--theme-button-border', c.buttonBorder || 'none');
    root.style.setProperty('--theme-button-shadow', c.buttonShadow || '0 1px 2px 0 rgb(0 0 0 / 0.05)');
    root.style.setProperty('--theme-button-hover-bg', c.buttonHoverBg || '#2563eb');
    root.style.setProperty('--theme-button-hover-text', c.buttonHoverText || '#fff');
    root.style.setProperty('--theme-about-image-border', c.aboutImageBorder || '#a78bfa');
    root.style.setProperty('--theme-about-title-color', c.aboutTitle || '#fff');
    root.style.setProperty('--theme-about-text-color', c.aboutText || '#b0b0b0');
    root.style.setProperty('--theme-about-list-icon-color', c.aboutListIcon || '#a78bfa');
    root.style.setProperty('--theme-about-list-link-color', c.aboutListLink || '#a78bfa');
    root.style.setProperty('--theme-about-content-min-width', c.aboutContentMinWidth || '280px');
    root.style.setProperty('--theme-about-image-box-shadow', c.aboutImageBoxShadow || '0 4px 24px rgba(0,0,0,0.10)');
    root.style.setProperty('--theme-semantic-card', c.semantic_card || c.cardBg || '#fff');
    root.style.setProperty('--theme-semantic-card-foreground', c.semantic_card_foreground || c.cardForeground || '#020617');
    root.style.setProperty('--theme-semantic-popover', c.semantic_popover || '#fff');
    root.style.setProperty('--theme-semantic-popover-foreground', c.semantic_popover_foreground || '#020617');

    // Typography
    const t = sp.typography || {};
    root.style.setProperty('--theme-font-family', t.fontFamily || 'system-ui, -apple-system, sans-serif');
    root.style.setProperty('--theme-font-size-base', t.fontSize || '1rem');
    root.style.setProperty('--theme-line-height', t.lineHeight || '1.25rem');
    root.style.setProperty('--theme-about-title-font-weight', t.aboutTitleFontWeight || 'bold');
    root.style.setProperty('--theme-about-title-font-size', t.aboutTitleFontSize || '2.5rem');
    root.style.setProperty('--theme-about-text-font-size', t.aboutTextFontSize || '1.15rem');
    root.style.setProperty('--theme-about-list-icon-font-size', t.aboutListIconFontSize || '22px');

    // Spacing
    const s = sp.spacing || {};
    root.style.setProperty('--theme-about-section-padding', s.sectionPadding || '2rem');
    root.style.setProperty('--theme-about-container-gap', s.containerGap || '1.5rem');
    root.style.setProperty('--theme-about-container-max-width', s.containerMaxWidth || '1024px');
    root.style.setProperty('--theme-about-container-padding', s.containerPadding || '1rem');
    root.style.setProperty('--theme-about-title-margin-bottom', s.aboutTitleMarginBottom || '2rem');
    root.style.setProperty('--theme-about-text-margin-bottom', s.aboutTextMarginBottom || '1.5rem');
    root.style.setProperty('--theme-about-list-gap', s.aboutListGap || '16px');
    root.style.setProperty('--theme-about-list-item-gap', s.aboutListItemGap || '12px');

    // Border Radius
    const br = sp.borderRadius || {};
    root.style.setProperty('--theme-about-image-border-radius', br.aboutImage || '1rem');

    // Box Shadow
    const sh = sp.shadows || {};
    root.style.setProperty('--theme-about-image-box-shadow', sh.card || '0 4px 24px rgba(0,0,0,0.10)');

    // Cards & Skills-Section
    root.style.setProperty('--theme-card-blur', sp.cardBlur || '4px');
    root.style.setProperty('--theme-card-radius', sp.cardRadius || '1rem');
    root.style.setProperty('--theme-card-shadow-hover', c.cardShadowHover || '0 4px 24px rgba(167,139,250,0.2)');
    root.style.setProperty('--theme-card-border-hover', c.cardBorderHover || '#a78bfa55');
    root.style.setProperty('--theme-card-list-gap', sp.cardListGap || '16px');
    root.style.setProperty('--theme-card-list-item-gap', sp.cardListItemGap || '12px');
    root.style.setProperty('--theme-card-list-item-color', c.cardListItem || '#b0b0b0');
    root.style.setProperty('--theme-card-list-icon-color', c.cardListIcon || '#a78bfa');
    root.style.setProperty('--theme-card-list-icon-font-size', sp.cardListIconFontSize || '22px');

    // Text-Gradient für Brand/Logo (aus Theme-Farben)
    root.style.setProperty('--theme-text-gradient', `linear-gradient(to right, ${c.primary || '#a78bfa'}, ${c.accent || '#f472b6'}, ${c.secondary || '#60a5fa'})`);

    // Hilfsfunktion für Hex zu RGB
    function hexToRgb(hex: string): string | null {
      // Entferne # falls vorhanden
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
      }
      if (hex.length !== 6) return null;
      const num = parseInt(hex, 16);
      return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    }
  };

  const loadTheme = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await themeApi.getCurrentTheme();
      console.log('[ThemeContext] API Response:', response);
      if (response.data) {
        console.log('[ThemeContext] Aktives Theme:', response.data);
        setTheme(response.data);
        applyThemeToCssVariables(response.data);
      } else {
        console.warn('[ThemeContext] Keine Theme-Daten erhalten!');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load theme'));
      console.error('[ThemeContext] Fehler beim Laden des Themes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const value = {
    theme,
    isLoading,
    error,
    refreshTheme: loadTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
