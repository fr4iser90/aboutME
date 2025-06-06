from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from app.core.auth import get_current_user
from app.domain.models.project import Project
from app.domain.models.user import SiteOwner # Changed User to SiteOwner
from app.domain.services.project_service import ProjectService
from app.schemas import project as schemas
from app.api import deps

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[schemas.Project], response_model_by_alias=True)
async def get_projects(
    db: Session = Depends(deps.get_db),
    project_service: ProjectService = Depends(deps.get_project_service)
):
    return await project_service.get_all_projects()

@router.post("/", response_model=schemas.Project, response_model_by_alias=True)
async def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(deps.get_db),
    project_service: ProjectService = Depends(deps.get_project_service)
):
    return await project_service.create_project(project)

@router.get("/{project_id}", response_model=schemas.Project, response_model_by_alias=True)
async def get_project(
    project_id: int,
    db: Session = Depends(deps.get_db),
    project_service: ProjectService = Depends(deps.get_project_service)
):
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=schemas.Project, response_model_by_alias=True)
async def update_project(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Session = Depends(deps.get_db),
    project_service: ProjectService = Depends(deps.get_project_service)
):
    updated_project = await project_service.update_project(project_id, project)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project

@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(deps.get_db),
    project_service: ProjectService = Depends(deps.get_project_service)
):
    if not await project_service.delete_project(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

@router.post("/import/github")
async def import_github_projects(
    projects_data: List[schemas.GitHubProjectImport],
    db: Session = Depends(deps.get_db),
    project_service: ProjectService = Depends(deps.get_project_service)
):
    return await project_service.import_github_projects(projects_data)

@router.post("/import/gitlab")
async def import_gitlab_projects(
    projects_data: List[schemas.GitLabProjectImport],
    db: Session = Depends(deps.get_db),
    project_service: ProjectService = Depends(deps.get_project_service)
):
    return await project_service.import_gitlab_projects(projects_data)

@router.post("/import/manual", response_model=List[schemas.Project], response_model_by_alias=True)
async def import_manual_projects(
    projects_data: List[schemas.ManualProjectImport],
    db: Session = Depends(deps.get_db),
    current_site_owner: SiteOwner = Depends(get_current_user), # Renamed and updated type
    project_service: ProjectService = Depends(deps.get_project_service)
):
    """Import multiple projects manually"""
    logger.debug(f"Manual project import requested by site owner: {current_site_owner.email}") # Updated log and var
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
                details=project_data.details,
                is_visible=project_data.is_visible,
                status=project_data.status
            )
            project = await project_service.create_project(project_create)
            imported_projects.append(project)
            
        logger.debug(f"Successfully imported {len(imported_projects)} manual projects")
        return imported_projects
    except Exception as e:
        logger.error(f"Manual project import failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import manual projects: {str(e)}"
        )
