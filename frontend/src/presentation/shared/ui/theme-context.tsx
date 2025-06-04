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

  const applyThemeToCssVariables = (theme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const sp = theme.style_properties;
    
    // Colors
    Object.entries(sp.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
      root.style.setProperty(`--color-${key}`, value);
    });

    // Typography
    root.style.setProperty('--theme-font-family', sp.typography.fontFamily);
    root.style.setProperty('--font-family', sp.typography.fontFamily);
    root.style.setProperty('--theme-font-size', sp.typography.fontSize);
    root.style.setProperty('--font-size-base', sp.typography.fontSize);
    root.style.setProperty('--theme-line-height', sp.typography.lineHeight);
    if (sp.typography.fontWeight) {
      root.style.setProperty('--theme-font-weight', sp.typography.fontWeight);
      root.style.setProperty('--font-weight', sp.typography.fontWeight);
    }
    if (sp.typography.fontWeightBold) {
      root.style.setProperty('--theme-font-weight-bold', sp.typography.fontWeightBold);
    }

    // Spacing
    Object.entries(sp.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--theme-spacing-${key}`, value);
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Border Radius
    Object.entries(sp.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--theme-border-radius-${key}`, value);
      root.style.setProperty(`--radius-${key}`, value);
    });

    // Shadows
    if (sp.shadow) {
      Object.entries(sp.shadow).forEach(([key, value]) => {
        root.style.setProperty(`--theme-shadow-${key}`, value);
      });
    }

    // Galaxy specific
    if (sp.galaxy) {
      Object.entries(sp.galaxy).forEach(([key, value]) => {
        root.style.setProperty(`--theme-galaxy-${key}`, value);
      });
    }

    // Set background gradient if available
    if (sp.galaxy?.backgroundGradient) {
      root.style.setProperty('--theme-background-gradient', sp.galaxy.backgroundGradient);
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