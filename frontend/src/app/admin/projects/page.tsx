'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GitHubSyncButton } from '@/components/admin/GitHubSyncButton';
import { ProjectList } from '@/components/admin/ProjectList';
import { ProjectEditor } from '@/components/admin/ProjectEditor';
import { ProjectImportPanel } from '@/components/admin/ProjectImportPanel';

export default function ProjectsPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
        <ProjectImportPanel />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold galaxy-text tracking-tight">Projects</h1>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center">
            <GitHubSyncButton />
            <button
              onClick={() => {
                setSelectedProject(null);
                setIsEditorOpen(true);
              }}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-semibold text-base"
            >
              Add Project
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ProjectList
              onEdit={(project) => {
                setSelectedProject(project);
                setIsEditorOpen(true);
              }}
            />
          </div>
          {isEditorOpen && (
            <div className="galaxy-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 galaxy-text">
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
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 