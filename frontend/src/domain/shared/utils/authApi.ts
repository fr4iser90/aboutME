import { BaseApiClient } from './baseApiClient';
import { config } from './config';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface AuthResponse {
  valid: boolean;
  user?: {
    email: string;
  };
}

export class AuthApi extends BaseApiClient {
  public async validateAuth(): Promise<boolean> {
    try {
      const endpoint = config.endpoints.auth.validate;
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
        credentials: 'include',
      });
      if (response.status === 401) {
        this.clearAuthToken();
        return false;
      }
      if (!response.ok) {
        console.error(`Auth validation request failed with status: ${response.status}`);
        return false;
      }
      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Auth validation fetch/parse failed:', error);
      this.clearAuthToken();
      return false;
    }
  }

  public async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>(config.endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  public async logout(): Promise<ApiResponse<void>> {
    return this.request<void>(config.endpoints.auth.logout, {
      method: 'POST',
    });
  }
}

export const authApi = new AuthApi(); 