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
