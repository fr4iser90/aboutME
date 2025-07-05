from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging
from app.core.auth import get_current_user
from app.infrastructure.database.session import get_db
from app.schemas import layout as schemas
from app.domain.models.user import SiteOwner
from app.domain.services.layout_service import LayoutService
from app.infrastructure.database.repositories.layout_repository_impl import SQLAlchemyLayoutRepository

logger = logging.getLogger(__name__)
router = APIRouter()

def get_layout_service(db: Session = Depends(get_db)) -> LayoutService:
    repository = SQLAlchemyLayoutRepository(db)
    return LayoutService(repository)

@router.get("/", response_model=List[schemas.Layout])
async def get_all_layouts(
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Get all layout configurations"""
    return layout_service.get_all_layouts()

@router.get("/{page}", response_model=schemas.Layout)
async def get_layout_by_page(
    page: str,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Get layout configuration for a specific page"""
    layout = layout_service.get_layout_by_page(page)
    if not layout:
        # Create default layout if none exists
        layout = layout_service.create_default_layout(page)
    return layout

@router.get("/{page}/full-page", response_model=schemas.FullPageLayout)
async def get_full_page_layout(
    page: str,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Get complete layout for a page (admin only)"""
    layout = layout_service.get_layout_by_page(page)
    if not layout:
        # Create default layout if none exists
        layout = layout_service.create_default_layout(page)
    
    return schemas.FullPageLayout(
        page=layout.page,
        elements=layout.elements,
        layout_config=layout.layout_config
    )

@router.post("/{page}/full-page", response_model=schemas.Layout)
async def save_full_page_layout(
    page: str,
    full_layout: schemas.FullPageLayout,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Save complete layout for a page (admin only)"""
    try:
        # Ensure the page matches the URL parameter
        full_layout.page = page
        saved_layout = layout_service.save_full_page_layout(full_layout)
        return saved_layout
    except Exception as e:
        logger.error(f"Failed to save full page layout: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save layout"
        )

@router.put("/{page}", response_model=schemas.Layout)
async def update_layout_by_page(
    page: str,
    layout: schemas.LayoutUpdate,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Update layout configuration for a specific page"""
    updated_layout = layout_service.update_layout_by_page(page, layout)
    if not updated_layout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Layout configuration not found"
        )
    return updated_layout

@router.delete("/{layout_id}")
async def delete_layout(
    layout_id: int,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Delete a layout configuration"""
    success = layout_service.delete_layout(layout_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Layout configuration not found"
        )
    return {"message": "Layout deleted successfully"}

@router.post("/{layout_id}/activate")
async def activate_layout(
    layout_id: int,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Set a layout as active for its page"""
    success = layout_service.set_active_layout(layout_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Layout configuration not found"
        )
    return {"message": "Layout activated successfully"}

@router.post("/{page}/default")
async def create_default_layout(
    page: str,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Create a default layout for a page"""
    layout = layout_service.create_default_layout(page)
    return layout

@router.get("/templates", response_model=List[schemas.LayoutTemplate])
async def get_layout_templates(
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Get available layout templates"""
    return layout_service.get_templates()

@router.post("/templates/{template_id}/apply/{page}", response_model=schemas.Layout)
async def apply_layout_template(
    template_id: int,
    page: str,
    layout_service: LayoutService = Depends(get_layout_service),
    current_site_owner: SiteOwner = Depends(get_current_user)
):
    """Apply a layout template to a specific page"""
    template = layout_service.get_template(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    updated_layout = layout_service.apply_template(template_id, page)
    if not updated_layout:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to apply template"
        )
    
    return updated_layout
