from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.schemas import project as schemas
from app.domain.services.project_service import ProjectService
from app.infrastructure.database.repositories.project_repository_impl import SQLAlchemyProjectRepository

router = APIRouter()

def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
    repository = SQLAlchemyProjectRepository(db)
    return ProjectService(repository)

@router.get("/", response_model=List[schemas.Project])
async def list_visible_projects(
    project_service: ProjectService = Depends(get_project_service)
):
    """Get all visible projects"""
    return await project_service.get_visible_projects()

@router.get("/{project_id}", response_model=schemas.Project)
async def get_project(
    project_id: int,
    project_service: ProjectService = Depends(get_project_service)
):
    """Get a specific project by ID"""
    project = await project_service.get_visible_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project 