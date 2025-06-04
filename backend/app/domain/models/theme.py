from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class Theme(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int | None = None
    name: str
    description: str | None = None
    style_properties: dict = {}
    custom_css: str | None = None
    custom_js: str | None = None
    is_active: bool = True
    is_visible: bool = True
    is_public: bool = True 
    created_at: str | None = None
    updated_at: str | None = None
