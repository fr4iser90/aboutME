import { Theme } from '@/domain/entities/Theme';
import { resolveThemeVariables } from './themeVariableResolver';
import { config } from './config';

export interface ServerTheme {
  theme: Theme | null;
  cssVariables: Record<string, string>;
}

export async function getCurrentTheme(): Promise<ServerTheme> {
  try {
    // Fetch theme from backend API
    const response = await fetch(`${config.backendUrl}/api/public/themes`, {
      cache: 'no-store', // Always fetch fresh theme data
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch theme from backend, using fallback');
      return { theme: null, cssVariables: {} };
    }

    const data = await response.json();
    
    // Handle both array and single object responses
    let theme: Theme | null = null;
    if (Array.isArray(data)) {
      theme = data.find((t: any) => t.is_active) || null;
    } else if (typeof data === 'object' && data !== null) {
      theme = data;
    }

    if (!theme) {
      console.warn('No active theme found, using fallback');
      return { theme: null, cssVariables: {} };
    }

    // Convert theme to CSS variables and filter out undefined values
    const rawCssVariables = resolveThemeVariables(theme.style_properties.colors);
    const cssVariables: Record<string, string> = {};
    
    Object.entries(rawCssVariables).forEach(([key, value]) => {
      if (value !== undefined) {
        cssVariables[key] = value;
      }
    });

    return {
      theme,
      cssVariables,
    };
  } catch (error) {
    console.error('Error loading theme server-side:', error);
    return { theme: null, cssVariables: {} };
  }
} 