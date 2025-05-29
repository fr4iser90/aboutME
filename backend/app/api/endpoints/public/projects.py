from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import crud, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Project])
def list_visible_projects(db: Session = Depends(get_db)):
    """Get all visible projects"""
    return crud.crud_project.get_visible_projects(db)

@router.get("/{project_id}", response_model=schemas.Project)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project by ID"""
    return crud.crud_project.get_visible_project(db, id=project_id) 