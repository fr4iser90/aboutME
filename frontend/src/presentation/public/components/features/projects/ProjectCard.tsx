import { Project } from '@/domain/entities/Project';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/presentation/shared/ui/button';
import { ExternalLink, Github, Star, GitFork, Eye, AlertCircle, Home, Clock } from 'lucide-react';
import Image from 'next/image';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const cardDesc = project.short_description || project.own_description || project.description;
  return (
    <Card className="flex flex-col h-full" style={{ background: 'var(--card-bg)', color: 'var(--card-text-color)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)', borderRadius: 'var(--card-radius, 1rem)', maxWidth: '400px', minHeight: '320px', margin: '0 auto' }}>
      {project.imageUrl && (
        <div className="relative w-full h-48" style={{ maxHeight: '200px', overflow: 'hidden', borderTopLeftRadius: 'var(--card-radius, 1rem)', borderTopRightRadius: 'var(--card-radius, 1rem)' }}>
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover rounded-t-lg"
            style={{ objectFit: 'cover', width: '100%', height: '100%', maxHeight: '200px' }}
          />
        </div>
      )}
      <CardHeader>
        <h3 className="text-xl font-semibold" style={{ color: 'var(--card-title-color)' }}>{project.title}</h3>
      </CardHeader>
      <CardContent className="flex-grow">
        <p style={{ color: 'var(--card-text-color)' }}>{cardDesc}</p>
        <div className="project-card-badges">
          {project.technologies?.map((tech) => (
            <Badge key={tech} variant="secondary" className="project-card-badge">
              {tech}
            </Badge>
          ))}
        </div>
        {project.details?.languages_map && Object.keys(project.details.languages_map).length > 0 && (
          <div className="project-card-languages">
            <span className="project-card-languages-label">Languages:</span>
            {Object.keys(project.details.languages_map).map((lang) => (
              <Badge key={lang} variant="outline" className="project-card-badge">
                {lang}
              </Badge>
            ))}
          </div>
        )}
        {project.topics && project.topics.length > 0 && (
          <div className="project-card-topics">
            <span className="project-card-topics-label">Topics:</span>
            {project.topics.map((topic) => (
              <Badge key={topic} variant="outline" className="project-card-badge">
                {topic}
              </Badge>
            ))}
          </div>
        )}
        {project.status && (
          <div className="project-card-status">
            <Badge variant={project.status === 'ACTIVE' ? 'default' : 'destructive'}>
              Status: {project.status}
            </Badge>
          </div>
        )}

        {/* GitHub Stats */}
        <div className="project-card-meta-row">
          {typeof project.starsCount === 'number' && (
            <div className="project-card-meta-item">
              <Star className="project-card-icon" />
              <span>{project.starsCount} Stars</span>
            </div>
          )}
          {typeof project.forksCount === 'number' && (
            <div className="project-card-meta-item">
              <GitFork className="project-card-icon" />
              <span>{project.forksCount} Forks</span>
            </div>
          )}
          {typeof project.watchersCount === 'number' && (
            <div className="project-card-meta-item">
              <Eye className="project-card-icon" />
              <span>{project.watchersCount} Watchers</span>
            </div>
          )}
          {typeof project.openIssuesCount === 'number' && (
            <div className="project-card-meta-item">
              <AlertCircle className="project-card-icon" />
              <span>{project.openIssuesCount} Open Issues</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 pt-4">
        <div className="flex flex-wrap gap-2">
          {project.githubUrl && (
            <Button variant="outline" size="sm" asChild style={{ background: 'var(--button-bg)', color: 'var(--button-text)', border: '1px solid var(--button-border)', boxShadow: 'var(--button-shadow)' }}>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </Button>
          )}
          {project.liveUrl && (
            <Button variant="outline" size="sm" asChild style={{ background: 'var(--button-bg)', color: 'var(--button-text)', border: '1px solid var(--button-border)', boxShadow: 'var(--button-shadow)' }}>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Live Demo
              </a>
            </Button>
          )}
          {project.homepageUrl && (
            <Button variant="outline" size="sm" asChild style={{ background: 'var(--button-bg)', color: 'var(--button-text)', border: '1px solid var(--button-border)', boxShadow: 'var(--button-shadow)' }}>
              <a href={project.homepageUrl} target="_blank" rel="noopener noreferrer">
                <Home className="w-4 h-4 mr-2" />
                Homepage
              </a>
            </Button>
          )}
        </div>
        {project.updatedAt && (
          <div className="project-card-updated" style={{ color: 'var(--card-list-item-color)' }}>
            <Clock className="w-3 h-3 mr-1" />
            Last updated: {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
