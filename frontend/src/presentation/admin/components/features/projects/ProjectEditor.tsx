'use client';

import { useState } from 'react';
import { Card } from '@/presentation/shared/ui/card';
import { Input } from '@/presentation/shared/ui/input';
import { Textarea } from '@/presentation/shared/ui/textarea';
import { Button } from '@/presentation/shared/ui/button';
import { ScrollArea } from '@/presentation/shared/ui/scroll-area';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

import { Project } from '@/domain/entities/Project';
import { projectApi } from '@/domain/shared/utils/api';

interface ProjectEditorProps {
  project: Project;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProjectEditor({ project: initialProject, onSave, onCancel }: ProjectEditorProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof Project, value: any) => {
    setProject(prev => ({ ...prev, [field]: value }));
  };

  const handleTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const techs = e.target.value.split(',').map(t => t.trim());
    setProject(prev => ({ ...prev, technologies: techs }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (project.id) {
        await projectApi.updateProject(project.id, project);
      } else {
        // This assumes your API handles creation and returns the new project with an ID
        // You might need a createProject method in your api
        // const newProject = await projectApi.createProject(project);
        // setProject(newProject.data); 
        console.log("Creating new project - API method needs implementation");
      }
      onSave();
    } catch (error) {
      console.error("Failed to save project", error);
      // Optionally, show an error message to the user
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="project-editor-main-content">
      <div className="project-editor-main-header">
        <h2 className="project-editor-main-title">{project.id ? 'Edit Project' : 'Create New Project'}</h2>
        <div className="project-editor-main-links">
          {project.githubUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="project-editor-main-linkicon" />
                GitHub
              </a>
            </Button>
          )}
          {project.liveUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="project-editor-main-linkicon" />
                Live Demo
              </a>
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className="project-editor-list-scroll">
        <div className="project-editor-main-form">
          <div className="project-editor-main-form-group">
            <label className="project-editor-main-label">Title</label>
            <Input
              value={project.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Project title"
            />
          </div>
          <div className="project-editor-main-form-group">
            <label className="project-editor-main-label">Short Description</label>
            <Textarea
              value={project.short_description || ''}
              onChange={(e) => handleInputChange('short_description', e.target.value)}
              placeholder="Brief description for project cards"
              rows={2}
            />
          </div>
          <div className="project-editor-main-form-group">
            <label className="project-editor-main-label">Full Description</label>
            <Textarea
              value={project.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed project description"
              rows={4}
            />
          </div>
          <div className="project-editor-main-form-group">
            <label className="project-editor-main-label">GitHub URL</label>
            <Input
              value={project.githubUrl || ''}
              onChange={(e) => handleInputChange('githubUrl', e.target.value)}
              placeholder="https://github.com/username/repo"
            />
          </div>
          <div className="project-editor-main-form-group">
            <label className="project-editor-main-label">Live Demo URL</label>
            <Input
              value={project.liveUrl || ''}
              onChange={(e) => handleInputChange('liveUrl', e.target.value)}
              placeholder="https://demo-url.com"
            />
          </div>
          <div className="project-editor-main-form-group">
            <label className="project-editor-main-label">Technologies</label>
            <Input
              value={project.technologies.join(', ')}
              onChange={handleTechChange}
              placeholder="React, TypeScript, Node.js"
            />
          </div>
        </div>
      </ScrollArea>
      <div className="project-editor-main-actions">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Project'}
        </Button>
      </div>
    </div>
  );
}
