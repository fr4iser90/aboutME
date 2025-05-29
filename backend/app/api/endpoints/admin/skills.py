from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.db.session import get_db
from app import crud, schemas
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[schemas.Skill])
def list_skills(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """List all skills (admin only)"""
    return crud.crud_skill.get_multi(db)

@router.post("/", response_model=schemas.Skill)
def create_skill(
    skill: schemas.SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new skill"""
    return crud.crud_skill.create(db, obj_in=skill)

@router.put("/{skill_id}", response_model=schemas.Skill)
def update_skill(
    skill_id: int,
    skill: schemas.SkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing skill"""
    return crud.crud_skill.update(db, id=skill_id, obj_in=skill) 