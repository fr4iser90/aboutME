import { useEffect, useState } from 'react';
import { Project } from '@/domain/entities/Project';
import { apiClient } from '@/shared/utils/api';
import { ProjectEditor } from '@/presentation/admin/components/ProjectEditor';

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
      const response = await apiClient.getProjects();
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
    <div className="flex h-full">
      {/* Sidebar: Projektliste */}
      <div className="w-72 border-r bg-muted/40 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg">Projects</span>
          <button
            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleNewProject}
            title="Neues Projekt anlegen"
          >
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-400">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : projects.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No projects found.</div>
          ) : (
            <ul>
              {projects.map((project) => (
                <li
                  key={project.id}
                  className={`p-3 cursor-pointer hover:bg-purple-900/30 ${selectedProject?.id === project.id ? 'bg-purple-900/60 text-white' : ''}`}
                  onClick={() => handleSelectProject(project)}
                >
                  <div className="font-medium truncate">{project.title}</div>
                  <div className="text-xs text-slate-400 truncate">{project.description}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Mitte: Editor/Vorschau */}
      <div className="flex-1 flex flex-col p-8 overflow-auto">
        {selectedProject ? (
          <ProjectEditor
            project={selectedProject}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Select a project to edit or create a new one
          </div>
        )}
      </div>

      {/* Rechts: Copilot (Platzhalter) */}
      <div className="w-96 border-l bg-muted/40 p-4">
        <div className="font-bold mb-2">Copilot</div>
        {/* Hier kann deine KI-Hilfe-Komponente rein */}
        <div className="text-slate-400">KI-Hilfe kommt hier hin.</div>
      </div>
    </div>
  );
}
