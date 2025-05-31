// frontend/src/app/admin/projects/page.tsx
"use client";

import { useState } from 'react';
import { useAdminContext } from '../AdminContext';
import { ProjectList } from '@/presentation/public/components/admin/ProjectList';
import { ProjectImportPanel } from '@/presentation/public/components/admin/ProjectImportPanel';
import { GitHubSyncButton } from '@/presentation/public/components/admin/GitHubSyncButton';
// This is the ProjectEditor that includes form and preview, for the main content area
import { ProjectEditor } from '@/presentation/public/components/admin/ProjectEditor'; 
import type { Project as DomainProject } from '@/domain/entities/Project';

export default function AdminProjectsPage() {
  const { setSelectedProject: setSelectedProjectInLayout } = useAdminContext();
  const [projectToEdit, setProjectToEdit] = useState<DomainProject | null>(null);

  const handleEditProject = (project: DomainProject) => {
    setProjectToEdit(project);
    setSelectedProjectInLayout(project); // Inform the layout/Copilot
  };

  const handleEditorSave = () => {
    setProjectToEdit(null);
    setSelectedProjectInLayout(null);
    // Here, you would typically refetch the project list or update it.
    // For now, just closing the editor.
  };

  const handleEditorCancel = () => {
    setProjectToEdit(null);
    setSelectedProjectInLayout(null);
  };

  console.log("--- AdminProjectsPage RENDERING --- projectToEdit:", projectToEdit);

  if (projectToEdit) {
    return (
      <ProjectEditor
        project={projectToEdit}
        onSave={handleEditorSave}
        onCancel={handleEditorCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Projects Management</h1>
        {/* GitHubSyncButton can be placed here or with ProjectImportPanel */}
      </div>
      
      <ProjectImportPanel />

      <div className="my-4">
        <GitHubSyncButton />
      </div>

      <ProjectList onEditProject={handleEditProject} />
    </div>
  );
}
