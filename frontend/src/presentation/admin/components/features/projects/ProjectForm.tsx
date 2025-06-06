import { Project } from '@/domain/entities/Project';
import { Button } from '@/presentation/shared/ui/button';
import { Input } from '@/presentation/shared/ui/input';
import { Textarea } from '@/presentation/shared/ui/textarea';
import { useState } from 'react';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export const ProjectForm = ({ project, onSubmit, onCancel }: ProjectFormProps) => {
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? '');
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? '');
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? '');
  const [technologies, setTechnologies] = useState(project?.technologies.join(', ') ?? '');
  const [status, setStatus] = useState(project?.status ?? 'WIP');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        title,
        description,
        status,
        imageUrl: imageUrl || undefined,
        githubUrl: githubUrl || undefined,
        liveUrl: liveUrl || undefined,
        technologies: technologies.split(',').map((tech) => tech.trim()).filter(Boolean),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div>
        <label htmlFor="title" className="project-form__label">
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="project-form__label">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="project-form__label">
          Image URL
        </label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="githubUrl" className="project-form__label">
          GitHub URL
        </label>
        <Input
          id="githubUrl"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="liveUrl" className="project-form__label">
          Live URL
        </label>
        <Input
          id="liveUrl"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="technologies" className="project-form__label">
          Technologies (comma-separated)
        </label>
        <Input
          id="technologies"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="status" className="project-form__label">
          Status
        </label>
        <Input
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
        />
      </div>

      <div className="project-form__actions">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
