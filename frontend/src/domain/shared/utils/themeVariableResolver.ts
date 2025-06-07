import { ThemeColors } from '@/domain/entities/Theme';

// Einfache lighten/darken Hilfsfunktionen für hex-Farben
function lighten(hex: string, amount: number): string {
  let col = hex.replace('#', '');
  if (col.length === 3) col = col.split('').map(x => x + x).join('');
  let num = parseInt(col, 16);
  let r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  let g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  let b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
function darken(hex: string, amount: number): string {
  let col = hex.replace('#', '');
  if (col.length === 3) col = col.split('').map(x => x + x).join('');
  let num = parseInt(col, 16);
  let r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * amount));
  let g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  let b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function resolveThemeVariables(theme: ThemeColors) {
  return {
    // Core
    '--theme-primary': theme.primary,
    '--theme-secondary': theme.secondary,
    '--theme-accent': theme.accent,
    '--theme-background': theme.background,
    '--theme-foreground': theme.foreground,
    '--theme-muted': theme.muted || lighten(theme.background, 0.15),

    // Card
    '--theme-card-bg': theme.cardBg || lighten(theme.background, 0.05),
    '--theme-card-foreground': theme.cardForeground || theme.foreground,
    '--theme-card-border': theme.cardBorder || darken(theme.background, 0.1),
    '--theme-card-shadow': theme.cardShadow,
    '--theme-card-shadow-hover': theme.cardShadowHover,
    '--theme-card-border-hover': theme.cardBorderHover,
    '--theme-card-title': theme.cardTitle || theme.foreground,
    '--theme-card-text': theme.cardText || theme.foreground,
    '--theme-card-list-item': theme.cardListItem || theme.foreground,
    '--theme-card-list-icon': theme.cardListIcon || theme.primary,
    '--theme-card-list-icon-font-size': theme.cardListIconFontSize,
    '--theme-card-list-gap': theme.cardListGap,
    '--theme-card-list-item-gap': theme.cardListItemGap,
    '--theme-card-blur': theme.cardBlur,
    '--theme-card-radius': theme.cardRadius,

    // Navbar
    '--theme-navbar-bg': theme.navbarBg || darken(theme.primary, 0.1),
    '--theme-navbar-text': theme.navbarText || theme.foreground,
    '--theme-navbar-border': theme.navbarBorder || darken(theme.background, 0.2),
    '--theme-navbar-button-bg': theme.navbarButtonBg || theme.primary,
    '--theme-navbar-button-text': theme.navbarButtonText || theme.foreground,
    '--theme-navbar-button-hover-bg': theme.navbarButtonHoverBg || lighten(theme.primary, 0.1),
    '--theme-navbar-button-hover-text': theme.navbarButtonHoverText || theme.foreground,
    '--theme-navbar-link-hover-bg': theme.navbarLinkHoverBg || lighten(theme.background, 0.1),
    '--theme-navbar-link-active-bg': theme.navbarLinkActiveBg || theme.primary,
    '--theme-navbar-link-active-text': theme.navbarLinkActiveText || theme.foreground,

    // Section
    '--theme-section-link': theme.sectionLink || theme.primary,
    '--theme-section-heading': theme.sectionHeading || theme.foreground,
    '--theme-section-paragraph': theme.sectionParagraph || theme.foreground,

    // Button
    '--theme-button-bg': theme.buttonBg || theme.primary,
    '--theme-button-text': theme.buttonText || theme.foreground,
    '--theme-button-border': theme.buttonBorder || darken(theme.primary, 0.2),
    '--theme-button-shadow': theme.buttonShadow,
    '--theme-button-hover-bg': theme.buttonHoverBg || lighten(theme.primary, 0.1),
    '--theme-button-hover-text': theme.buttonHoverText || theme.foreground,

    // About/Info
    '--theme-about-image-border': theme.aboutImageBorder || theme.primary,
    '--theme-about-title': theme.aboutTitle || theme.foreground,
    '--theme-about-text': theme.aboutText || theme.foreground,
    '--theme-about-list-icon': theme.aboutListIcon || theme.primary,
    '--theme-about-list-link': theme.aboutListLink || theme.primary,
    '--theme-about-content-min-width': theme.aboutContentMinWidth,
    '--theme-about-image-box-shadow': theme.aboutImageBoxShadow,
    '--theme-about-title-font-weight': 'bold',
    '--theme-about-title-font-size': '2.5rem',
    '--theme-about-text-font-size': '1.15rem',
    '--theme-about-list-icon-font-size': '22px',
    '--theme-about-title-margin-bottom': '24px',
    '--theme-about-text-margin-bottom': '24px',
    '--theme-about-list-gap': '16px',
    '--theme-about-list-item-gap': '12px',

    // Semantic/Popover
    '--theme-semantic-card': theme.semantic_card || lighten(theme.background, 0.05),
    '--theme-semantic-card-foreground': theme.semantic_card_foreground || theme.foreground,
    '--theme-semantic-popover': theme.semantic_popover || lighten(theme.background, 0.08),
    '--theme-semantic-popover-foreground': theme.semantic_popover_foreground || theme.foreground,

    // Muted
    '--theme-muted-hover-background': theme.muted,
    '--theme-muted-foreground': theme.muted,

    // Link & Background
    '--theme-link': theme.link || theme.primary,
    '--theme-background-start': theme.backgroundStart || theme.background,
    '--theme-background-end': theme.backgroundEnd || theme.background,

    // Shadow, Border, Radius, Blur (keine Fallbacks mehr!)
    '--theme-shadow-default': theme.cardShadow,
    '--theme-shadow-sm': theme.cardShadow,
    '--theme-border-radius-default': theme.cardRadius,
    '--theme-border-radius-md': theme.cardRadius,
    '--theme-border-radius-lg': theme.cardRadius,
    '--theme-border-radius-xl': theme.cardRadius,
    '--theme-border-radius-2xl': theme.cardRadius,
    '--theme-border-radius-full': theme.cardRadius,

    // Text Gradient
    '--theme-text-gradient': theme.primary && theme.accent && theme.secondary
      ? `linear-gradient(to right, ${theme.primary}, ${theme.accent}, ${theme.secondary})`
      : undefined,
  };
} 