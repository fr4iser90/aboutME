from typing import List, Optional
from pydantic import BaseModel

class LayoutBase(BaseModel):
    sections_order: List[str]
    layout_type: str
    show_sidebar: bool
    sidebar_position: str

class LayoutCreate(LayoutBase):
    pass

class LayoutUpdate(LayoutBase):
    pass

class Layout(LayoutBase):
    id: int

    class Config:
        from_attributes = True

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