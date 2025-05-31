import { Project } from '@/domain/entities/Project';
import { ProjectRepository } from '@/domain/repositories/ProjectRepository';
import { PublicProjectApi } from '@/infrastructure/api/public/projects';

export class ProjectService {
  private repository: ProjectRepository;

  constructor() {
    this.repository = new PublicProjectApi();
  }

  async getAllProjects(): Promise<Project[]> {
    return this.repository.getAll();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.repository.getById(id);
  }
}

export const useProjects = () => {
  const service = new ProjectService();

  return {
    getAllProjects: service.getAllProjects.bind(service),
    getProjectById: service.getProjectById.bind(service),
  };
};
