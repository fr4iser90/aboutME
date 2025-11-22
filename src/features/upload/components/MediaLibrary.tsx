'use client'

import { useState, useEffect } from 'react';
import { UploadCategory, FileInfo } from '../types';
import FileUpload from './FileUpload';

export default function MediaLibrary() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<UploadCategory>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const categories: UploadCategory[] = ['hero', 'background', 'projects', 'blog', 'about', 'general'];

  useEffect(() => {
    loadFiles();
  }, [selectedCategory]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/upload/admin?category=${selectedCategory}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load files');
      }

      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete file "${filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/upload/admin?category=${selectedCategory}&filename=${encodeURIComponent(filename)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete file');
      }

      // Reload files
      loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const handleUploadComplete = (file: { filename: string; url: string; size: number }) => {
    setUploadSuccess(`File "${file.filename}" uploaded successfully!`);
    setUploadError(null);
    setTimeout(() => setUploadSuccess(null), 3000);
    loadFiles();
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadSuccess(null);
    setTimeout(() => setUploadError(null), 5000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryLabel = (category: UploadCategory): string => {
    const labels: Record<UploadCategory, string> = {
      hero: 'Hero Images',
      background: 'Background Images',
      projects: 'Project Images',
      blog: 'Blog Images',
      about: 'About Images',
      general: 'General Files'
    };
    return labels[category];
  };

  return (
    <div className="media-library">
      {/* Category Selector */}
      <div className="media-library__categories">
        {categories.map((category) => (
          <button
            key={category}
            className={`media-library__category ${selectedCategory === category ? 'media-library__category--active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Upload Section */}
      <div className="media-library__upload">
        <h3 className="media-library__section-title">Upload to {getCategoryLabel(selectedCategory)}</h3>
        <FileUpload
          category={selectedCategory}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Messages */}
      {uploadSuccess && (
        <div className="media-library__message media-library__message--success">
          {uploadSuccess}
        </div>
      )}
      {uploadError && (
        <div className="media-library__message media-library__message--error">
          {uploadError}
        </div>
      )}
      {error && (
        <div className="media-library__message media-library__message--error">
          {error}
        </div>
      )}

      {/* Files List */}
      <div className="media-library__files">
        <h3 className="media-library__section-title">
          Files in {getCategoryLabel(selectedCategory)} ({files.length})
        </h3>

        {loading ? (
          <div className="media-library__loading">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="media-library__empty">
            <p>No files in this category yet.</p>
            <p>Upload a file to get started!</p>
          </div>
        ) : (
          <div className="media-library__grid">
            {files.map((file) => (
              <div key={file.filename} className="media-library__file-card">
                {file.mimeType.startsWith('image/') ? (
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="media-library__file-preview"
                  />
                ) : (
                  <div className="media-library__file-icon">📄</div>
                )}
                <div className="media-library__file-info">
                  <p className="media-library__file-name">{file.filename}</p>
                  <p className="media-library__file-meta">
                    {formatFileSize(file.size)} • {file.mimeType}
                  </p>
                </div>
                <div className="media-library__file-actions">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="media-library__file-action"
                    title="View file"
                  >
                    👁️
                  </a>
                  <button
                    onClick={() => handleDelete(file.filename)}
                    className="media-library__file-action media-library__file-action--delete"
                    title="Delete file"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

