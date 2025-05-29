from typing import List
import logging
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.project import Project
from app.core.github import fetch_user_repositories, create_project_from_repo

logger = logging.getLogger(__name__)

async def sync_github_projects(db: Session, user: User) -> List[dict]:
    """
    Synchronize GitHub projects for a user.
    
    Args:
        db: Database session
        user: User model instance
        
    Returns:
        List of synced project data
    """
    logger.debug(f"Fetching repositories for user: {user.email}")
    repos = fetch_user_repositories(user.github_username)
    projects = []

    for repo in repos:
        logger.debug(f"Processing repository: {repo['name']}")
        project_data = create_project_from_repo(repo)
        
        # Check if project already exists
        existing = (
            db.query(Project)
            .filter(
                Project.github_username == user.github_username,
                Project.github_repo == repo["name"]
            )
            .first()
        )

        if existing:
            logger.debug(f"Updating existing project: {repo['name']}")
            # Update existing project
            for key, value in project_data.items():
                setattr(existing, key, value)
            db.add(existing)
            projects.append(existing)
        else:
            logger.debug(f"Creating new project: {repo['name']}")
            # Create new project
            project = Project(**project_data)
            db.add(project)
            projects.append(project)

    try:
        db.commit()
        logger.debug(f"Successfully synced {len(projects)} projects")
        return projects
    except Exception as e:
        logger.error(f"Error committing projects to database: {str(e)}")
        db.rollback()
        raise 