from typing import Optional, Dict, Any, Union, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class TextContent(BaseModel):
    text: str
    format: str = "markdown"  # markdown, html, plain


class ProjectsContent(BaseModel):
    project_ids: List[int]
    layout: str = "grid"  # grid, list, cards


class SkillsContent(BaseModel):
    category_ids: List[int]
    layout: str = "grid"  # grid, list, cards


class SectionBase(BaseModel):
    name: str
    title: str
    type: str
    content: Optional[Dict[str, Any]] = None
    display_order: int = 0
    is_visible: bool = True
    is_public: bool = True
    theme_id: Optional[int] = None
    section_metadata: Optional[Dict[str, Any]] = None


class SectionCreate(SectionBase):
    pass


class SectionUpdate(SectionBase):
    name: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None


class Section(SectionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
