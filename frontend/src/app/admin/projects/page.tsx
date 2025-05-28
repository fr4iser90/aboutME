'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GitHubSyncButton } from '@/components/admin/GitHubSyncButton';
import { ProjectList } from '@/components/admin/ProjectList';
import { ProjectEditor } from '@/components/admin/ProjectEditor';

export default function ProjectsPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <div className="space-x-4">
            <GitHubSyncButton />
            <button
              onClick={() => {
                setSelectedProject(null);
                setIsEditorOpen(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Project
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectList
            onEdit={(project) => {
              setSelectedProject(project);
              setIsEditorOpen(true);
            }}
          />
        </div>

        {isEditorOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-xl font-semibold mb-4">
                {selectedProject ? 'Edit Project' : 'Add Project'}
              </h2>
              <ProjectEditor
                project={selectedProject}
                onSave={() => {
                  setIsEditorOpen(false);
                  setSelectedProject(null);
                }}
                onCancel={() => {
                  setIsEditorOpen(false);
                  setSelectedProject(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 