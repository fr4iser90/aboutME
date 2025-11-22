'use client'

import { useState, useRef, DragEvent } from 'react';
import { UploadCategory } from '../types';

interface FileUploadProps {
  category: UploadCategory;
  onUploadComplete?: (file: { filename: string; url: string; size: number }) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number;
  allowedTypes?: string[];
  className?: string;
  multiple?: boolean;
  onBatchUploadComplete?: (files: Array<{ filename: string; url: string; size: number }>) => void;
}

export default function FileUpload({
  category,
  onUploadComplete,
  onUploadError,
  maxSize,
  allowedTypes,
  className = '',
  multiple = false,
  onBatchUploadComplete
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (multiple && files.length > 1) {
        handleBatchUpload(files);
      } else {
        handleFileUpload(files[0]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (multiple && files.length > 1) {
        handleBatchUpload(Array.from(files));
      } else {
        handleFileUpload(files[0]);
      }
    }
  };

  const handleBatchUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    const uploadedFiles: Array<{ filename: string; url: string; size: number }> = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Validate file size
        if (maxSize && file.size > maxSize) {
          errors.push(`${file.name}: File size exceeds limit`);
          continue;
        }

        // Validate file type
        if (allowedTypes && !allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: File type not allowed`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('filename', file.name);

        const response = await fetch('/api/upload/admin', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          errors.push(`${file.name}: ${data.error || 'Upload failed'}`);
          continue;
        }

        uploadedFiles.push(data.file);
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
      }
    }

    setIsUploading(false);
    setTimeout(() => setUploadProgress(0), 1000);

    if (uploadedFiles.length > 0) {
      onBatchUploadComplete?.(uploadedFiles);
      // Also call individual callback for each file
      uploadedFiles.forEach(file => onUploadComplete?.(file));
    }

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file size
    if (maxSize && file.size > maxSize) {
      const error = `File size exceeds limit of ${formatFileSize(maxSize)}`;
      onUploadError?.(error);
      return;
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      const error = `File type ${file.type} is not allowed`;
      onUploadError?.(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('filename', file.name);

      const response = await fetch('/api/upload/admin', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      onUploadComplete?.(data.file);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`file-upload ${className}`}>
      <div
        className={`file-upload__dropzone ${isDragging ? 'file-upload__dropzone--dragging' : ''} ${isUploading ? 'file-upload__dropzone--uploading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-upload__input"
          onChange={handleFileSelect}
          accept={allowedTypes?.join(',')}
          disabled={isUploading}
          multiple={multiple}
        />

        {isUploading ? (
          <div className="file-upload__uploading">
            <div className="file-upload__spinner"></div>
            <p className="file-upload__text">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="file-upload__content">
            <div className="file-upload__icon">📁</div>
            <p className="file-upload__text">
              {isDragging 
                ? (multiple ? 'Drop files here' : 'Drop file here')
                : (multiple ? 'Click or drag files to upload' : 'Click or drag file to upload')
              }
            </p>
            <p className="file-upload__hint">
              Category: <strong>{category}</strong>
              {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

