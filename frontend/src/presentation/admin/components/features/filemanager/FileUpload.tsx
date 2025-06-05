import { useState, useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/presentation/shared/ui/button';
import { useAdminFileManager } from '@/application/admin/filemanager/useAdminFileManager';
import type { File as ApiFile } from '@/infrastructure/api/admin/filemanager';
import { FileManagerContext } from '@/presentation/admin/pages/layout';

interface FileUploadProps {
  onUploadComplete: () => void;
  parentId?: string;
  acceptedFileTypes?: string[];
  maxSize?: number;
}

export function FileUpload({ 
  onUploadComplete, 
  parentId,
  acceptedFileTypes, 
  maxSize = 10 * 1024 * 1024 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileManager = useAdminFileManager();
  const { refreshFiles } = useContext(FileManagerContext);

  const onDrop = useCallback(async (acceptedFiles: globalThis.File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      if (acceptedFiles.length === 1) {
        // Einzel-Upload
        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);
        if (parentId) formData.append('parent_id', parentId);
        await fileManager.createFile(formData as any, parentId);
      } else {
        // Multi-Upload
        const formData = new FormData();
        acceptedFiles.forEach(file => formData.append('files', file));
        if (parentId) formData.append('parent_id', parentId);
        await fileManager.createFiles(formData as any, parentId);
      }
      refreshFiles();
      onUploadComplete();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [fileManager, parentId, onUploadComplete, refreshFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes ? {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    } : undefined,
    maxSize,
  });

  return (
    <div className="file-upload-root">
      <div
        {...getRootProps()}
        className={`file-upload-dropzone${isDragActive ? ' file-upload-dropzone-active' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="file-upload-uploading">Uploading...</div>
        ) : isDragActive ? (
          <div className="file-upload-drop-hint">Drop the file here...</div>
        ) : (
          <div>
            <div className="file-upload-hint">
              Drag & drop a file here, or click to select
            </div>
            <div className="file-upload-supported">Supported formats: Images, Videos, PDF, Word</div>
          </div>
        )}
      </div>
      {error && (
        <div className="file-upload-error">{error}</div>
      )}
    </div>
  );
} 