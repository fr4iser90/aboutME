from datetime import datetime
from sqlalchemy.orm import Session
from app.domain.models.project import Project
from app.core.github import fetch_user_repositories
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
                
            # GitHub/GitLab liefert topics als Liste, das ist genau was wir brauchen
            topics = repo.get("topics", []) or []
            
            # Extrahiere owner/namespace Daten
            owner = repo.get("owner", {}) or {}
            namespace = repo.get("namespace", {}) or {}
            
            project = Project(
                name=repo.get("name", ""),
                description=repo.get("description") or "",
                status="WIP",
                source_type=source_type,
                source_url=repo.get("html_url") or repo.get("web_url"),
                github_username=owner.get("login") if source_type == "github" else None,
                github_repo=repo.get("name") if source_type == "github" else None,
                gitlab_username=namespace.get("username") if source_type == "gitlab" else None,
                gitlab_repo=repo.get("path") if source_type == "gitlab" else None,
                live_url=repo.get("homepage"),
                thumbnail_url=owner.get("avatar_url") or namespace.get("avatar_url"),
                details={
                    "default_branch": repo.get("default_branch"),
                    "open_issues": repo.get("open_issues_count", 0),
                    "license": repo.get("license", {}).get("name") if repo.get("license") else None,
                    "size": repo.get("size"),
                    "has_wiki": repo.get("has_wiki", False),
                    "has_pages": repo.get("has_pages", False)
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
                updated_project = self._project_repository.update(existing.id, project)
                if updated_project:
                    synced_projects.append(updated_project)
            else:
                created_project = self._project_repository.create(project)
                if created_project:
                    synced_projects.append(created_project)

        logger.info(f"Successfully synced {len(synced_projects)} projects")
        return synced_projects 