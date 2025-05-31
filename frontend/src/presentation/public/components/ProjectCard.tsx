import { Project } from '@/domain/entities/Project';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Star, GitFork, Eye, AlertCircle, Home, Clock } from 'lucide-react';
import Image from 'next/image';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card className="flex flex-col h-full">
      {project.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
      )}
      <CardHeader>
        <h3 className="text-xl font-semibold">{project.title}</h3>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies?.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
        {project.details?.languages_map && Object.keys(project.details.languages_map).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Languages:</span>
            {Object.keys(project.details.languages_map).map((lang) => (
              <Badge key={lang} variant="outline" className="bg-blue-900/30 text-blue-300">
                {lang}
              </Badge>
            ))}
          </div>
        )}
        {project.topics && project.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Topics:</span>
            {project.topics.map((topic) => (
              <Badge key={topic} variant="outline" className="bg-purple-900/30 text-purple-300">
                {topic}
              </Badge>
            ))}
          </div>
        )}
        {project.status && (
          <div className="mt-2">
            <Badge variant={project.status === 'ACTIVE' ? 'default' : 'destructive'}>
              Status: {project.status}
            </Badge>
          </div>
        )}

        {/* GitHub Stats */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          {typeof project.starsCount === 'number' && (
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              <span>{project.starsCount} Stars</span>
            </div>
          )}
          {typeof project.forksCount === 'number' && (
            <div className="flex items-center">
              <GitFork className="w-4 h-4 mr-1" />
              <span>{project.forksCount} Forks</span>
            </div>
          )}
          {typeof project.watchersCount === 'number' && (
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{project.watchersCount} Watchers</span>
            </div>
          )}
          {typeof project.openIssuesCount === 'number' && (
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>{project.openIssuesCount} Open Issues</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 pt-4">
        <div className="flex flex-wrap gap-2">
          {project.githubUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </Button>
          )}
          {project.liveUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Live Demo
              </a>
            </Button>
          )}
          {project.homepageUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.homepageUrl} target="_blank" rel="noopener noreferrer">
                <Home className="w-4 h-4 mr-2" />
                Homepage
              </a>
            </Button>
          )}
        </div>
        {project.updatedAt && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 self-start flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Last updated: {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
