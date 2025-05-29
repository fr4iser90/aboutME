from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from app.core.auth import get_current_user
from app.db.session import get_db
from app import crud, schemas
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=schemas.Layout)
def get_layout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current layout configuration"""
    layout = crud.crud_layout.get(db)
    if not layout:
        # Create default layout if none exists
        layout = crud.crud_layout.create(
            db,
            obj_in=schemas.LayoutCreate(
                sections_order=["about", "skills", "projects", "contact"],
                layout_type="standard",
                show_sidebar=True,
                sidebar_position="left"
            )
        )
    return layout

@router.put("/", response_model=schemas.Layout)
def update_layout(
    layout: schemas.LayoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the layout configuration"""
    existing_layout = crud.crud_layout.get(db)
    if not existing_layout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Layout configuration not found"
        )
    return crud.crud_layout.update(db, id=existing_layout.id, obj_in=layout)

@router.post("/preview", response_model=schemas.LayoutPreview)
def preview_layout(
    layout: schemas.LayoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a preview of the layout configuration"""
    try:
        # Get current content
        content = crud.crud_content.get(db)
        
        # Generate preview with new layout
        preview = schemas.LayoutPreview(
            layout=layout,
            content=content,
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
def get_layout_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get available layout templates"""
    return crud.crud_layout.get_templates(db)

@router.post("/templates/{template_id}/apply", response_model=schemas.Layout)
def apply_layout_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Apply a layout template"""
    template = crud.crud_layout.get_template(db, template_id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Apply template settings
    layout_update = schemas.LayoutUpdate(
        sections_order=template.sections_order,
        layout_type=template.layout_type,
        show_sidebar=template.show_sidebar,
        sidebar_position=template.sidebar_position
    )
    
    return update_layout(layout_update, db, current_user) 