from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from app.core.auth import get_current_user
from app.infrastructure.database.session import get_db
from app.schemas import layout as schemas
from app.domain.models.user import SiteOwner # Changed User to SiteOwner
from app.domain.services.layout_service import LayoutService
from app.infrastructure.database.repositories.layout_repository_impl import SQLAlchemyLayoutRepository

logger = logging.getLogger(__name__)
router = APIRouter()

def get_layout_service(db: Session = Depends(get_db)) -> LayoutService:
    repository = SQLAlchemyLayoutRepository(db)
    return LayoutService(repository)

@router.get("/", response_model=schemas.Layout)
async def get_layout(
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user) # Renamed and updated type
):
    """Get the current layout configuration"""
    return await layout_service.get_layout()

@router.put("/", response_model=schemas.Layout)
async def update_layout(
    layout: schemas.LayoutUpdate,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user) # Renamed and updated type
):
    """Update the layout configuration"""
    existing_layout = await layout_service.get_layout()
    if not existing_layout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Layout configuration not found"
        )
    updated_layout = await layout_service.update_layout(existing_layout.id, layout)
    if not updated_layout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Layout configuration not found"
        )
    return updated_layout

@router.post("/preview", response_model=schemas.LayoutPreview)
async def preview_layout(
    layout: schemas.LayoutUpdate,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user) # Renamed and updated type
):
    """Generate a preview of the layout configuration"""
    try:
        # Get current layout
        current_layout = await layout_service.get_layout()
        
        # Generate preview with new layout
        preview = schemas.LayoutPreview(
            layout=layout,
            content=current_layout.content if current_layout else None,
            preview_url="/preview"
        )
        
        return preview
    except Exception as e:
        logger.error(f"Failed to generate layout preview: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate layout preview"
        )

@router.get("/templates", response_model=List[schemas.LayoutTemplate])
async def get_layout_templates(
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user) # Renamed and updated type
):
    """Get available layout templates"""
    return await layout_service.get_templates()

@router.post("/templates/{template_id}/apply", response_model=schemas.Layout)
async def apply_layout_template(
    template_id: int,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user) # Renamed and updated type
):
    """Apply a layout template"""
    template = await layout_service.get_template(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    updated_layout = await layout_service.apply_template(template_id)
    if not updated_layout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to apply template"
        )
    
    return updated_layout
