from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import crud, schemas

router = APIRouter()


# Theme routes
@router.get("/theme", response_model=schemas.Theme)
def get_active_theme(db: Session = Depends(get_db)):
    """Get the currently active theme"""
    return crud.crud_theme.get_active_theme(db)


# Section routes
@router.get("/sections", response_model=List[schemas.Section])
def list_visible_sections(db: Session = Depends(get_db)):
    """Get all visible sections in order"""
    return crud.crud_section.get_visible_sections(db)


# Skill routes
@router.get("/skills", response_model=List[schemas.Skill])
def list_skills(db: Session = Depends(get_db)):
    """Get all skills grouped by category"""
    return crud.crud_skill.get_multi(db)


# Project routes
@router.get("/projects", response_model=List[schemas.Project])
def list_visible_projects(db: Session = Depends(get_db)):
    """Get all visible projects"""
    return crud.crud_project.get_visible_projects(db)
