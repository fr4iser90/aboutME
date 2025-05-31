import { Section } from '@/domain/entities/Section';
import { SectionRepository } from '@/domain/repositories/SectionRepository';
import { AdminSectionApi } from '@/infrastructure/api/admin/sections';

export class AdminSectionService {
  private repository: SectionRepository;

  constructor() {
    this.repository = new AdminSectionApi();
  }

  async getAllSections(): Promise<Section[]> {
    return this.repository.getAll();
  }

  async getSectionById(id: string): Promise<Section | null> {
    return this.repository.getById(id);
  }

  async createSection(section: Omit<Section, 'id' | 'created_at' | 'updated_at'>): Promise<Section> {
    return this.repository.create(section);
  }

  async updateSection(id: string, section: Partial<Section>): Promise<Section> {
    return this.repository.update(id, section);
  }

  async deleteSection(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

export const useAdminSections = () => {
  const service = new AdminSectionService();

  return {
    getAllSections: service.getAllSections.bind(service),
    getSectionById: service.getSectionById.bind(service),
    createSection: service.createSection.bind(service),
    updateSection: service.updateSection.bind(service),
    deleteSection: service.deleteSection.bind(service),
  };
}; 