from typing import List, Dict, Any, Optional
import logging
from app.domain.repositories.project_repository import ProjectRepository
from app.domain.models.project import Project
from app.domain.models.user import User
from app.core.github import fetch_user_repositories, create_project_from_repo
from app.core.gitlab import fetch_user_repositories as fetch_gitlab_repositories, create_project_from_repo as create_project_from_gitlab_repo

logger = logging.getLogger(__name__)

class ProjectService:
    def __init__(self, project_repository: ProjectRepository):
        self._project_repository = project_repository

    async def get_all_projects(self) -> List[Project]:
        """Get all projects."""
        return self._project_repository.get_all()

    async def get_project(self, project_id: int) -> Optional[Project]:
        """Get a project by ID."""
        return self._project_repository.get(project_id)

    async def create_project(self, project: Project) -> Project:
        """Create a new project."""
        return self._project_repository.create(project)

    async def update_project(self, project_id: int, project: Project) -> Optional[Project]:
        """Update a project."""
        return self._project_repository.update(project_id, project)

    async def delete_project(self, project_id: int) -> bool:
        """Delete a project."""
        return self._project_repository.delete(project_id)

    async def import_github_projects(self, username: str) -> List[Dict[str, Any]]:
        """Import projects from GitHub."""
        repos = fetch_user_repositories(username)
        projects = []

        for repo in repos:
            project_data = create_project_from_repo(repo)
            existing = self._project_repository.get_by_name_and_source(
                name=repo["name"],
                source_type="github",
                source_username=username
            )

            if existing:
                # Update existing project
                for key, value in project_data.items():
                    setattr(existing, key, value)
                self._project_repository.update(existing.id, existing)
            else:
                # Create new project
                project = Project(**project_data)
                self._project_repository.create(project)
            projects.append(project_data)

        return projects

    async def import_gitlab_projects(self, username: str) -> List[Dict[str, Any]]:
        """Import projects from GitLab."""
        repos = fetch_gitlab_repositories(username)
        projects = []

        for repo in repos:
            project_data = create_project_from_gitlab_repo(repo)
            existing = self._project_repository.get_by_name_and_source(
                name=repo["name"],
                source_type="gitlab",
                source_username=username
            )

            if existing:
                # Update existing project
                for key, value in project_data.items():
                    setattr(existing, key, value)
                self._project_repository.update(existing.id, existing)
            else:
                # Create new project
                project = Project(**project_data)
                self._project_repository.create(project)
            projects.append(project_data)

        return projects

    async def sync_github_projects(self, user: User, projects_data: List[Dict[str, Any]] = None) -> List[Project]:
        """
        Synchronize GitHub projects for a user.
        
        Args:
            user: User model instance
            projects_data: Optional list of project data to sync. If None, fetches from GitHub API.
            
        Returns:
            List of synced projects
        """
        if projects_data is None:
            logger.debug(f"Fetching repositories for user: {user.email}")
            projects_data = fetch_user_repositories(user.github_username)

        synced_projects = []
        for repo in projects_data:
            logger.debug(f"Processing repository: {repo['name']}")
            project_data = create_project_from_repo(repo)
            project = Project(**project_data)
            
            # Check if project already exists
            existing = self._project_repository.get_by_name_and_source(
                name=repo["name"],
                source_type="github"
            )

            if existing:
                logger.debug(f"Updating existing project: {repo['name']}")
                # Update existing project
                project = self._project_repository.update(
                    project_id=existing.id,
                    project=project
                )
            else:
                logger.debug(f"Creating new project: {repo['name']}")
                # Create new project
                project = self._project_repository.create(project)
            
            synced_projects.append(project)

        logger.debug(f"Successfully synced {len(synced_projects)} projects")
        return synced_projects

    async def get_visible_projects(self) -> List[Project]:
        """Get all visible projects."""
        return self._project_repository.get_visible()

    async def get_visible_project(self, project_id: int) -> Optional[Project]:
        """Get a visible project by ID."""
        project = await self.get_project(project_id)
        if project and project.is_visible:
            return project
        return None 