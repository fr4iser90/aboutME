import { Theme } from '@/domain/entities/Theme';
import { ThemeRepository } from '@/domain/repositories/ThemeRepository';
import { config } from '@/domain/shared/utils/config';


export class AdminThemeApi implements ThemeRepository {
  private baseUrl = config.backendUrl + '/api/admin/themes';

  async getAll() {
    const res = await fetch(this.baseUrl, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch themes');
    return res.json();
  }

  async getById(id: string) {
    const res = await fetch(`${this.baseUrl}/${id}`, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  }

  async update(id: string, theme: Partial<Theme>) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(theme),
    });
    if (!res.ok) throw new Error('Failed to update theme');
    return res.json();
  }

  async delete(id: string) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete theme');
  }
} 

