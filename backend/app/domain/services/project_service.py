from typing import List, Dict, Any, Optional
import logging
from app.domain.repositories.project_repository import ProjectRepository
from app.domain.models.project import Project
from app.domain.models.user import User
from app.core.github import fetch_user_repositories, create_project_from_repo
from app.core.gitlab import fetch_user_repositories as fetch_gitlab_repositories, create_project_from_repo as create_project_from_gitlab_repo
from app.schemas.project import ProjectStatus, GitHubProjectImport # Removed ProjectUpdate, ProjectCreate as they are not directly passed

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
        # This method expects a Project domain model instance
        return self._project_repository.create(project)

    async def update_project(self, project_id: int, project: Project) -> Optional[Project]:
        """Update a project."""
        # This method expects a Project domain model instance
        return self._project_repository.update(project_id, project)

    async def delete_project(self, project_id: int) -> bool:
        """Delete a project."""
        return self._project_repository.delete(project_id)

    async def import_github_projects(self, projects: List[GitHubProjectImport]) -> List[Project]:
        """Import projects from GitHub"""
        imported_projects = []
        logger.info(f"--- Starting import_github_projects for {len(projects)} projects ---")
        
        for i, project_data in enumerate(projects): # project_data is of type GitHubProjectImport
            logger.info(f"Importing project {i+1}/{len(projects)}: Name='{project_data.name}', Parsed GitHub Username='{project_data.github_username}', Archived='{project_data.archived}'")
            
            source_username_to_check = project_data.github_username if project_data.github_username else "unknown_github_user"
            logger.info(f"Looking for existing project with: name='{project_data.name}', source_type='github', source_username='{source_username_to_check}'")
            
            existing_project = self._project_repository.get_by_name_and_source(
                name=project_data.name,
                source_type="github",
                source_username=source_username_to_check
            )
            
            current_status = ProjectStatus.ARCHIVED if project_data.archived else ProjectStatus.WIP

            if existing_project:
                logger.info(f"Found existing project ID: {existing_project.id} for '{project_data.name}'. Updating.")
                # Update existing project domain model
                existing_project.description = project_data.description
                existing_project.source_url = project_data.source_url # Populated by alias from html_url
                existing_project.live_url = project_data.live_url     # Populated by alias from homepage
                existing_project.thumbnail_url = project_data.thumbnail_url
                existing_project.details = project_data.details
                existing_project.is_visible = project_data.is_visible
                existing_project.status = current_status
                # Add other fields from GitHubProjectImport that map to Project domain model if necessary
                # e.g., existing_project.name = project_data.name (though name is used for lookup)
                
                updated_project = await self.update_project(existing_project.id, existing_project)
                if updated_project:
                    imported_projects.append(updated_project)
            else:
                # Create new project domain model
                # Ensure all fields required by Project domain model are present
                logger.info(f"Creating new project for '{project_data.name}' with github_username='{project_data.github_username}'")
                new_project_domain = Project(
                    name=project_data.name,
                    description=project_data.description,
                    source_type="github", # Explicitly set for new GitHub imports
                    source_url=project_data.source_url, # Populated by alias from html_url
                    live_url=project_data.live_url,     # Populated by alias from homepage
                    thumbnail_url=project_data.thumbnail_url,
                    details=project_data.details,
                    is_visible=project_data.is_visible,
                    status=current_status,
                    # Ensure default values for other Project fields are acceptable or set them
                    display_order=0, # Example: ensure display_order has a default
                    github_username=project_data.github_username, # Pass it to the domain model
                    # Optional GitHub specific fields from domain model can be set if available in GitHubProjectImport
                    # and if GitHubProjectImport is extended to include them (currently it doesn't have stars, forks etc.)
                )
                new_project = await self.create_project(new_project_domain)
                imported_projects.append(new_project)
        
        return imported_projects

    async def import_gitlab_projects(self, username: str) -> List[Dict[str, Any]]: # Keeping original return type for now
        """Import projects from GitLab."""
        # This method might need similar review if it has issues
        repos = fetch_gitlab_repositories(username)
        projects_to_return = [] # Changed variable name to avoid confusion with domain 'projects'

        for repo_raw_data in repos: # Renamed for clarity
            project_data_dict = create_project_from_gitlab_repo(repo_raw_data) # This returns a Dict
            
            # Determine status based on 'archived' key from GitLab data
            is_archived_gitlab = project_data_dict.get('archived', False)
            current_status_gitlab = ProjectStatus.ARCHIVED if is_archived_gitlab else ProjectStatus.WIP

            # Removed await as get_by_name_and_source is synchronous
            # Also, ensure source_username is passed if the method requires it.
            # Assuming username (passed to import_gitlab_projects) is the gitlab username.
            existing = self._project_repository.get_by_name_and_source(
                name=project_data_dict["name"],
                source_type="gitlab", 
                source_username=username # Pass the username for GitLab source
            )

            if existing:
                # Update existing project domain model
                for key, value in project_data_dict.items():
                    if hasattr(existing, key) and key != 'archived': # Exclude 'archived' from direct setattr
                        setattr(existing, key, value)
                existing.status = current_status_gitlab
                self._project_repository.update(existing.id, existing)
                projects_to_return.append(existing.model_dump()) # Or however you want to return it
            else:
                # Create new project domain model
                # Filter out 'archived' before creating Project instance
                domain_data_for_create = {k: v for k, v in project_data_dict.items() if k != 'archived'}
                domain_data_for_create['status'] = current_status_gitlab
                domain_data_for_create['source_type'] = "gitlab" # Ensure source_type

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
            logger.info(f"Fetching repositories for user: {user.github_username}") # Use user.github_username
            # Assuming fetch_user_repositories returns list of raw repo dicts from GitHub API
            projects_data_list = await fetch_user_repositories(user.github_username) 

        synced_projects_list = []
        for repo_raw_data in projects_data_list: # This is raw repo data from GitHub API
            logger.info(f"Processing repository: {repo_raw_data['name']}")
            
            # Use create_project_from_repo to get a standardized dict, which includes 'archived'
            # This dict is what the frontend also likely uses as a base.
            standardized_repo_dict = create_project_from_repo(repo_raw_data)

            is_archived = standardized_repo_dict.get('archived', False)
            logger.info(f"Repository {repo_raw_data['name']} is {'archived' if is_archived else 'active'} on GitHub. Status to set: {ProjectStatus.ARCHIVED if is_archived else ProjectStatus.WIP}")
            
            current_status = ProjectStatus.ARCHIVED if is_archived else ProjectStatus.WIP
            
            # Removed await as get_by_name_and_source is synchronous
            existing = self._project_repository.get_by_name_and_source(
                name=standardized_repo_dict["name"], # Use name from standardized dict
                source_type="github",
                source_username=standardized_repo_dict.get("github_username", "unknown_github_user") # Add source_username here
            )

            # Prepare data for Project domain model, excluding 'archived' field itself
            # and other fields not part of the Project domain model.
            # create_project_from_repo returns more fields than Project domain model has.
            # We need to map them carefully.
            
            project_domain_data = {
                "name": standardized_repo_dict.get("name"),
                "description": standardized_repo_dict.get("description"),
                "status": current_status,
                "source_type": "github",
                "source_url": standardized_repo_dict.get("source_url"), # html_url from GH
                "live_url": standardized_repo_dict.get("live_url"),     # homepage from GH
                "thumbnail_url": standardized_repo_dict.get("thumbnail_url"),
                "details": standardized_repo_dict.get("details"),
                "is_visible": standardized_repo_dict.get("is_visible", True), # Default if not provided
                # Fields from GitHubFields in Project domain model
                "github_username": standardized_repo_dict.get("github_username"),
                "github_repo": standardized_repo_dict.get("github_repo"),
                "stars_count": standardized_repo_dict.get("stars_count", 0),
                "forks_count": standardized_repo_dict.get("forks_count", 0),
                "watchers_count": standardized_repo_dict.get("watchers_count", 0),
                "language": standardized_repo_dict.get("language"),
                "topics": standardized_repo_dict.get("topics"),
                "last_updated": standardized_repo_dict.get("last_updated"),
                "homepage_url": standardized_repo_dict.get("homepage_url"), # same as live_url
                "open_issues_count": standardized_repo_dict.get("open_issues_count", 0),
                "default_branch": standardized_repo_dict.get("default_branch"),
            }
            # Remove None values if the domain model fields are not Optional and have no defaults
            project_domain_data_cleaned = {k: v for k, v in project_domain_data.items() if v is not None or k in ["description", "live_url", "thumbnail_url", "details", "language", "topics", "last_updated", "homepage_url", "default_branch", "github_username", "github_repo"]}
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
                if "display_order" not in project_domain_data_cleaned: # Example default
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
