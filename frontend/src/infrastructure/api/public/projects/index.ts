import { Project } from '@/domain/entities/Project';
import { ProjectRepository } from '@/domain/repositories/ProjectRepository';

export class PublicProjectApi implements ProjectRepository {
  private readonly baseUrl = '/api/projects';

  async getAll(): Promise<Project[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  }

  async getById(id: string): Promise<Project | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch project');
    }
    return response.json();
  }

  // These methods are not available in the public API
  async create(): Promise<Project> {
    throw new Error('Not available in public API');
  }

  async update(): Promise<Project> {
    throw new Error('Not available in public API');
  }

  async delete(): Promise<void> {
    throw new Error('Not available in public API');
  }
}
