from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime


class SkillBase(BaseModel):
    category: str
    description: Optional[str] = None
    items: List[Dict[str, Any]]
    order: int = 0


class SkillCreate(SkillBase):
    pass


class SkillUpdate(SkillBase):
    category: Optional[str] = None
    description: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None
    order: Optional[int] = None


class Skill(SkillBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
