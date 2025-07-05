from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class PageElement(BaseModel):
    id: str
    type: str  # navbar, hero, section, skills, projects, footer, etc.
    title: str
    visible: bool = True
    grid_props: Dict[str, Any] = Field(default_factory=dict)  # x, y, w, h for grid layout
    order: int
    settings: Dict[str, Any] = Field(default_factory=dict)  # element-specific settings

class Layout(BaseModel):
    id: Optional[int] = None
    page: str = 'home'  # page identifier (home, about, projects, etc.)
    elements: List[PageElement] = Field(default_factory=list)
    layout_config: Dict[str, Any] = Field(default_factory=dict)  # grid config, breakpoints, etc.
    is_active: bool = False
    is_visible: bool = True
    is_public: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None 