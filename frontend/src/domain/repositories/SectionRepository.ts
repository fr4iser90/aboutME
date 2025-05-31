import { Section } from '@/domain/entities/Section';

export interface SectionRepository {
  getAll(): Promise<Section[]>;
  getById(id: string): Promise<Section | null>;
  create(section: Omit<Section, 'id' | 'created_at' | 'updated_at'>): Promise<Section>;
  update(id: string, section: Partial<Section>): Promise<Section>;
  delete(id: string): Promise<void>;
} 