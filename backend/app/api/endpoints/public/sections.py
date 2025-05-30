from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.schemas import section as schemas
from app.domain.services.section_service import SectionService
from app.infrastructure.database.repositories.section_repository_impl import SQLAlchemySectionRepository

router = APIRouter()

def get_section_service(db: Session = Depends(get_db)) -> SectionService:
    repository = SQLAlchemySectionRepository(db)
    return SectionService(repository)

@router.get("/", response_model=List[schemas.Section])
async def list_visible_sections(
    section_service: SectionService = Depends(get_section_service)
):
    """Get all visible sections in order"""
    return await section_service.get_visible_sections()

@router.get("/{section_id}", response_model=schemas.Section)
async def get_section(
    section_id: int,
    section_service: SectionService = Depends(get_section_service)
):
    """Get a specific section by ID"""
    section = await section_service.get_visible_section(section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section 