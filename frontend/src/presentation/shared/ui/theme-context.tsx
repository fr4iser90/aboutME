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

  const applyThemeToCssVariables = (theme: Theme) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    console.log('[ThemeContext] Eingehendes Theme-Objekt:', theme);
    console.log('[ThemeContext] style_properties.colors:', theme.style_properties.colors);
    const vars = resolveThemeVariables(theme.style_properties.colors);
    console.log('[ThemeContext] Resolver Output:', vars);
    Object.entries(vars).forEach(([key, value]) => {
      if (value !== undefined) root.style.setProperty(key, value);
    });
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
