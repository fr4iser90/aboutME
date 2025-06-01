'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAdminFileManager } from '@/application/admin/filemanager/useAdminFileManager';
import { FileUpload } from '@/presentation/admin/components/features/filemanager/FileUpload';
import { FileTree } from '@/presentation/admin/components/features/filemanager/FileTree';
import type { File } from '@/infrastructure/api/admin/filemanager';

export default function AdminFilesPageContent() {
  const fileManager = useAdminFileManager();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!isMounted) return;
    setSelectedFile(file);
    if (file.is_folder) {
      setCurrentFolder(file.id);
    }
  }, [isMounted]);

  const handleUploadComplete = useCallback(() => {
    if (!isMounted) return;
    setSelectedFile(null);
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div className="w-full">
      <FileUpload 
        onUploadComplete={handleUploadComplete}
        parentId={currentFolder}
      />
    </div>
  );
} 