import { NextResponse } from 'next/server';
import { config } from '@/domain/shared/utils/config';

export async function GET() {
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
      return NextResponse.json({ theme: null, cssVariables: {} });
    }

    const data = await response.json();
    
    // Handle both array and single object responses
    let theme = null;
    if (Array.isArray(data)) {
      theme = data.find((t: any) => t.is_active) || null;
    } else if (typeof data === 'object' && data !== null) {
      theme = data;
    }

    if (!theme) {
      console.warn('No active theme found, using fallback');
      return NextResponse.json({ theme: null, cssVariables: {} });
    }

    // Convert theme to CSS variables
    const cssVariables = convertThemeToCssVariables(theme);

    return NextResponse.json({
      theme,
      cssVariables,
    });
  } catch (error) {
    console.error('Error loading theme server-side:', error);
    return NextResponse.json({ theme: null, cssVariables: {} });
  }
}

function convertThemeToCssVariables(theme: any) {
  const colors = theme.style_properties?.colors || {};
  const cssVariables: Record<string, string> = {};

  // Core colors
  if (colors.primary) cssVariables['--theme-primary'] = colors.primary;
  if (colors.secondary) cssVariables['--theme-secondary'] = colors.secondary;
  if (colors.accent) cssVariables['--theme-accent'] = colors.accent;
  if (colors.background) cssVariables['--theme-background'] = colors.background;
  if (colors.foreground) cssVariables['--theme-foreground'] = colors.foreground;
  if (colors.text) cssVariables['--theme-text'] = colors.text;
  if (colors.muted) cssVariables['--theme-muted'] = colors.muted;

  // Card colors
  if (colors.cardBg) cssVariables['--theme-card-bg'] = colors.cardBg;
  if (colors.cardForeground) cssVariables['--theme-card-foreground'] = colors.cardForeground;
  if (colors.cardBorder) cssVariables['--theme-card-border'] = colors.cardBorder;
  if (colors.cardShadow) cssVariables['--theme-card-shadow'] = colors.cardShadow;
  if (colors.cardTitle) cssVariables['--theme-card-title'] = colors.cardTitle;
  if (colors.cardText) cssVariables['--theme-card-text'] = colors.cardText;

  // Navbar colors
  if (colors.navbarBg) cssVariables['--theme-navbar-bg'] = colors.navbarBg;
  if (colors.navbarText) cssVariables['--theme-navbar-text'] = colors.navbarText;
  if (colors.navbarBorder) cssVariables['--theme-navbar-border'] = colors.navbarBorder;

  // Button colors
  if (colors.buttonBg) cssVariables['--theme-button-bg'] = colors.buttonBg;
  if (colors.buttonText) cssVariables['--theme-button-text'] = colors.buttonText;
  if (colors.buttonBorder) cssVariables['--theme-button-border'] = colors.buttonBorder;

  // About section colors
  if (colors.aboutTitle) cssVariables['--theme-about-title'] = colors.aboutTitle;
  if (colors.aboutText) cssVariables['--theme-about-text'] = colors.aboutText;
  if (colors.aboutListIcon) cssVariables['--theme-about-list-icon'] = colors.aboutListIcon;

  // Link colors
  if (colors.link) cssVariables['--theme-link'] = colors.link;

  return cssVariables;
} 