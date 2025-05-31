import { useState, useEffect } from 'react';
import { ProjectCard } from '@/presentation/public/components/sections/ProjectCard';
import type { Project } from '@/domain/entities/Project';
import { apiClient } from '@/shared/utils/api';
import { ProjectImportPanel } from './ProjectImportPanel';
import { useTabContext } from '@/app/admin/layout';
import { ProjectEditor } from './ProjectEditor';

interface ProjectListProps {
  viewMode?: 'card' | 'simple'; // Add viewMode prop
  onEditProject?: (project: Project) => void; // Add onEditProject prop
}

export function ProjectList({ viewMode = 'card', onEditProject }: ProjectListProps) {
  console.log("ProjectList component rendering"); // Log 1
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'none' | 'manual' | 'import'>('none');
  const tabContext = useTabContext();

  useEffect(() => {
    console.log("ProjectList useEffect running"); // Log 2
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    console.log("fetchProjects called"); // Log 3
    try {
      setLoading(true);
      console.log("Attempting to call apiClient.getProjects()"); // Log 4
      const response = await apiClient.getProjects();
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await apiClient.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  const handleEditClick = (project: Project) => {
    if (onEditProject) {
      onEditProject(project);
    } else if (tabContext) { // Fallback to opening in tab if onEditProject is not provided
      tabContext.openTab({
        id: `project-${project.id}`,
        title: project.title,
        icon: <></>, // Placeholder icon
        content: <ProjectEditor project={project} onSave={() => { fetchProjects(); tabContext.closeTab(`project-${project.id}`); }} onCancel={() => tabContext.closeTab(`project-${project.id}`)} />,
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  const groupProjectsBySource = (projectsToGroup: Project[]) => {
    const grouped: { [key: string]: Project[] } = {
      github: [],
      gitlab: [],
      manual: [],
      other: [],
    };
    projectsToGroup.forEach((project) => {
      const source = project.sourceType?.toLowerCase();
      if (source === 'github') {
        grouped.github.push(project);
      } else if (source === 'gitlab') {
        grouped.gitlab.push(project);
      } else if (source === 'manual') {
        grouped.manual.push(project);
      } else {
        // Includes projects with undefined sourceType or other unrecognised sourceTypes
        grouped.other.push(project);
      }
    });
    return grouped;
  };

  const groupedProjects = groupProjectsBySource(projects);
  const sourceOrder: (keyof typeof groupedProjects)[] = ['github', 'gitlab', 'manual', 'other'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold galaxy-text">Projects Overview</h2>
        <div className="space-x-2 flex items-center">
          <button
            onClick={() => { setShowAddModal(true); setAddMode('none'); }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            title="Projekt hinzufügen oder importieren"
          >
            +
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-slate-900 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 galaxy-text">Projekt hinzufügen</h3>
            {addMode === 'none' && (
              <div className="flex flex-col gap-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => { setAddMode('import'); }}
                >
                  Projekte importieren
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  onClick={() => { setAddMode('manual'); setShowAddModal(false); }}
                >
                  Manuell anlegen
                </button>
                <button
                  className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800"
                  onClick={() => setShowAddModal(false)}
                >
                  Abbrechen
                </button>
              </div>
            )}
            {addMode === 'import' && (
              <>
                <ProjectImportPanel />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-800"
                  >
                    Schließen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {sourceOrder.map((sourceKey) => {
        const projectsInGroup = groupedProjects[sourceKey];
        
        // Logic to determine if a group should be rendered
        const shouldRenderOtherGroup = sourceKey === 'other' && projectsInGroup.length > 0;
        const shouldRenderKnownGroup = sourceKey !== 'other' && projectsInGroup.length > 0;

        if (!shouldRenderKnownGroup && !shouldRenderOtherGroup) {
          // If it's not 'other' and empty, skip.
          // If it IS 'other' but empty, also skip.
          return null;
        }

        let groupTitle = 'Other Projects';
        if (sourceKey === 'github') groupTitle = 'GitHub Projects';
        else if (sourceKey === 'gitlab') groupTitle = 'GitLab Projects';
        else if (sourceKey === 'manual') groupTitle = 'Manual Projects';
        
        return (
          <div key={sourceKey} className="mb-12">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700 galaxy-text">
              {groupTitle} ({projectsInGroup.length})
            </h3>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsInGroup.map((project) => (
                  <div key={project.id} className="relative group">
                    <ProjectCard project={project} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(project)}
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                        aria-label={`Edit ${project.title}`}
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100 ml-2"
                        aria-label={`Delete ${project.title}`}
                      >
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Simple list view for sidebar
              <div className="space-y-1">
                {projectsInGroup.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleEditClick(project)}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    title={project.description || project.title}
                  >
                    <span className="truncate block">{project.title}</span>
                    {/* Optionally add more simple info like stars, status, etc. */}
                    {/* Example: project.starsCount ? <span className="text-xs text-gray-500 ml-2">{project.starsCount}*</span> : null */}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
