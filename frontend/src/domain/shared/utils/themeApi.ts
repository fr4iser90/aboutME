import { ApiResponse, BaseApiClient } from './baseApiClient';

export interface Theme {
  id: number;
  name: string;
  description: string;
  style_properties: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      backgroundCard?: string;
      textMuted?: string;
      success?: string;
      danger?: string;
      info?: string;
      border?: string;
      shadow?: string;
    };
    typography: {
      fontFamily: string;
      fontSize: string;
      fontWeight?: string;
      fontWeightBold?: string;
      lineHeight: string;
    };
    spacing: {
      xs?: string;
      sm: string;
      md: string;
      lg: string;
      xl?: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      full?: string;
    };
    shadow?: {
      sm: string;
      md: string;
      lg: string;
    };
    galaxy?: {
      textGradient: string;
      cardGlow: string;
      backgroundGradient: string;
      starColor: string;
    };
  };
  is_active: boolean;
  is_visible: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
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