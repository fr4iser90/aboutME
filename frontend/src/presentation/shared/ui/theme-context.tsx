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

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme | null;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme | null>(initialTheme || null);
  const [isLoading, setIsLoading] = useState(!initialTheme);
  const [error, setError] = useState<Error | null>(null);

  const applyThemeToCssVariables = (theme: Theme) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const vars = resolveThemeVariables(theme.style_properties.colors);
    Object.entries(vars).forEach(([key, value]) => {
      if (value !== undefined) root.style.setProperty(key, value);
    });
  };

  const loadTheme = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await themeApi.getCurrentTheme();
      if (response.data) {
        setTheme(response.data);
        applyThemeToCssVariables(response.data);
      } else {
        console.warn('[ThemeContext] Keine Theme-Daten erhalten!');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load theme'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTheme) {
      loadTheme();
    }
    // Do NOT set theme variables again if initialTheme exists (SSR/ISR already did it)
  }, [initialTheme]);

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
