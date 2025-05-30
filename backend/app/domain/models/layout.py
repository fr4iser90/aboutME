from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class Layout(BaseModel):
    id: Optional[int] = None
    sections_order: List[str]
    layout_type: str
    show_sidebar: bool
    sidebar_position: str
    content: Optional[Dict[str, Any]] = None 