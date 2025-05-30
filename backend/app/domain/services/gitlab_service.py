from typing import List, Dict, Any
from app.domain.models.project import Project
from app.domain.repositories.project_repository import ProjectRepository
from app.core.gitlab import fetch_user_repositories, create_project_from_repo

class GitLabService:
    def __init__(self, project_repository: ProjectRepository):
        self._project_repository = project_repository

    async def sync_projects(self, username: str) -> List[Dict[str, Any]]:
        """Sync projects from GitLab repositories."""
        repos = fetch_user_repositories(username)
        projects = []

        for repo in repos:
            project_data = create_project_from_repo(repo)
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

    async def get_projects(self, username: str) -> List[Project]:
        """Get all GitLab projects for a user."""
        return self._project_repository.get_by_source(
            source_type="gitlab",
            source_username=username
        ) 