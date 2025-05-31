import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { config } from '@/shared/utils/config';
import { Project, ViewMode, SortField, SortOrder } from '@/domain/entities/Project'; // Updated import path

interface ProjectListProps {
  onEdit: (project: Project) => void; // Project type now comes from domain/entities
}

export function ProjectList({ onEdit }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt'); // Default sort field changed
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${config.backendUrl}/api/admin/projects`, {
          credentials: 'include',
        });

        if (response.status === 401) {
          console.error('Unauthorized: Failed to fetch projects. Redirecting to login.');
          await fetch(`${config.backendUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' });
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch projects. Status: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  const handleDelete = async (id: string) => { // Changed id to string
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/admin/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.status === 401) {
        console.error('Unauthorized: Failed to delete project. Redirecting to login.');
        await fetch(`${config.backendUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to delete project. Status: ${response.status}`);
      }

      setProjects(projects.filter(project => project.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const filteredProjects = projects
    .filter(project => {
      if (!project) return false;
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (project.title?.toLowerCase() || '').includes(searchLower) || // Changed project.name to project.title
        (project.description?.toLowerCase() || '').includes(searchLower) ||
        (project.technologies || []).some(tech => // Changed project.topics to project.technologies for search
          (tech?.toLowerCase() || '').includes(searchLower)
        ) ||
        (project.topics || []).some(topic => // Also search in topics if it exists
          (topic?.toLowerCase() || '').includes(searchLower)
        );
      
      const projectStatus = project.status?.toUpperCase(); // Normalize status for comparison
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && (projectStatus === 'WIP' || projectStatus === 'ACTIVE')) || // Consider ACTIVE as well
        (statusFilter === 'archived' && projectStatus === 'ARCHIVED');
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      const modifier = sortOrder === 'asc' ? 1 : -1;

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        const dateA = fieldA ? new Date(fieldA as Date).getTime() : 0;
        const dateB = fieldB ? new Date(fieldB as Date).getTime() : 0;
        if (dateA < dateB) return -1 * modifier;
        if (dateA > dateB) return 1 * modifier;
        return 0;
      } else {
        // Ensure consistent string comparison for other fields like 'title'
        const stringA = String(fieldA || '').toLowerCase();
        const stringB = String(fieldB || '').toLowerCase();
        if (stringA < stringB) return -1 * modifier;
        if (stringA > stringB) return 1 * modifier;
        return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortField(field as SortField);
              setSortOrder(order as SortOrder);
            }}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="title-asc">Title (A-Z)</option> 
            <option value="title-desc">Title (Z-A)</option>
            <option value="updatedAt-desc">Recently Updated</option>
            <option value="createdAt-desc">Recently Created</option>
            {/* <option value="last_updated-desc">Last Activity</option>  Domain Project does not have last_updated directly */}
          </select>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>

      {/* Project List/Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
        {filteredProjects?.map((project) => (
          <div
            key={project?.id || Math.random().toString()} // Ensure key is string
            className={`galaxy-card rounded-lg shadow-md overflow-hidden ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            {project?.imageUrl && ( // Changed from thumbnail_url to imageUrl
              <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                <img
                  src={project.imageUrl} // Changed from thumbnail_url
                  alt={project?.title || 'Project thumbnail'} // Changed from name to title
                  className={`${
                    viewMode === 'list' ? 'h-full w-48' : 'w-full h-48'
                  } object-cover`}
                />
              </div>
            )}
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold galaxy-text">
                  {project?.title || 'Untitled Project'} {/* Changed from name to title */}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  project?.status?.toUpperCase() === 'WIP' || project?.status?.toUpperCase() === 'ACTIVE'
                    ? 'bg-green-900/30 text-green-300' 
                    : project?.status?.toUpperCase() === 'ARCHIVED' 
                      ? 'bg-yellow-900/30 text-yellow-300' // Changed 'Completed' to 'ARCHIVED' for consistency
                      : 'bg-slate-900/30 text-slate-300'
                }`}>
                  {project?.status || 'unknown'}
                </span>
              </div>
              <p className="mt-2 text-slate-300 line-clamp-3">
                {project?.description || 'No description available'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(project?.technologies || []).map((tech, index) => ( // Changed from topics to technologies
                  <span
                    key={`${tech}-${index}`}
                    className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm"
                  >
                    {tech || 'Unknown Technology'}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="space-x-2 text-sm text-slate-400">
                  <span>Updated: {project?.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}</span> {/* Assumes updatedAt is Date object */}
                </div>
                <div className="space-x-2">
                  {project?.githubUrl && ( // Changed from source_url to githubUrl
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="galaxy-text hover:underline"
                    >
                      Source
                    </a>
                  )}
                  {project?.liveUrl && ( // Changed from live_url to liveUrl
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="galaxy-text hover:underline"
                    >
                      Live
                    </a>
                  )}
                  <button
                    onClick={() => project && onEdit(project)}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => project?.id && handleDelete(project.id)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
