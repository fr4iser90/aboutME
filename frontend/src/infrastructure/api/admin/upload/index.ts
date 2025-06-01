import { UploadRepository } from '@/domain/repositories/UploadRepository';
import { config } from '@/domain/shared/utils/config';

export class AdminUploadApi implements UploadRepository {
  private baseUrl = '/api/admin/upload';

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  }

  async deleteFile(filename: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${filename}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to delete file');
  }

  async getFileUrl(filename: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/${filename}`, {
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to get file URL');
    const data = await res.json();
    return data.url;
  }
} 