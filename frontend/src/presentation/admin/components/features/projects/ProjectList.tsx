import { useState, useEffect } from 'react';
import { ProjectCard } from '@/presentation/public/components/sections/ProjectCard';
import type { Project } from '@/domain/entities/Project';
import { projectApi } from '@/domain/shared/utils/api';
import { ProjectImportPanel } from './ProjectImportPanel';
import { useTabContext } from '@/presentation/admin/contexts/TabContext';
import ProjectEditor from '@/presentation/admin/components/features/projects/ProjectEditor';

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
    console.log("ProjectList useEffect running"); 
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    console.log("fetchProjects called"); 
    try {
      setLoading(true);
      console.log("Attempting to call projectApi.getProjects()"); 
      const response = await projectApi.getProjects();
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
      await projectApi.deleteProject(id);
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
    return <div className="project-list__message">Loading projects...</div>;
  }

  if (error) {
    return <div className="project-list__message project-list__message--error">{error}</div>;
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
    <div className="project-list">
      <div className="project-list__header">
        <h2 className="project-list__title">Projects Overview</h2>
        <div className="project-list__header-actions">
          <button
            onClick={() => { setShowAddModal(true); setAddMode('none'); }}
            className="project-list__add-btn"
            title="Projekt hinzufügen oder importieren"
          >
            +
          </button>
        </div>
      </div>
      {showAddModal && (
        <div className="project-list__modal-overlay">
          <div className="project-list__modal">
            <h3 className="project-list__modal-title">Projekt hinzufügen</h3>
            {addMode === 'none' && (
              <div className="project-list__modal-actions">
                <button
                  className="project-list__modal-btn--import"
                  onClick={() => { setAddMode('import'); }}
                >
                  Projekte importieren
                </button>
                <button
                  className="project-list__modal-btn--manual"
                  onClick={() => { setAddMode('manual'); setShowAddModal(false); }}
                >
                  Manuell anlegen
                </button>
                <button
                  className="project-list__modal-btn--cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Abbrechen
                </button>
              </div>
            )}
            {addMode === 'import' && (
              <>
                <ProjectImportPanel />
                <div className="project-list__modal-close-row">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="project-list-modal-btn-cancel"
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
        const shouldRenderOtherGroup = sourceKey === 'other' && projectsInGroup.length > 0;
        const shouldRenderKnownGroup = sourceKey !== 'other' && projectsInGroup.length > 0;
        if (!shouldRenderKnownGroup && !shouldRenderOtherGroup) return null;
        let groupTitle = 'Other Projects';
        if (sourceKey === 'github') groupTitle = 'GitHub Projects';
        else if (sourceKey === 'gitlab') groupTitle = 'GitLab Projects';
        else if (sourceKey === 'manual') groupTitle = 'Manual Projects';
        return (
          <div key={sourceKey} className="project-list__group">
            <h3 className="project-list__group-title">
              {groupTitle} ({projectsInGroup.length})
            </h3>
            {viewMode === 'card' ? (
              <div className="project-list__cards">
                {projectsInGroup.map((project) => (
                  <div key={project.id} className="project-list__card-wrapper">
                    <ProjectCard project={project} />
                    <div className="project-list__card-actions">
                      <button
                        onClick={() => handleEditClick(project)}
                        className="project-list__card-edit"
                        aria-label={`Edit ${project.title}`}
                      >
                        <svg className="project-list__card-edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="project-list__card-delete"
                        aria-label={`Delete ${project.title}`}
                      >
                        <svg className="project-list__card-delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="project-list__simple">
                {projectsInGroup.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleEditClick(project)}
                    className="project-list__simple-btn"
                    title={project.description || project.title}
                  >
                    <span className="project-list__simple-title">{project.title}</span>
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
