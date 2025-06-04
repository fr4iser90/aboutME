import { config } from './config';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class BaseApiClient {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = config.backendUrl;
  }

  protected getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  protected getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      this.clearAuthToken();
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  public clearAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T; status: number; }> {
    if (typeof window === 'undefined') {
      console.warn('API request attempted during SSR, skipping...');
      return {
        data: {} as T,
        status: 500,
      };
    }
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: this.getHeaders(),
      credentials: 'include',
    });
    const data = await this.handleResponse<T>(response);
    return {
      data,
      status: response.status,
    };
  }
} 