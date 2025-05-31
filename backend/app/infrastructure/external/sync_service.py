from datetime import datetime
from sqlalchemy.orm import Session
from app.domain.models.project import Project, ProjectStatus
from app.core.github import fetch_user_repositories, fetch_languages
from app.core.gitlab import fetch_user_repositories as fetch_gitlab_repositories
import logging
from typing import List
from app.infrastructure.database.repositories.project_repository_impl import SQLAlchemyProjectRepository

logger = logging.getLogger(__name__)

class SyncService:
    def __init__(self, db: Session):
        self._db = db
        self._project_repository = SQLAlchemyProjectRepository(db)

    async def sync_projects(self, username: str, source_type: str = "github") -> List[Project]:
        """Sync projects from external source (GitHub/GitLab)"""
        logger.info(f"Syncing projects for {username} from {source_type}")
        
        repos = fetch_user_repositories(username) if source_type == "github" else fetch_gitlab_repositories(username)
        if not repos:
            logger.warning(f"No repositories found for {username} on {source_type}")
            return []

        synced_projects = []
        for repo in repos:
            if not repo:
                continue
                
            # Log repository status
            is_archived = repo.get('archived', False)
            has_release = repo.get('has_releases', False)
            is_prerelease = repo.get('is_prerelease', False)
            
            # Set status based on archived and release status
            if is_archived:
                status = ProjectStatus.ARCHIVED
            elif has_release and not is_prerelease:
                status = ProjectStatus.ACTIVE
            else:
                status = ProjectStatus.WIP
                
            logger.info(f"Repository {repo.get('name', '')} is {status} on {source_type} (archived: {is_archived}, has_release: {has_release}, is_prerelease: {is_prerelease})")
            
            # Log language information
            primary_language = repo.get("language")
            logger.info(f"Repository {repo.get('name', '')} primary language: {primary_language}")
            
            # Get languages map from GitHub API
            languages_map = {}
            if source_type == "github":
                owner = repo.get("owner", {}).get("login")
                repo_name = repo.get("name")
                if owner and repo_name:
                    try:
                        languages_map = fetch_languages(owner, repo_name)
                        logger.info(f"Repository {repo_name} languages map: {languages_map}")
                    except Exception as e:
                        logger.error(f"Failed to fetch languages for {repo_name}: {str(e)}")
            
            # GitHub/GitLab liefert topics als Liste, das ist genau was wir brauchen
            topics = repo.get("topics", []) or []
            
            # Extrahiere owner/namespace Daten
            owner = repo.get("owner", {}) or {}
            namespace = repo.get("namespace", {}) or {}
            
            project = Project(
                name=repo.get("name", ""),
                description=repo.get("description") or "",
                status=status,
                source_type=source_type,
                source_url=repo.get("html_url") or repo.get("web_url"),
                source_username=owner.get("login") if source_type == "github" else namespace.get("username"),
                source_repo=repo.get("name") if source_type == "github" else repo.get("path"),
                live_url=repo.get("homepage"),
                thumbnail_url=owner.get("avatar_url") or namespace.get("avatar_url"),
                details={
                    "default_branch": repo.get("default_branch"),
                    "open_issues": repo.get("open_issues_count", 0),
                    "license": repo.get("license", {}).get("name") if repo.get("license") else None,
                    "size": repo.get("size"),
                    "has_wiki": repo.get("has_wiki", False),
                    "has_pages": repo.get("has_pages", False),
                    "languages_map": languages_map,
                    "fields_visibility": {
                        "title": True,
                        "description": True,
                        "imageUrl": True,
                        "githubUrl": True,
                        "liveUrl": True,
                        "technologies": True,
                        "status": True,
                        "language": True,
                        "topics": True,
                        "starsCount": True,
                        "forksCount": True,
                        "watchersCount": True,
                        "homepageUrl": True
                    }
                },
                display_order=0,
                is_visible=True,
                stars_count=repo.get("stargazers_count", 0) or repo.get("star_count", 0),
                forks_count=repo.get("forks_count", 0),
                watchers_count=repo.get("watchers_count", 0),
                language=repo.get("language"),
                topics=topics,
                last_updated=repo.get("updated_at"),
                homepage_url=repo.get("homepage"),
                open_issues_count=repo.get("open_issues_count", 0),
                default_branch=repo.get("default_branch")
            )

            existing = self._project_repository.get_by_name_and_source(
                name=repo.get("name", ""),
                source_type=source_type,
                source_username=username
            )

            if existing:
                logger.info(f"Updating existing project: {repo.get('name', '')}")
                updated_project = self._project_repository.update(existing.id, project)
                if updated_project:
                    synced_projects.append(updated_project)
            else:
                logger.info(f"Creating new project: {repo.get('name', '')}")
                created_project = self._project_repository.create(project)
                if created_project:
                    synced_projects.append(created_project)

        logger.info(f"Successfully synced {len(synced_projects)} projects")
        return synced_projects 