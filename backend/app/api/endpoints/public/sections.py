from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import crud, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Section])
def list_visible_sections(db: Session = Depends(get_db)):
    """Get all visible sections in order"""
    return crud.crud_section.get_visible_sections(db)

@router.get("/{section_id}", response_model=schemas.Section)
def get_section(section_id: int, db: Session = Depends(get_db)):
    """Get a specific section by ID"""
    return crud.crud_section.get_visible_section(db, id=section_id) 