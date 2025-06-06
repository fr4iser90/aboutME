import { ApiResponse, BaseApiClient } from './baseApiClient';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  navbarBg: string;
  navbarText: string;
  navbarBorder: string;
  navbarButtonBg: string;
  navbarButtonText: string;
  navbarButtonHoverBg: string;
  navbarButtonHoverText: string;
  navbarLinkHoverBg: string;
  navbarLinkActiveBg: string;
  navbarLinkActiveText: string;
  link: string;
  aboutImageBorder: string;
  aboutTitle: string;
  aboutText: string;
  aboutListIcon: string;
  aboutListLink: string;
  backgroundStart: string;
  backgroundEnd: string;
  cardTitle: string;
  cardText: string;
  cardListItem: string;
  cardListIcon: string;
  sectionLink: string;
  sectionHeading: string;
  sectionParagraph: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
  buttonShadow: string;
  buttonHoverBg: string;
  buttonHoverText: string;
  aboutContentMinWidth: string;
  aboutImageBoxShadow: string;
  cardShadowHover: string;
  cardBorderHover: string;
  success: string;
  successForeground: string;
  successHoverBackground: string;
  warning: string;
  warningForeground: string;
  warningHoverBackground: string;
  mutedHoverBackground: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontWeightBold: string;
  lineHeight: string;
  navbarFontSize: string;
  navbarFontWeight: string;
  cardTitleFontSize: string;
  cardTextFontSize: string;
  aboutTitleFontSize: string;
  aboutTitleFontWeight: string;
  aboutTextFontSize: string;
  aboutListIconFontSize: string;
}

export interface ThemeSpacing {
  small: string;
  medium: string;
  large: string;
  sectionPadding: string;
  containerGap: string;
  containerMaxWidth: string;
  containerPadding: string;
  navbarPadding: string;
  navbarHeight: string;
  navbarLinkPadding: string;
  navbarButtonPadding: string;
  cardPadding: string;
  aboutTitleMarginBottom: string;
  aboutTextMarginBottom: string;
  aboutListGap: string;
  aboutListItemGap: string;
}

export interface ThemeBorderRadius {
  small: string;
  medium: string;
  large: string;
  full: string;
  navbar: string;
  card: string;
  button: string;
  aboutImage: string;
}

export interface ThemeShadows {
  card: string;
  cardHover: string;
  button: string;
}

export interface ThemeStyleProperties {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  navbar?: any;
  card?: any;
  about?: any;
  cardBlur?: string;
  cardRadius?: string;
  cardListGap?: string;
  cardListItemGap?: string;
  cardListIconFontSize?: string;
}

export interface Theme {
  id?: number;
  name: string;
  description: string;
  style_properties: ThemeStyleProperties;
  is_active?: boolean;
  is_visible?: boolean;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

const api = new BaseApiClient();

export const themeApi = {
  async getCurrentTheme(): Promise<ApiResponse<Theme>> {
    const response = await api.request<any>('/api/public/themes', { method: 'GET' });
    console.log('[themeApi] Raw API Response:', response);

    // Wenn die Antwort ein Array ist, nimm das mit is_active: true
    if (Array.isArray(response.data)) {
      const activeTheme = response.data.find((theme: any) => theme.is_active);
      if (!activeTheme) throw new Error('No active theme found');
      return { data: activeTheme, status: response.status };
    }

    // Wenn die Antwort ein einzelnes Objekt ist, gib es direkt zurück
    if (typeof response.data === 'object' && response.data !== null) {
      return { data: response.data, status: response.status };
    }

    throw new Error('Theme API returned unexpected data');
  },

  async updateTheme(theme: Theme): Promise<ApiResponse<Theme>> {
    return api.request<Theme>('/api/themes/current', {
      method: 'PUT',
      body: JSON.stringify(theme),
    });
  }
};
