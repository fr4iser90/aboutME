from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class Section(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int | None = None
    name: str
    type: str
    content: Dict[str, Any] | None = None
    display_order: int = 0
    is_visible: bool = True
    theme_id: int | None = None 