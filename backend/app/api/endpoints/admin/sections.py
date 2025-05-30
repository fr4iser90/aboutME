from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from app.core.auth import get_current_user
from app.infrastructure.database.session import get_db
from app.domain.models.section import Section
from app.domain.models.user import User
from app.domain.repositories.section_repository import SectionRepository
from app.domain.services.section_service import SectionService
from app.infrastructure.database.repositories.section_repository_impl import SQLAlchemySectionRepository
from app.schemas.section import SectionCreate, SectionUpdate

logger = logging.getLogger(__name__)
router = APIRouter()

def get_section_service(db: Session = Depends(get_db)) -> SectionService:
    repository = SQLAlchemySectionRepository(db)
    return SectionService(repository)

@router.get("/", response_model=List[Section])
def list_sections(
    section_service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user)
):
    """List all sections (admin only)"""
    return section_service.list_sections()

@router.post("/", response_model=Section)
def create_section(
    section: SectionCreate,
    section_service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user),
):
    """Create a new section"""
    domain_section = Section(**section.dict())
    return section_service.create_section(domain_section)

@router.put("/{section_id}", response_model=Section)
def update_section(
    section_id: int,
    section: SectionUpdate,
    section_service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user),
):
    """Update an existing section"""
    domain_section = Section(**section.dict())
    updated = section_service.update_section(section_id, domain_section)
    if not updated:
        raise HTTPException(status_code=404, detail="Section not found")
    return updated

@router.delete("/{section_id}")
def delete_section(
    section_id: int,
    section_service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user),
):
    """Delete a section"""
    if not section_service.delete_section(section_id):
        raise HTTPException(status_code=404, detail="Section not found")
    return {"status": "success"}

@router.put("/{section_id}/reorder/{new_order}", response_model=Section)
def reorder_section(
    section_id: int,
    new_order: int,
    section_service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user),
):
    """Reorder a section"""
    updated = section_service.reorder_section(section_id, new_order)
    if not updated:
        raise HTTPException(status_code=404, detail="Section not found")
    return updated 