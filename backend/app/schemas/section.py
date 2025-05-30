from typing import Optional, Dict, Any, Union, List
from pydantic import BaseModel, Field
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
    order: int = 0
    is_visible: bool = True
    section_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional metadata like background image, layout variant",
    )


class SectionCreate(SectionBase):
    pass


class SectionUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    order: Optional[int] = None
    is_visible: Optional[bool] = None
    section_metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class Section(SectionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
