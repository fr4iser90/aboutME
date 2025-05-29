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
    name: str = Field(
        ...,
        description="Unique identifier for the section (e.g., 'about', 'projects', 'skills')",
    )
    title: str = Field(..., description="Display title for the section")
    type: str = Field(..., description="Content type: 'text', 'projects', 'skills'")
    content: Optional[Union[TextContent, ProjectsContent, SkillsContent]] = None
    order: int = Field(default=0, description="Order on the page")
    is_visible: bool = Field(default=True, description="Whether the section is visible")
    section_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional metadata like background image, layout variant",
    )


class SectionCreate(SectionBase):
    pass


class SectionUpdate(SectionBase):
    name: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None
    content: Optional[Union[TextContent, ProjectsContent, SkillsContent]] = None
    order: Optional[int] = None
    is_visible: Optional[bool] = None
    section_metadata: Optional[Dict[str, Any]] = None


class Section(SectionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
