from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class Section(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int | None = None
    name: str
    title: str
    type: str
    content: Dict[str, Any] | None = None
    display_order: int = 0
    is_visible: bool = True
    is_public: bool = True
    theme_id: int | None = None
    section_metadata: Dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime 