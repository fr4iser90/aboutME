from typing import List
import logging
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.project import Project
from app.core.gitlab import fetch_user_projects, create_project_from_gitlab

logger = logging.getLogger(__name__)

async def sync_gitlab_projects(db: Session, user: User) -> List[dict]:
    """
    Synchronize GitLab projects for a user.
    
    Args:
        db: Database session
        user: User model instance
        
    Returns:
        List of synced project data
    """
    logger.debug(f"Fetching projects for user: {user.email}")
    projects_data = fetch_user_projects(user.github_username)  # We reuse github_username for GitLab
    projects = []

    for project_data in projects_data:
        logger.debug(f"Processing project: {project_data['name']}")
        project_info = create_project_from_gitlab(project_data)
        
        # Check if project already exists
        existing = (
            db.query(Project)
            .filter(
                Project.github_username == user.github_username,  # We reuse github_username for GitLab
                Project.github_repo == project_data["name"]
            )
            .first()
        )

        if existing:
            logger.debug(f"Updating existing project: {project_data['name']}")
            # Update existing project
            for key, value in project_info.items():
                setattr(existing, key, value)
            db.add(existing)
            projects.append(existing)
        else:
            logger.debug(f"Creating new project: {project_data['name']}")
            # Create new project
            project = Project(**project_info)
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