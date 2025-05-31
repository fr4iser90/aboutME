from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.schemas import skill as schemas
from app.domain.services.skill_service import SkillService
from app.infrastructure.database.repositories.skill_repository_impl import SQLAlchemySkillRepository

router = APIRouter()

def get_skill_service(db: Session = Depends(get_db)) -> SkillService:
    repository = SQLAlchemySkillRepository(db)
    return SkillService(repository)

@router.get("/", response_model=List[schemas.Skill], response_model_by_alias=True)
async def list_skills(
    skill_service: SkillService = Depends(get_skill_service)
):
    """Get all skills grouped by category"""
    return await skill_service.get_all_skills()

@router.get("/categories", response_model=List[str])
async def list_skill_categories(
    skill_service: SkillService = Depends(get_skill_service)
):
    """Get all skill categories"""
    return await skill_service.get_skill_categories()
