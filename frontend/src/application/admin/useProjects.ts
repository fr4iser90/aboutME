import { Project } from '@/domain/entities/Project';
import { ProjectRepository } from '@/domain/repositories/ProjectRepository';
import { AdminProjectApi } from '@/infrastructure/api/admin/projects';

export class AdminProjectService {
  private repository: ProjectRepository;

  constructor() {
    this.repository = new AdminProjectApi();
  }

  async getAllProjects(): Promise<Project[]> {
    return this.repository.getAll();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.repository.getById(id);
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return this.repository.create(project);
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return this.repository.update(id, project);
  }

  async deleteProject(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

export const useAdminProjects = () => {
  const service = new AdminProjectService();

  return {
    getAllProjects: service.getAllProjects.bind(service),
    getProjectById: service.getProjectById.bind(service),
    createProject: service.createProject.bind(service),
    updateProject: service.updateProject.bind(service),
    deleteProject: service.deleteProject.bind(service),
  };
};
