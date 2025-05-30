from typing import List, Optional
import logging
from app.domain.repositories.skill_repository import SkillRepository
from app.domain.models.skill import Skill

logger = logging.getLogger(__name__)

class SkillService:
    def __init__(self, skill_repository: SkillRepository):
        self.skill_repository = skill_repository

    def create_skill(self, skill: Skill) -> Skill:
        """Create a new skill"""
        logger.debug(f"Creating new skill: {skill.name}")
        return self.skill_repository.create(skill)

    def update_skill(self, skill_id: int, skill: Skill) -> Optional[Skill]:
        """Update an existing skill"""
        logger.debug(f"Updating skill: {skill_id}")
        return self.skill_repository.update(skill_id, skill)

    def get_skill(self, skill_id: int) -> Optional[Skill]:
        """Get a skill by ID"""
        return self.skill_repository.get(skill_id)

    def get_skill_by_name(self, name: str) -> Optional[Skill]:
        """Get a skill by name"""
        return self.skill_repository.get_by_name(name)

    def list_skills(self) -> List[Skill]:
        """List all skills"""
        return self.skill_repository.list()

    def list_skills_by_category(self, category: str) -> List[Skill]:
        """List skills by category"""
        return self.skill_repository.list_by_category(category)

    def delete_skill(self, skill_id: int) -> bool:
        """Delete a skill"""
        logger.debug(f"Deleting skill: {skill_id}")
        return self.skill_repository.delete(skill_id)

    def reorder_skill(self, skill_id: int, new_order: int) -> Optional[Skill]:
        """Reorder a skill"""
        logger.debug(f"Reordering skill {skill_id} to position {new_order}")
        return self.skill_repository.reorder(skill_id, new_order)

    async def get_all_skills(self) -> List[Skill]:
        """Get all skills"""
        return self.skill_repository.list()

    async def get_skill_categories(self) -> List[str]:
        """Get all skill categories"""
        return self.skill_repository.get_categories() 