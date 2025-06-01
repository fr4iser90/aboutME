import { useState, useCallback } from 'react';
import { config } from '@/domain/shared/utils/config';

interface UploadedFile {
  filename: string;
  original_filename?: string;
  content_type?: string;
  file_type?: string;
  size: number;
  url: string;
}

export function useAdminUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.backendUrl}/api/admin/upload/upload`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const result = await response.json();
      setFiles(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${config.backendUrl}/api/admin/upload/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFiles]);

  const deleteFile = useCallback(async (filename: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.backendUrl}/api/admin/upload/upload/${filename}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFiles]);

  return { uploadFile, deleteFile, files, loading, error, fetchFiles };
} 