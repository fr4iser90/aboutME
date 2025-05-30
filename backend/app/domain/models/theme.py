from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class Theme(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int | None = None
    name: str
    description: str | None = None
    colors: Dict[str, str] | None = None
    fonts: Dict[str, str] | None = None
    spacing: Dict[str, int] | None = None
    is_default: bool = False
    is_visible: bool = True 