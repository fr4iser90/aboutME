import { Section } from '@/domain/entities/Section';
import { SectionRepository } from '@/domain/repositories/SectionRepository';
import { config } from '@/domain/shared/utils/config';

export class AdminSectionApi implements SectionRepository {
  private baseUrl = config.backendUrl + config.endpoints.sections.base;

  async getAll() {
    const res = await fetch(this.baseUrl, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch sections');
    return res.json();
  }

  async getById(id: string) {
    const res = await fetch(`${this.baseUrl}/${id}`, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  }

  async create(section: Omit<Section, 'id' | 'created_at' | 'updated_at'>) {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(section),
    });
    if (!res.ok) throw new Error('Failed to create section');
    return res.json();
  }

  async update(id: string, section: Partial<Section>) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(section),
    });
    if (!res.ok) throw new Error('Failed to update section');
    return res.json();
  }

  async delete(id: string) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete section');
  }
} 