from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class SkillBase(BaseModel):
    name: str
    category: str
    level: int = Field(ge=1, le=5)
    description: Optional[str] = None
    items: List[Dict[str, Any]] = []
    order: int = 0
    is_visible: bool = True


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    level: Optional[int] = Field(default=None, ge=1, le=5)
    description: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None
    order: Optional[int] = None
    is_visible: Optional[bool] = None

    class Config:
        from_attributes = True


class Skill(SkillBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
