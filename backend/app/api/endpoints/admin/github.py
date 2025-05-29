from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from app.core.auth import get_current_user
from app.db.session import get_db
from app import crud, schemas
from app.models.user import User
from app.models.project import Project
from app.core.github import fetch_user_repositories, create_project_from_repo

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/sync")
async def sync_github(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sync projects from GitHub repositories."""
    logger.debug(f"GitHub sync requested by user: {current_user.email}")
    try:
        logger.debug("Starting GitHub sync process")
        repos = fetch_user_repositories(username)
        projects = []

        for repo in repos:
            project_data = create_project_from_repo(repo)
            # Check if project already exists
            existing = (
                db.query(Project)
                .filter(
                    Project.github_username == username, 
                    Project.github_repo == repo["name"]
                )
                .first()
            )

            if existing:
                # Update existing project
                for key, value in project_data.items():
                    setattr(existing, key, value)
                db.add(existing)
            else:
                # Create new project
                project = Project(**project_data)
                db.add(project)
            projects.append(project_data)

        db.commit()
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all GitHub projects for a user."""
    return db.query(Project).filter(Project.github_username == username).all() 