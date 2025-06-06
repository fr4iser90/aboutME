from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from app.core.auth import get_current_user
from app.infrastructure.database.session import get_db
from app.domain.models.skill import Skill
from app.domain.models.user import SiteOwner # Changed User to SiteOwner
from app.domain.repositories.skill_repository import SkillRepository
from app.domain.services.skill_service import SkillService
from app.infrastructure.database.repositories.skill_repository_impl import SQLAlchemySkillRepository
from app.schemas.skill import SkillCreate, SkillUpdate

logger = logging.getLogger(__name__)
router = APIRouter()

def get_skill_service(db: Session = Depends(get_db)) -> SkillService:
    repository = SQLAlchemySkillRepository(db)
    return SkillService(repository)

@router.get("/", response_model=List[Skill], response_model_by_alias=True)
def list_skills(
    skill_service: SkillService = Depends(get_skill_service),
    current_site_owner: SiteOwner = Depends(get_current_user) # Renamed and updated type
):
    """List all skills (admin only)"""
    return skill_service.list_skills()

@router.get("/category/{category}", response_model=List[Skill], response_model_by_alias=True)
def list_skills_by_category(
    category: str,
    skill_service: SkillService = Depends(get_skill_service),
    current_site_owner: SiteOwner = Depends(get_current_user) # Renamed and updated type
):
    """List skills by category (admin only)"""
    return skill_service.list_skills_by_category(category)

@router.post("/", response_model=Skill, response_model_by_alias=True)
def create_skill(
    skill: SkillCreate,
    skill_service: SkillService = Depends(get_skill_service),
    current_site_owner: SiteOwner = Depends(get_current_user), # Renamed and updated type
):
    """Create a new skill"""
    domain_skill = Skill(**skill.dict())
    return skill_service.create_skill(domain_skill)

@router.put("/{skill_id}", response_model=Skill, response_model_by_alias=True)
def update_skill(
    skill_id: int,
    skill: SkillUpdate,
    skill_service: SkillService = Depends(get_skill_service),
    current_site_owner: SiteOwner = Depends(get_current_user), # Renamed and updated type
):
    """Update an existing skill"""
    domain_skill = Skill(**skill.dict())
    updated = skill_service.update_skill(skill_id, domain_skill)
    if not updated:
        raise HTTPException(status_code=404, detail="Skill not found")
    return updated

@router.delete("/{skill_id}")
def delete_skill(
    skill_id: int,
    skill_service: SkillService = Depends(get_skill_service),
    current_site_owner: SiteOwner = Depends(get_current_user), # Renamed and updated type
):
    """Delete a skill"""
    if not skill_service.delete_skill(skill_id):
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"status": "success"}

@router.put("/{skill_id}/reorder/{new_order}", response_model=Skill, response_model_by_alias=True)
def reorder_skill(
    skill_id: int,
    new_order: int,
    skill_service: SkillService = Depends(get_skill_service),
    current_site_owner: SiteOwner = Depends(get_current_user), # Renamed and updated type
):
    """Reorder a skill"""
    updated = skill_service.reorder_skill(skill_id, new_order)
    if not updated:
        raise HTTPException(status_code=404, detail="Skill not found")
    return updated
