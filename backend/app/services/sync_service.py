import logging
from typing import List
from sqlalchemy.orm import Session
from app.models.project import Project
from app.services.github import sync_github_projects
from app.services.gitlab import sync_gitlab_projects
from app.models.user import User

logger = logging.getLogger(__name__)

class SyncService:
    def __init__(self, db: Session):
        self.db = db

    async def sync_projects(self, username: str) -> List[Project]:
        """Sync projects for a user from both GitHub and GitLab"""
        try:
            # Get or create user
            user = (
                self.db.query(User)
                .filter(User.github_username == username)
                .first()
            )
            
            if not user:
                logger.warning(f"No user found with username: {username}")
                return []

            # Sync from both platforms
            github_projects = await sync_github_projects(self.db, user)
            gitlab_projects = await sync_gitlab_projects(self.db, user)

            return github_projects + gitlab_projects

        except Exception as e:
            logger.error(f"Sync failed for user {username}: {str(e)}")
            raise 