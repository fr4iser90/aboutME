from typing import List, Dict, Any, Optional
import logging
from app.domain.repositories.project_repository import ProjectRepository
from app.domain.models.project import Project, ProjectStatus
from app.domain.models.user import User
from app.core.github import fetch_user_repositories, create_project_from_repo
from app.core.gitlab import fetch_user_repositories as fetch_gitlab_repositories, create_project_from_repo as create_project_from_gitlab_repo
from app.schemas.project import GitHubProjectImport

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

    async def import_github_projects(self, projects: List[GitHubProjectImport]) -> List[Project]:
        """Import projects from GitHub"""
        imported_projects = []
        logger.info(f"--- Starting import_github_projects for {len(projects)} projects ---")
        
        for i, project_data in enumerate(projects):
            logger.info(f"Importing project {i+1}/{len(projects)}: Name='{project_data.name}', Source Username='{project_data.source_username}', Archived='{project_data.archived_from_github}'")
            
            source_username_to_check = project_data.source_username if project_data.source_username else "unknown_github_user"
            logger.info(f"Looking for existing project with: name='{project_data.name}', source_type='github', source_username='{source_username_to_check}'")
            
            existing_project = self._project_repository.get_by_name_and_source(
                name=project_data.name,
                source_type="github",
                source_username=source_username_to_check
            )
            
            current_status = ProjectStatus.ARCHIVED if project_data.archived_from_github else ProjectStatus.WIP

            if existing_project:
                logger.info(f"Found existing project ID: {existing_project.id} for '{project_data.name}'. Updating.")
                existing_project.description = project_data.description
                existing_project.source_url = project_data.source_url
                existing_project.live_url = project_data.live_url
                existing_project.thumbnail_url = project_data.thumbnail_url
                existing_project.details = project_data.details
                existing_project.is_visible = project_data.is_visible
                existing_project.status = current_status
                
                updated_project = await self.update_project(existing_project.id, existing_project)
                if updated_project:
                    imported_projects.append(updated_project)
            else:
                logger.info(f"Creating new project for '{project_data.name}' with source_username='{project_data.source_username}'")
                new_project_domain = Project(
                    name=project_data.name,
                    description=project_data.description,
                    source_type="github",
                    source_url=project_data.source_url,
                    source_username=project_data.source_username,
                    source_repo=project_data.source_repo,
                    live_url=project_data.live_url,
                    thumbnail_url=project_data.thumbnail_url,
                    details=project_data.details,
                    is_visible=project_data.is_visible,
                    status=current_status,
                    display_order=0
                )
                new_project = await self.create_project(new_project_domain)
                imported_projects.append(new_project)
        
        return imported_projects

    async def import_gitlab_projects(self, username: str) -> List[Dict[str, Any]]:
        """Import projects from GitLab."""
        repos = fetch_gitlab_repositories(username)
        projects_to_return = []

        for repo_raw_data in repos:
            project_data_dict = create_project_from_gitlab_repo(repo_raw_data)
            
            is_archived_gitlab = project_data_dict.get('archived', False)
            current_status_gitlab = ProjectStatus.ARCHIVED if is_archived_gitlab else ProjectStatus.WIP

            existing = self._project_repository.get_by_name_and_source(
                name=project_data_dict["name"],
                source_type="gitlab", 
                source_username=username
            )

            if existing:
                for key, value in project_data_dict.items():
                    if hasattr(existing, key) and key != 'archived':
                        setattr(existing, key, value)
                existing.status = current_status_gitlab
                self._project_repository.update(existing.id, existing)
                projects_to_return.append(existing.model_dump())
            else:
                domain_data_for_create = {k: v for k, v in project_data_dict.items() if k != 'archived'}
                domain_data_for_create['status'] = current_status_gitlab
                domain_data_for_create['source_type'] = "gitlab"
                domain_data_for_create['source_username'] = username
                domain_data_for_create['source_repo'] = project_data_dict.get('path')

                new_project = Project(**domain_data_for_create)
                created_project = self._project_repository.create(new_project)
                projects_to_return.append(created_project.model_dump())
        
        return projects_to_return

    async def sync_github_projects(self, user: User, projects_data_list: List[Dict[str, Any]] = None) -> List[Project]:
        """
        Synchronize GitHub projects for a user.
        This is for the full sync, typically run by the scheduler or a sync button.
        """
        if projects_data_list is None:
            logger.info(f"Fetching repositories for user: {user.source_username}")
            projects_data_list = await fetch_user_repositories(user.source_username)

        synced_projects_list = []
        for repo_raw_data in projects_data_list:
            logger.info(f"Processing repository: {repo_raw_data['name']}")
            
            standardized_repo_dict = create_project_from_repo(repo_raw_data)

            is_archived = standardized_repo_dict.get('archived', False)
            logger.info(f"Repository {repo_raw_data['name']} is {'archived' if is_archived else 'active'} on GitHub. Status to set: {ProjectStatus.ARCHIVED if is_archived else ProjectStatus.WIP}")
            
            current_status = ProjectStatus.ARCHIVED if is_archived else ProjectStatus.WIP
            
            existing = self._project_repository.get_by_name_and_source(
                name=standardized_repo_dict["name"],
                source_type="github",
                source_username=standardized_repo_dict.get("source_username", "unknown_github_user")
            )

            project_domain_data = {
                "name": standardized_repo_dict.get("name"),
                "description": standardized_repo_dict.get("description"),
                "status": current_status,
                "source_type": "github",
                "source_url": standardized_repo_dict.get("source_url"),
                "source_username": standardized_repo_dict.get("source_username"),
                "source_repo": standardized_repo_dict.get("source_repo"),
                "live_url": standardized_repo_dict.get("live_url"),
                "thumbnail_url": standardized_repo_dict.get("thumbnail_url"),
                "details": standardized_repo_dict.get("details"),
                "is_visible": standardized_repo_dict.get("is_visible", True),
                "stars_count": standardized_repo_dict.get("stars_count", 0),
                "forks_count": standardized_repo_dict.get("forks_count", 0),
                "watchers_count": standardized_repo_dict.get("watchers_count", 0),
                "language": standardized_repo_dict.get("language"),
                "topics": standardized_repo_dict.get("topics"),
                "last_updated": standardized_repo_dict.get("last_updated"),
                "homepage_url": standardized_repo_dict.get("homepage_url"),
                "open_issues_count": standardized_repo_dict.get("open_issues_count", 0),
                "default_branch": standardized_repo_dict.get("default_branch"),
            }
            # Remove None values if the domain model fields are not Optional and have no defaults
            project_domain_data_cleaned = {k: v for k, v in project_domain_data.items() if v is not None or k in ["description", "live_url", "thumbnail_url", "details", "language", "topics", "last_updated", "homepage_url", "default_branch", "source_username", "source_repo"]}
            # Special handling for description to ensure it's a string
            if project_domain_data_cleaned.get("description") is None:
                project_domain_data_cleaned["description"] = ""

            if existing:
                logger.info(f"Updating existing project: {standardized_repo_dict['name']}")
                # Update existing project domain model
                for key, value in project_domain_data_cleaned.items():
                    if hasattr(existing, key):
                        setattr(existing, key, value)
                # Ensure status is set, as it might not be in project_domain_data_cleaned if it was None
                existing.status = current_status 
                
                updated_project = await self._project_repository.update(
                    project_id=existing.id,
                    project=existing 
                )
                if updated_project:
                    synced_projects_list.append(updated_project)
            else:
                logger.info(f"Creating new project: {standardized_repo_dict['name']}")
                # Create new project using the mapped and cleaned data
                # Ensure all required fields for Project() are present
                if "display_order" not in project_domain_data_cleaned:
                    project_domain_data_cleaned["display_order"] = 0

                project_to_create = Project(**project_domain_data_cleaned)
                created_project = await self._project_repository.create(project_to_create)
                synced_projects_list.append(created_project)
            
        logger.info(f"Successfully synced {len(synced_projects_list)} projects")
        return synced_projects_list

    async def get_visible_projects(self) -> List[Project]:
        """Get all visible projects."""
        return self._project_repository.get_visible()

    async def get_visible_project(self, project_id: int) -> Optional[Project]:
        """Get a visible project by ID."""
        project = await self.get_project(project_id)
        if project and project.is_visible:
            return project
        return None
