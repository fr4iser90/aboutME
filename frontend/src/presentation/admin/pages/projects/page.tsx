// frontend/src/app/admin/projects/page.tsx
"use client";

import { useAdminContext } from '@/presentation/admin/components/AdminContext';
import { ProjectList } from '@/presentation/admin/components/features/projects/ProjectList';
// This is the ProjectEditor that includes form and preview, for the main content area (Column 3)
import { ProjectEditor } from '@/presentation/admin/components/ProjectEditor';
import type { Project as DomainProject } from '@/domain/entities/Project';

export default function AdminProjectsPage() {
  const { selectedProject, setSelectedProject: setSelectedProjectInLayout } = useAdminContext();

  // This function is called when "edit" is clicked, either from Column 2's simple list (via context)
  // or from the card view's edit button within this page.
  const handleSelectProjectForEditing = (project: DomainProject) => {
    setSelectedProjectInLayout(project);
  };

  const handleEditorSaveOrCancel = () => {
    setSelectedProjectInLayout(null); // Clear selection in layout, reverts this page to overview
    // Optionally, trigger a refetch of the project list in Column 2 if needed
  };

  console.log("--- AdminProjectsPage (Column 3) RENDERING --- selectedProject from context:", selectedProject);

  if (selectedProject) {
    // If a project is selected (via context), show the editor
    return (
      <ProjectEditor
        project={selectedProject as DomainProject} 
        onSave={handleEditorSaveOrCancel}
        onCancel={handleEditorSaveOrCancel}
      />
    );
  }

  // If no project is selected for editing, show the Projects Overview (card view)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Projects Overview</h1>
        {/* Add New Project button could go here, or rely on Import Panel in Column 2 */}
      </div>
      {/* This ProjectList shows cards. Clicking edit on a card will call handleSelectProjectForEditing,
          which updates the context, causing this page to re-render and show the editor. */}
      <ProjectList 
        onEditProject={handleSelectProjectForEditing} 
        viewMode="card" 
      />
    </div>
  );
}
