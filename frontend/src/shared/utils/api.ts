import { config } from './config';
import type { Project, ProjectDetails } from '@/domain/entities/Project';

// Types
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

// API Client
export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.backendUrl;
  }

  private getHeaders(includeAuth = true): HeadersInit {
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

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private async handleResponse<T>(response: Response): Promise<T> {
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

  // Auth Methods
  public clearAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  public async validateAuth(): Promise<boolean> {
    try {
      const endpoint = config.endpoints.auth.validate;
      const url = `${this.baseUrl}${endpoint}`;
      
      // Perform fetch directly to bypass the global 401 redirect in this.request's handleResponse
      // for this specific validation check.
      const response = await fetch(url, {
        headers: this.getHeaders(), // Includes Authorization header (if any) and Content-Type
        credentials: 'include',   // Crucial for sending cookies
      });

      if (response.status === 401) {
        // If specifically 401, token is invalid or not present.
        // It's important to clear any stale client-side token.
        this.clearAuthToken(); 
        return false; 
      }

      if (!response.ok) {
        // For other non-401 errors during validation (e.g., 500 from server)
        console.error(`Auth validation request failed with status: ${response.status}`);
        // Depending on policy, might clear token here too, or just return false.
        // this.clearAuthToken(); 
        return false;
      }

      const data = await response.json();
      // Assuming AuthResponse is { valid: boolean, user?: {...} }
      // And the actual data from response.json() is AuthResponse, not ApiResponse<AuthResponse>
      // If response.json() IS ApiResponse<AuthResponse>, then it should be data.data.valid
      // Based on type AuthResponse { valid: boolean; ... }, data.valid is correct.
      return data.valid; 

    } catch (error) {
      // Catch network errors or other unexpected issues during the fetch itself
      console.error('Auth validation fetch/parse failed:', error);
      // Clear token as a precaution if any error occurs during validation attempt
      this.clearAuthToken();
      return false;
    }
  }

  public async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  public async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/api/auth/logout', {
      method: 'POST',
    });
  }

  // Project Methods
  public async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>('/api/admin/projects');
  }

  public async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/admin/projects/${id}`);
  }

  public async createProject(project: Omit<Project, 'id'>): Promise<ApiResponse<Project>> {
    return this.request<Project>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  public async updateProject(id: string, project: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  public async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/admin/projects/${id}`, {
      method: 'DELETE',
    });
  }

  public async importProjects(source: string, projects: any[]): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>('/api/admin/projects/import', {
      method: 'POST',
      body: JSON.stringify({ source, projects }),
    });
  }

  // Generic Request Method
  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (typeof window === 'undefined') {
      console.warn('API request attempted during SSR, skipping...');
      return {
        data: {} as T,
        status: 500,
      };
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[API] Making request to: ${url}`);

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

// AI Client
class AiClient {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.aiApiKey || '',
    };
  }

  public async generateContent(prompt: string, context: any = {}): Promise<ApiResponse<string>> {
    const url = `${config.aiBaseUrl}${config.endpoints.llm.generateContent(config.aiModel)}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: this.buildPrompt(prompt, context)
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    // Assuming successful response here, a more robust implementation would handle AI service errors
    return {
      data: data.candidates[0].content.parts[0].text,
      status: response.status, 
    };
  }

  private buildPrompt(message: string, context: any): string {
    let prompt = message;

    if (context.selectedProject) {
      prompt = `Project Context:
Title: ${context.selectedProject.title}
Description: ${context.selectedProject.description}
Technologies: ${context.selectedProject.technologies.join(', ')}

User Message: ${message}`;
    }

    if (context.currentTab) {
      prompt = `Current Section: ${context.currentTab}\n${prompt}`;
    }

    return prompt;
  }
}

// Export singleton instances
export const apiClient = new ApiClient();
export const aiClient = new AiClient();

// For backward compatibility
export const apiRequest = apiClient.request.bind(apiClient);
export const clearAuthCookie = apiClient.clearAuthToken.bind(apiClient);
