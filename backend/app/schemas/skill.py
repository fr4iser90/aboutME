from typing import List, Dict, Any, Optional
from pydantic import Field # BaseModel removed
from datetime import datetime
from .base import CamelCaseModel # Import CamelCaseModel


class SkillBase(CamelCaseModel): # Inherit from CamelCaseModel
    name: str
    category: str
    level: int = Field(ge=1, le=5)
    description: Optional[str] = None
    items: List[Dict[str, Any]] = []
    order: int = 0
    is_visible: bool = True
    is_public: bool = True


class SkillCreate(SkillBase):
    pass


class SkillUpdate(CamelCaseModel): # Inherit from CamelCaseModel
    name: Optional[str] = None
    category: Optional[str] = None
    level: Optional[int] = Field(default=None, ge=1, le=5)
    description: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None # Will become items
    order: Optional[int] = None
    is_visible: Optional[bool] = None # Will become isVisible

    # Config class for from_attributes is inherited from CamelCaseModel


class Skill(SkillBase): # Inherits from SkillBase which inherits from CamelCaseModel
    id: int
    created_at: datetime # Will become createdAt
    updated_at: datetime # Will become updatedAt

    # Config class for from_attributes is inherited from CamelCaseModel
