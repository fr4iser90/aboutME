'use client';

import { useState } from 'react';
import { Card } from '@/presentation/shared/ui/card';
import { Input } from '@/presentation/shared/ui/input';
import { Textarea } from '@/presentation/shared/ui/textarea';
import { Button } from '@/presentation/shared/ui/button';
import { ScrollArea } from '@/presentation/shared/ui/scroll-area';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  githubUrl: string;
  liveUrl?: string;
  technologies: string[];
  image?: string;
}

interface ProjectEditorProps {
  onProjectSelect?: (project: Project | null) => void;
}

export default function ProjectEditor({ onProjectSelect }: ProjectEditorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'New Project',
      description: '',
      shortDescription: '',
      githubUrl: '',
      technologies: [],
    };
    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
    setIsEditing(true);
    onProjectSelect?.(newProject);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
      setIsEditing(false);
      onProjectSelect?.(null);
    }
  };

  const handleUpdateProject = (updates: Partial<Project>) => {
    if (!selectedProject) return;
    const updatedProject = { ...selectedProject, ...updates };
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
    onProjectSelect?.(updatedProject);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditing(true);
    onProjectSelect?.(project);
  };

  return (
    <div className="project-editor-root">
      {/* Project List */}
      <div className="project-editor-list">
        <div className="project-editor-list-header">
          <h2 className="project-editor-list-title">Projects</h2>
          <Button onClick={handleAddProject} size="icon" variant="ghost">
            <Plus className="project-editor-list-addicon" />
          </Button>
        </div>
        <ScrollArea className="project-editor-list-scroll">
          <div className="project-editor-list-items">
            {projects.map(project => (
              <Card
                key={project.id}
                className={`project-editor-list-item${selectedProject?.id === project.id ? ' project-editor-list-item-active' : ''}`}
                onClick={() => handleSelectProject(project)}
              >
                <div className="project-editor-list-item-content">
                  <div>
                    <h3 className="project-editor-list-item-title">{project.title}</h3>
                    <p className="project-editor-list-item-desc">
                      {project.shortDescription || project.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                  >
                    <Trash2 className="project-editor-list-item-deleteicon" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
      {/* Project Editor */}
      <div className="project-editor-main">
        {selectedProject ? (
          <div className="project-editor-main-content">
            <div className="project-editor-main-header">
              <h2 className="project-editor-main-title">Edit Project</h2>
              <div className="project-editor-main-links">
                {selectedProject.githubUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="project-editor-main-linkicon" />
                      GitHub
                    </a>
                  </Button>
                )}
                {selectedProject.liveUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="project-editor-main-linkicon" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <div className="project-editor-main-form">
              <div className="project-editor-main-form-group">
                <label className="project-editor-main-label">Title</label>
                <Input
                  value={selectedProject.title}
                  onChange={(e) => handleUpdateProject({ title: e.target.value })}
                  placeholder="Project title"
                />
              </div>
              <div className="project-editor-main-form-group">
                <label className="project-editor-main-label">Short Description</label>
                <Textarea
                  value={selectedProject.shortDescription}
                  onChange={(e) => handleUpdateProject({ shortDescription: e.target.value })}
                  placeholder="Brief description for project cards"
                  rows={2}
                />
              </div>
              <div className="project-editor-main-form-group">
                <label className="project-editor-main-label">Full Description</label>
                <Textarea
                  value={selectedProject.description}
                  onChange={(e) => handleUpdateProject({ description: e.target.value })}
                  placeholder="Detailed project description"
                  rows={4}
                />
              </div>
              <div className="project-editor-main-form-group">
                <label className="project-editor-main-label">GitHub URL</label>
                <Input
                  value={selectedProject.githubUrl}
                  onChange={(e) => handleUpdateProject({ githubUrl: e.target.value })}
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <div className="project-editor-main-form-group">
                <label className="project-editor-main-label">Live Demo URL</label>
                <Input
                  value={selectedProject.liveUrl}
                  onChange={(e) => handleUpdateProject({ liveUrl: e.target.value })}
                  placeholder="https://demo-url.com"
                />
              </div>
              <div className="project-editor-main-form-group">
                <label className="project-editor-main-label">Technologies</label>
                <Input
                  value={selectedProject.technologies.join(', ')}
                  onChange={(e) => handleUpdateProject({
                    technologies: e.target.value.split(',').map(t => t.trim())
                  })}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="project-editor-main-empty">
            Select a project to edit or create a new one
          </div>
        )}
      </div>
    </div>
  );
} 