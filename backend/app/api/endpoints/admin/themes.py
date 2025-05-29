from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.db.session import get_db
from app import crud, schemas
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[schemas.Theme])
def list_themes(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """List all themes (admin only)"""
    return crud.crud_theme.get_multi(db)

@router.post("/", response_model=schemas.Theme)
def create_theme(
    theme: schemas.ThemeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new theme"""
    return crud.crud_theme.create(db, obj_in=theme)

@router.put("/{theme_id}", response_model=schemas.Theme)
def update_theme(
    theme_id: int,
    theme: schemas.ThemeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing theme"""
    return crud.crud_theme.update(db, id=theme_id, obj_in=theme) 