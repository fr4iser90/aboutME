import { baseApiClient } from './baseApiClient';
import { config } from './config';

export interface PageElement {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  grid_props: Record<string, any>;
  order: number;
  settings: Record<string, any>;
}

export interface Layout {
  id?: number;
  page: string;
  elements: PageElement[];
  layout_config: Record<string, any>;
  is_active: boolean;
  is_visible: boolean;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FullPageLayout {
  page: string;
  elements: PageElement[];
  layout_config: Record<string, any>;
}

export class LayoutApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.backendUrl}/api`;
  }

  // Admin endpoints
  async getFullPageLayout(page: string): Promise<FullPageLayout> {
    const response = await baseApiClient.get(`${this.baseUrl}/admin/layout/${page}/full-page`);
    return response.data;
  }

  async saveFullPageLayout(page: string, layout: FullPageLayout): Promise<Layout> {
    const response = await baseApiClient.post(`${this.baseUrl}/admin/layout/${page}/full-page`, layout);
    return response.data;
  }

  async getLayoutByPage(page: string): Promise<Layout> {
    const response = await baseApiClient.get(`${this.baseUrl}/admin/layout/${page}`);
    return response.data;
  }

  async getAllLayouts(): Promise<Layout[]> {
    const response = await baseApiClient.get(`${this.baseUrl}/admin/layout`);
    return response.data;
  }

  async createDefaultLayout(page: string): Promise<Layout> {
    const response = await baseApiClient.post(`${this.baseUrl}/admin/layout/${page}/default`);
    return response.data;
  }

  async deleteLayout(layoutId: number): Promise<void> {
    await baseApiClient.delete(`${this.baseUrl}/admin/layout/${layoutId}`);
  }

  async activateLayout(layoutId: number): Promise<void> {
    await baseApiClient.post(`${this.baseUrl}/admin/layout/${layoutId}/activate`);
  }

  // Public endpoints
  async getPublicLayout(page: string = 'home'): Promise<Layout> {
    const response = await baseApiClient.get(`${this.baseUrl}/public/layout?page=${page}`);
    return response.data;
  }
}

// Export singleton instance
export const layoutApi = new LayoutApi(); 