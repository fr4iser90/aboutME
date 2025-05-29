from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.db.session import get_db
from app import crud, schemas
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[schemas.Section])
def list_sections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all sections (admin only)"""
    return crud.crud_section.get_multi(db)

@router.post("/", response_model=schemas.Section)
def create_section(
    section: schemas.SectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new section"""
    return crud.crud_section.create(db, obj_in=section)

@router.put("/{section_id}", response_model=schemas.Section)
def update_section(
    section_id: int,
    section: schemas.SectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing section"""
    return crud.crud_section.update(db, id=section_id, obj_in=section) 