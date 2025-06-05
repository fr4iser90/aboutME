import { Project } from '@/domain/entities/Project';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/shared/ui/card';
import { Badge } from '@/presentation/shared/ui/badge';
import { Button } from '@/presentation/shared/ui/button';
import { ExternalLink, Github, Star, GitFork, Eye, AlertCircle, Home, Clock } from 'lucide-react';
import Image from 'next/image';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const cardDesc = project.short_description || project.own_description || project.description;
  return (
    <Card className="project-card" style={{ background: 'var(--card-bg)', color: 'var(--card-text-color)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)', borderRadius: 'var(--card-radius, 1rem)', maxWidth: '400px', minHeight: '320px', margin: '0 auto' }}>
      {project.imageUrl && (
        <div className="project-card__image-wrapper" style={{ maxHeight: '200px', overflow: 'hidden', borderTopLeftRadius: 'var(--card-radius, 1rem)', borderTopRightRadius: 'var(--card-radius, 1rem)' }}>
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="project-card__image"
            style={{ objectFit: 'cover', width: '100%', height: '100%', maxHeight: '200px' }}
          />
        </div>
      )}
      <CardHeader>
        <h3 className="project-card__title" style={{ color: 'var(--card-title-color)' }}>{project.title}</h3>
      </CardHeader>
      <CardContent className="project-card__content">
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
      <CardFooter className="project-card__footer">
        <div className="project-card__links">
          {project.githubUrl && (
            <Button variant="outline" size="sm" asChild style={{ background: 'var(--button-bg)', color: 'var(--button-text)', border: '1px solid var(--button-border)', boxShadow: 'var(--button-shadow)' }}>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="project-card__link-icon" />
                GitHub
              </a>
            </Button>
          )}
          {project.liveUrl && (
            <Button variant="outline" size="sm" asChild style={{ background: 'var(--button-bg)', color: 'var(--button-text)', border: '1px solid var(--button-border)', boxShadow: 'var(--button-shadow)' }}>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="project-card__link-icon" />
                Live Demo
              </a>
            </Button>
          )}
          {project.homepageUrl && (
            <Button variant="outline" size="sm" asChild style={{ background: 'var(--button-bg)', color: 'var(--button-text)', border: '1px solid var(--button-border)', boxShadow: 'var(--button-shadow)' }}>
              <a href={project.homepageUrl} target="_blank" rel="noopener noreferrer">
                <Home className="project-card__link-icon" />
                Homepage
              </a>
            </Button>
          )}
        </div>
        {project.updatedAt && (
          <div className="project-card-updated" style={{ color: 'var(--card-list-item-color)' }}>
            <Clock className="project-card__updated-icon" />
            Last updated: {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
