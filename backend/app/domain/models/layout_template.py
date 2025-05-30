from typing import List, Optional
from pydantic import BaseModel

class LayoutTemplate(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    sections_order: List[str]
    layout_type: str
    show_sidebar: bool
    sidebar_position: str 