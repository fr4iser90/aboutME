from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.models.skill import Skill

class SkillRepository(ABC):
    @abstractmethod
    def create(self, skill: Skill) -> Skill:
        pass

    @abstractmethod
    def update(self, skill_id: int, skill: Skill) -> Optional[Skill]:
        pass

    @abstractmethod
    def get(self, skill_id: int) -> Optional[Skill]:
        pass

    @abstractmethod
    def get_by_name(self, name: str) -> Optional[Skill]:
        pass

    @abstractmethod
    def list(self) -> List[Skill]:
        pass

    @abstractmethod
    def list_by_category(self, category: str) -> List[Skill]:
        pass

    @abstractmethod
    def get_categories(self) -> List[str]:
        """Get all skill categories"""
        pass

    @abstractmethod
    def delete(self, skill_id: int) -> bool:
        pass

    @abstractmethod
    def reorder(self, skill_id: int, new_order: int) -> Optional[Skill]:
        pass 