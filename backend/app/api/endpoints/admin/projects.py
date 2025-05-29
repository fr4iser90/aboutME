from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from app.core.auth import get_current_user
from app.db.session import get_db
from app import crud, schemas
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[schemas.Project])
def list_projects(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """List all projects (admin only)"""
    return crud.crud_project.get_multi(db)

@router.post("/", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new project"""
    return crud.crud_project.create(db, obj_in=project)

@router.put("/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing project"""
    return crud.crud_project.update(db, id=project_id, obj_in=project)

@router.post("/import/github", response_model=List[schemas.Project])
def import_github_projects(
    projects_data: List[schemas.GitHubProjectImport],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Import multiple projects from GitHub"""
    logger.debug(f"GitHub project import requested by user: {current_user.email}")
    try:
        imported_projects = []
        for project_data in projects_data:
            project_create = schemas.ProjectCreate(
                name=project_data.name,
                description=project_data.description,
                source_type="github",
                source_url=project_data.html_url,
                github_username=project_data.owner.get("login") if project_data.owner else None,
                github_repo=project_data.name,
                live_url=project_data.homepage,
                thumbnail_url=None,
                stars_count=project_data.stargazers_count,
                forks_count=project_data.forks_count,
                watchers_count=project_data.watchers_count,
                language=project_data.language,
                topics=project_data.topics,
                last_updated=project_data.updated_at,
                homepage_url=project_data.homepage,
                open_issues_count=project_data.open_issues_count,
                default_branch=project_data.default_branch,
                is_visible=True,
                status="WIP"
            )
            project = crud.crud_project.create(db, obj_in=project_create)
            imported_projects.append(project)
            
        logger.debug(f"Successfully imported {len(imported_projects)} GitHub projects")
        return imported_projects
    except Exception as e:
        logger.error(f"GitHub project import failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import GitHub projects: {str(e)}"
        )

@router.post("/import/gitlab", response_model=List[schemas.Project])
def import_gitlab_projects(
    projects_data: List[schemas.GitLabProjectImport],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Import multiple projects from GitLab"""
    logger.debug(f"GitLab project import requested by user: {current_user.email}")
    try:
        imported_projects = []
        for project_data in projects_data:
            project_create = schemas.ProjectCreate(
                name=project_data.name,
                description=project_data.description,
                source_type="gitlab",
                source_url=project_data.web_url,
                github_username=project_data.namespace.get("path") if project_data.namespace else None,
                github_repo=project_data.name,
                live_url=project_data.homepage,
                thumbnail_url=None,
                stars_count=project_data.star_count,
                forks_count=project_data.forks_count,
                language=project_data.language,
                topics=project_data.topics,
                last_updated=project_data.updated_at,
                homepage_url=project_data.homepage,
                open_issues_count=project_data.open_issues_count,
                default_branch=project_data.default_branch,
                is_visible=project_data.visibility == "public",
                status="WIP" if not project_data.archived else "Archived"
            )
            project = crud.crud_project.create(db, obj_in=project_create)
            imported_projects.append(project)
            
        logger.debug(f"Successfully imported {len(imported_projects)} GitLab projects")
        return imported_projects
    except Exception as e:
        logger.error(f"GitLab project import failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import GitLab projects: {str(e)}"
        )

@router.post("/import/manual", response_model=List[schemas.Project])
def import_manual_projects(
    projects_data: List[schemas.ManualProjectImport],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Import multiple projects manually"""
    logger.debug(f"Manual project import requested by user: {current_user.email}")
    try:
        imported_projects = []
        for project_data in projects_data:
            project_create = schemas.ProjectCreate(
                name=project_data.name,
                description=project_data.description,
                source_type="manual",
                source_url=project_data.source_url,
                live_url=project_data.live_url,
                thumbnail_url=project_data.thumbnail_url,
                language=project_data.language,
                topics=project_data.topics,
                is_visible=project_data.is_visible,
                status=project_data.status
            )
            project = crud.crud_project.create(db, obj_in=project_create)
            imported_projects.append(project)
            
        logger.debug(f"Successfully imported {len(imported_projects)} manual projects")
        return imported_projects
    except Exception as e:
        logger.error(f"Manual project import failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import manual projects: {str(e)}"
        ) 