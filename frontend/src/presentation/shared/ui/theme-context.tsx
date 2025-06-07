'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, themeApi } from '@/domain/shared/utils/themeApi';

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
    const sp = theme.style_properties;

    // Farben (ALLE relevanten Felder aus dem Theme-Objekt)
    const c = sp.colors;
    root.style.setProperty('--theme-primary', c.primary);
    root.style.setProperty('--theme-secondary', c.secondary);
    root.style.setProperty('--theme-accent', c.accent);
    root.style.setProperty('--theme-body-background-start', c.backgroundStart || c.background);
    root.style.setProperty('--theme-body-background-end', c.backgroundEnd || c.background);
    root.style.setProperty('--theme-body-foreground', c.text);
    root.style.setProperty('--background', c.background);
    root.style.setProperty('--card-bg', c.cardBg);
    root.style.setProperty('--card-border', c.cardBorder);
    root.style.setProperty('--card-shadow', c.cardShadow);
    root.style.setProperty('--card-title-color', c.cardTitle);
    root.style.setProperty('--card-text-color', c.cardText);
    root.style.setProperty('--card-list-item-color', c.cardListItem);
    root.style.setProperty('--card-list-icon-color', c.cardListIcon);
    root.style.setProperty('--navbar-background', c.navbarBg);
    root.style.setProperty('--navbar-link-color', c.navbarText);
    root.style.setProperty('--navbar-border', c.navbarBorder);
    root.style.setProperty('--navbar-button-bg', c.navbarButtonBg);
    root.style.setProperty('--navbar-button-color', c.navbarButtonText);
    root.style.setProperty('--navbar-button-hover-bg', c.navbarButtonHoverBg);
    root.style.setProperty('--navbar-button-hover-color', c.navbarButtonHoverText);
    root.style.setProperty('--navbar-link-hover-bg', c.navbarLinkHoverBg);
    root.style.setProperty('--navbar-link-active-bg', c.navbarLinkActiveBg);
    root.style.setProperty('--navbar-link-active-color', c.navbarLinkActiveText);
    root.style.setProperty('--section-link-color', c.sectionLink || c.link);
    root.style.setProperty('--section-heading-color', c.sectionHeading);
    root.style.setProperty('--section-paragraph-color', c.sectionParagraph);
    root.style.setProperty('--button-bg', c.buttonBg);
    root.style.setProperty('--button-text', c.buttonText);
    root.style.setProperty('--button-border', c.buttonBorder);
    root.style.setProperty('--button-shadow', c.buttonShadow);
    root.style.setProperty('--button-hover-bg', c.buttonHoverBg);
    root.style.setProperty('--button-hover-text', c.buttonHoverText);
    root.style.setProperty('--about-image-border', c.aboutImageBorder);
    root.style.setProperty('--about-title-color', c.aboutTitle);
    root.style.setProperty('--about-text-color', c.aboutText);
    root.style.setProperty('--about-list-icon-color', c.aboutListIcon);
    root.style.setProperty('--about-list-link-color', c.aboutListLink);
    root.style.setProperty('--about-content-min-width', c.aboutContentMinWidth);
    root.style.setProperty('--about-image-box-shadow', c.aboutImageBoxShadow);
    root.style.setProperty('--theme-semantic-card', c.semantic_card || c.card);
    root.style.setProperty('--theme-semantic-card-foreground', c.semantic_card_foreground || c.cardForeground);
    root.style.setProperty('--theme-semantic-popover', c.semantic_popover || c.popover);
    root.style.setProperty('--theme-semantic-popover-foreground', c.semantic_popover_foreground || c.popoverForeground);

    // Typography
    const t = sp.typography;
    root.style.setProperty('--font-family', t.fontFamily);
    root.style.setProperty('--font-size-base', t.fontSize);
    root.style.setProperty('--theme-line-height', t.lineHeight);
    root.style.setProperty('--about-title-font-weight', t.aboutTitleFontWeight);
    root.style.setProperty('--about-title-font-size', t.aboutTitleFontSize);
    root.style.setProperty('--about-text-font-size', t.aboutTextFontSize);
    root.style.setProperty('--about-list-icon-font-size', t.aboutListIconFontSize);

    // Spacing
    const s = sp.spacing;
    root.style.setProperty('--about-section-padding', s.sectionPadding);
    root.style.setProperty('--about-container-gap', s.containerGap);
    root.style.setProperty('--about-container-max-width', s.containerMaxWidth);
    root.style.setProperty('--about-container-padding', s.containerPadding);
    root.style.setProperty('--about-title-margin-bottom', s.aboutTitleMarginBottom);
    root.style.setProperty('--about-text-margin-bottom', s.aboutTextMarginBottom);
    root.style.setProperty('--about-list-gap', s.aboutListGap);
    root.style.setProperty('--about-list-item-gap', s.aboutListItemGap);

    // Border Radius
    const br = sp.borderRadius;
    root.style.setProperty('--about-image-border-radius', br.aboutImage);

    // Box Shadow
    const sh = sp.shadows;
    root.style.setProperty('--about-image-box-shadow', sh.card);

    // Hintergrund (RGB für Gradient, falls nötig)
    if (c.backgroundStart) {
      const rgbStart = hexToRgb(c.backgroundStart);
      if (rgbStart) root.style.setProperty('--background-start-rgb', rgbStart);
      root.style.setProperty('--theme-body-background-start', c.backgroundStart);
    }
    if (c.backgroundEnd) {
      const rgbEnd = hexToRgb(c.backgroundEnd);
      if (rgbEnd) root.style.setProperty('--background-end-rgb', rgbEnd);
      root.style.setProperty('--theme-body-background-end', c.backgroundEnd);
    }
    if (c.text) root.style.setProperty('--theme-body-foreground', c.text);

    // Buttons (alle Varianten)
    root.style.setProperty('--button-bg', c.buttonBg);
    root.style.setProperty('--button-text', c.buttonText);
    root.style.setProperty('--button-border', c.buttonBorder);
    root.style.setProperty('--button-shadow', c.buttonShadow);
    root.style.setProperty('--button-hover-bg', c.buttonHoverBg);
    root.style.setProperty('--button-hover-text', c.buttonHoverText);

    // Cards & Skills-Section
    root.style.setProperty('--card-blur', sp.cardBlur);
    root.style.setProperty('--card-radius', sp.cardRadius);
    root.style.setProperty('--card-shadow-hover', c.cardShadowHover);
    root.style.setProperty('--card-border-hover', c.cardBorderHover);
    root.style.setProperty('--card-list-gap', sp.cardListGap);
    root.style.setProperty('--card-list-item-gap', sp.cardListItemGap);
    root.style.setProperty('--card-list-item-color', c.cardListItem);
    root.style.setProperty('--card-list-icon-color', c.cardListIcon);
    root.style.setProperty('--card-list-icon-font-size', sp.cardListIconFontSize);

    // Text-Gradient für Brand/Logo (aus Theme-Farben)
    root.style.setProperty('--text-gradient', `linear-gradient(to right, ${c.primary}, ${c.accent}, ${c.secondary})`);

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
