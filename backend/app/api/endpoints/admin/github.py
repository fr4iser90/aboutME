from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
import logging
from app.core.auth import get_current_user
from app.domain.models.user import User
from app.domain.services.github_service import GitHubService
from app.infrastructure.database.repositories.project_repository_impl import SQLAlchemyProjectRepository
from app.infrastructure.database.session import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

def get_github_service(db = Depends(get_db)) -> GitHubService:
    repository = SQLAlchemyProjectRepository(db)
    return GitHubService(repository)

@router.post("/sync")
async def sync_github(
    username: str,
    github_service: GitHubService = Depends(get_github_service),
    current_user: User = Depends(get_current_user)
):
    """Sync projects from GitHub repositories."""
    logger.debug(f"GitHub sync requested by user: {current_user.email}")
    try:
        logger.debug("Starting GitHub sync process")
        projects = await github_service.sync_projects(username)
        logger.debug(f"GitHub sync completed successfully. Synced {len(projects)} projects")
        return {"message": "GitHub sync completed successfully", "projects": projects}
    except Exception as e:
        logger.error(f"GitHub sync failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync GitHub projects: {str(e)}"
        )

@router.get("/{username}")
async def get_github_projects(
    username: str,
    github_service: GitHubService = Depends(get_github_service),
    current_user: User = Depends(get_current_user),
):
    """Get all GitHub projects for a user."""
    return await github_service.get_projects(username) 