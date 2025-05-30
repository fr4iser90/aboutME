from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.schemas import theme as schemas
from app.domain.services.theme_service import ThemeService
from app.infrastructure.database.repositories.theme_repository_impl import SQLAlchemyThemeRepository

router = APIRouter()

def get_theme_service(db: Session = Depends(get_db)) -> ThemeService:
    repository = SQLAlchemyThemeRepository(db)
    return ThemeService(repository)

@router.get("/", response_model=schemas.Theme)
async def get_active_theme(
    theme_service: ThemeService = Depends(get_theme_service)
):
    """Get the currently active theme"""
    theme = await theme_service.get_active_theme()
    if not theme:
        raise HTTPException(status_code=404, detail="No active theme found")
    return theme 