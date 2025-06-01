'use client';

import { useState, useEffect } from 'react';
import { useAdminUpload } from '@/hooks/useAdminUpload';

export default function AdminUploadPageContent() {
  const { uploadFile, deleteFile, files, loading, error, fetchFiles } = useAdminUpload();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        await uploadFile(file);
      }
      setSelectedFiles([]);
    }
  };

  const handleDelete = async (filename: string) => {
    await deleteFile(filename);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">File Upload</h1>
      <div className="mb-4">
        <input type="file" multiple onChange={handleFileChange} className="mb-2" />
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Upload
        </button>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Uploaded Files</h2>
        <ul>
          {files.map((file: { filename: string; original_filename?: string }) => (
            <li key={file.filename} className="flex items-center justify-between mb-2">
              <span>{file.original_filename || file.filename}</span>
              <button
                onClick={() => handleDelete(file.filename)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 