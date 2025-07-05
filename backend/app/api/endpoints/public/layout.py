from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.schemas import layout as schemas
from app.domain.services.layout_service import LayoutService
from app.infrastructure.database.repositories.layout_repository_impl import SQLAlchemyLayoutRepository

router = APIRouter()

def get_layout_service(db: Session = Depends(get_db)) -> LayoutService:
    repository = SQLAlchemyLayoutRepository(db)
    return LayoutService(repository)

@router.get("/", response_model=schemas.Layout)
async def get_layout(
    page: str = Query(default="home", description="Page identifier"),
    layout_service: LayoutService = Depends(get_layout_service)
):
    """Get the current layout configuration for a page (public view - only visible elements)"""
    layout = layout_service.get_public_layout_by_page(page)
    if not layout:
        raise HTTPException(status_code=404, detail="No layout configuration found")
    return layout 