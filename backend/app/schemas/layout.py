from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class PageElementBase(BaseModel):
    id: str
    type: str
    title: str
    visible: bool = True
    grid_props: Dict[str, Any] = Field(default_factory=dict)
    order: int
    settings: Dict[str, Any] = Field(default_factory=dict)

class PageElementCreate(PageElementBase):
    pass

class PageElementUpdate(PageElementBase):
    pass

class PageElement(PageElementBase):
    class Config:
        from_attributes = True

class LayoutBase(BaseModel):
    page: str = 'home'
    elements: List[PageElement] = Field(default_factory=list)
    layout_config: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = False
    is_visible: bool = True
    is_public: bool = True

class LayoutCreate(LayoutBase):
    pass

class LayoutUpdate(LayoutBase):
    pass

class Layout(LayoutBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FullPageLayout(BaseModel):
    """Complete layout for a page including all elements and configuration"""
    page: str
    elements: List[PageElement]
    layout_config: Dict[str, Any] = Field(default_factory=dict)

class LayoutResponse(BaseModel):
    """Response model for layout endpoints"""
    layout: Layout
    message: Optional[str] = None

class LayoutListResponse(BaseModel):
    """Response model for layout list endpoints"""
    layouts: List[Layout]
    total: int
    page: int
    size: int

class LayoutTemplate(LayoutBase):
    id: int
    name: str
    description: str
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True

class LayoutPreview(BaseModel):
    layout: LayoutUpdate
    content: dict
    preview_url: str 