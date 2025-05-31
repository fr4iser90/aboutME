from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.infrastructure.database.session import get_db
from app.schemas import theme as schemas
from app.domain.models.user import SiteOwner # Changed User to SiteOwner
from app.domain.services.theme_service import ThemeService
from app.infrastructure.database.repositories.theme_repository_impl import SQLAlchemyThemeRepository

router = APIRouter()

def get_theme_service(db: Session = Depends(get_db)) -> ThemeService:
    repository = SQLAlchemyThemeRepository(db)
    return ThemeService(repository)

@router.get("/", response_model=List[schemas.Theme])
def list_themes(
    theme_service: ThemeService = Depends(get_theme_service),
    current_site_owner: SiteOwner = Depends(get_current_user) # Renamed and updated type
):
    """List all themes (admin only)"""
    return theme_service.get_all_themes()

@router.post("/", response_model=schemas.Theme)
def create_theme(
    theme: schemas.ThemeCreate,
    theme_service: ThemeService = Depends(get_theme_service),
    current_site_owner: SiteOwner = Depends(get_current_user), # Renamed and updated type
):
    """Create a new theme"""
    return theme_service.create_theme(theme)

@router.put("/{theme_id}", response_model=schemas.Theme)
def update_theme(
    theme_id: int,
    theme: schemas.ThemeUpdate,
    theme_service: ThemeService = Depends(get_theme_service),
    current_site_owner: SiteOwner = Depends(get_current_user), # Renamed and updated type
):
    """Update an existing theme"""
    updated_theme = theme_service.update_theme(theme_id, theme)
    if not updated_theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return updated_theme
