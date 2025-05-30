import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { config } from '@/lib/config';
import { Project, ViewMode, SortField, SortOrder } from '@/types/project';

interface ProjectListProps {
  onEdit: (project: Project) => void;
}

export function ProjectList({ onEdit }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [sortField, setSortField] = useState<SortField>('updated_at');
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

  const handleDelete = async (id: number) => {
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
        (project.name?.toLowerCase() || '').includes(searchLower) ||
        (project.description?.toLowerCase() || '').includes(searchLower) ||
        (project.topics || []).some(topic => 
          (topic?.toLowerCase() || '').includes(searchLower)
        );
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && project.status === 'WIP') ||
        (statusFilter === 'archived' && project.status === 'Archived');
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const modifier = sortOrder === 'asc' ? 1 : -1;
      return aValue < bValue ? -1 * modifier : aValue > bValue ? 1 * modifier : 0;
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
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="updated_at-desc">Recently Updated</option>
            <option value="created_at-desc">Recently Created</option>
            <option value="last_updated-desc">Last Activity</option>
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
            key={project?.id || Math.random()}
            className={`galaxy-card rounded-lg shadow-md overflow-hidden ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            {project?.thumbnail_url && (
              <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                <img
                  src={project.thumbnail_url}
                  alt={project?.name || 'Project thumbnail'}
                  className={`${
                    viewMode === 'list' ? 'h-full w-48' : 'w-full h-48'
                  } object-cover`}
                />
              </div>
            )}
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold galaxy-text">
                  {project?.name || 'Untitled Project'}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  project?.status === 'WIP' 
                    ? 'bg-green-900/30 text-green-300' 
                    : project?.status === 'Completed' 
                      ? 'bg-blue-900/30 text-blue-300'
                      : 'bg-slate-900/30 text-slate-300'
                }`}>
                  {project?.status || 'unknown'}
                </span>
              </div>
              <p className="mt-2 text-slate-300 line-clamp-3">
                {project?.description || 'No description available'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(project?.topics || []).map((topic, index) => (
                  <span
                    key={`${topic}-${index}`}
                    className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm"
                  >
                    {topic || 'Unknown Topic'}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="space-x-2 text-sm text-slate-400">
                  <span>Updated: {project?.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="space-x-2">
                  {project?.source_url && (
                    <a
                      href={project.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="galaxy-text hover:underline"
                    >
                      Source
                    </a>
                  )}
                  {project?.live_url && (
                    <a
                      href={project.live_url}
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
