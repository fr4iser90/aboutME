import { ApiResponse, BaseApiClient } from './baseApiClient';
import { Theme, ThemeColors, ThemeStyleProperties } from '@/domain/entities/Theme';

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
