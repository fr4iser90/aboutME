import { BaseApiClient } from './baseApiClient';
import { config } from './config';
import type { Project } from '@/domain/entities/Project';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class ProjectApi extends BaseApiClient {
  public async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>(config.endpoints.projects.base);
  }

  public async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`${config.endpoints.projects.base}/${id}`);
  }

  public async createProject(project: Omit<Project, 'id'>): Promise<ApiResponse<Project>> {
    return this.request<Project>(config.endpoints.projects.base, {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  public async updateProject(id: string, project: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.request<Project>(`${config.endpoints.projects.base}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  public async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${config.endpoints.projects.base}/${id}`, {
      method: 'DELETE',
    });
  }

  public async importProjects(source: string, projects: any[]): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>(`/api/admin/projects/import`, {
      method: 'POST',
      body: JSON.stringify({ source, projects }),
    });
  }
}

export const projectApi = new ProjectApi(); 