import { useEffect, useState } from 'react';
import { Project } from '@/domain/entities/Project';
import { projectApi } from '@/domain/shared/utils/api';
import { ProjectEditor } from '@/presentation/admin/components/ProjectEditor';
import './AdminProjectsPage.css';
export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getProjects();
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleNewProject = () => {
    setSelectedProject({} as Project);
  };

  const handleSave = async () => {
    await fetchProjects();
    setSelectedProject(null);
  };

  const handleCancel = () => {
    setSelectedProject(null);
  };

  return (
    <div className="admin-projects-page">
      {/* Sidebar: Projektliste */}
      <div className="admin-projects-page__sidebar">
        <div className="admin-projects-page__sidebar-header">
          <span className="admin-projects-page__sidebar-title">Projects</span>
          <button
            className="admin-projects-page__new-button"
            onClick={handleNewProject}
            title="Neues Projekt anlegen"
          >
            +
          </button>
        </div>
        <div className="admin-projects-page__project-list-container">
          {loading ? (
            <div className="admin-projects-page__list-message">Loading...</div>
          ) : error ? (
            <div className="admin-projects-page__list-message error-message">{error}</div>
          ) : projects.length === 0 ? (
            <div className="admin-projects-page__list-message">No projects found.</div>
          ) : (
            <ul className="admin-projects-page__project-list">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className={`admin-projects-page__project-item ${selectedProject?.id === project.id ? 'admin-projects-page__project-item--selected' : ''}`}
                  onClick={() => handleSelectProject(project)}
                >
                  <div className="admin-projects-page__project-title">{project.title}</div>
                  <div className="admin-projects-page__project-description">{project.description}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Mitte: Editor/Vorschau */}
      <div className="admin-projects-page__main">
        {selectedProject ? (
          <ProjectEditor
            project={selectedProject}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="admin-projects-page__empty-view">
            Select a project to edit or create a new one
          </div>
        )}
      </div>

      {/* Rechts: Copilot (Platzhalter) */}
      <div className="admin-projects-page__copilot">
        <div className="admin-projects-page__copilot-title">Copilot</div>
        {/* Hier kann deine KI-Hilfe-Komponente rein */}
        <div className="admin-projects-page__copilot-placeholder">KI-Hilfe kommt hier hin.</div>
      </div>
    </div>
  );
}
