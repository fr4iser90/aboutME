import { useMemo } from 'react';
import { AdminUploadApi } from '@/infrastructure/api/admin/upload';
import { AdminUploadService } from './AdminUploadService';

export function useAdminUpload() {
  const service = useMemo(() => new AdminUploadService(new AdminUploadApi()), []);
  return service;
} 