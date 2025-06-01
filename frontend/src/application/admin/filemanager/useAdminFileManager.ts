import { useState, useCallback } from 'react';
import { AdminFileManagerApi } from '@/infrastructure/api/admin/filemanager';
import type { File } from '@/infrastructure/api/admin/filemanager';

export function useAdminFileManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = new AdminFileManagerApi();

  const listFiles = useCallback(async (parent_id?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await api.listFiles(parent_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createFile = useCallback(async (formData: FormData, parent_id?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await api.createFile(formData, parent_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFiles = useCallback(async (formData: FormData, parent_id?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await api.createFiles(formData, parent_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create files');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (name: string, parent_id?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await api.createFolder(name, parent_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (file_id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteFile(file_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moveFile = useCallback(async (file_id: string, new_parent_id?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await api.moveFile(file_id, new_parent_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    listFiles,
    createFile,
    createFiles,
    createFolder,
    deleteFile,
    moveFile
  };
} 