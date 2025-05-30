from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class Skill(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int | None = None
    name: str
    category: str
    level: int
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    display_order: int = 0
    is_visible: bool = True
    tags: List[str] | None = None 