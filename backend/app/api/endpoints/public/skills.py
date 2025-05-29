from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import crud, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Skill])
def list_skills(db: Session = Depends(get_db)):
    """Get all skills grouped by category"""
    return crud.crud_skill.get_multi(db)

@router.get("/categories", response_model=List[str])
def list_skill_categories(db: Session = Depends(get_db)):
    """Get all skill categories"""
    return crud.crud_skill.get_categories(db) 