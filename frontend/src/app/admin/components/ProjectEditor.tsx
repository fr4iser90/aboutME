'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <div className="flex h-full">
      {/* Project List */}
      <div className="w-64 border-r p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Button onClick={handleAddProject} size="icon" variant="ghost">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-2">
            {projects.map(project => (
              <Card
                key={project.id}
                className={`p-3 cursor-pointer hover:bg-muted/50 ${
                  selectedProject?.id === project.id ? 'bg-muted' : ''
                }`}
                onClick={() => handleSelectProject(project)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
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
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Project Editor */}
      <div className="flex-1 p-6">
        {selectedProject ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Edit Project</h2>
              <div className="space-x-2">
                {selectedProject.githubUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {selectedProject.liveUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={selectedProject.title}
                  onChange={(e) => handleUpdateProject({ title: e.target.value })}
                  placeholder="Project title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <Textarea
                  value={selectedProject.shortDescription}
                  onChange={(e) => handleUpdateProject({ shortDescription: e.target.value })}
                  placeholder="Brief description for project cards"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Description</label>
                <Textarea
                  value={selectedProject.description}
                  onChange={(e) => handleUpdateProject({ description: e.target.value })}
                  placeholder="Detailed project description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">GitHub URL</label>
                <Input
                  value={selectedProject.githubUrl}
                  onChange={(e) => handleUpdateProject({ githubUrl: e.target.value })}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Live Demo URL</label>
                <Input
                  value={selectedProject.liveUrl}
                  onChange={(e) => handleUpdateProject({ liveUrl: e.target.value })}
                  placeholder="https://demo-url.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Technologies</label>
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
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a project to edit or create a new one
          </div>
        )}
      </div>
    </div>
  );
} 