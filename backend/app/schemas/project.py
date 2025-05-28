from typing import Optional, Dict, Any
from pydantic import BaseModel, HttpUrl
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "WIP"
    source_type: str = "manual"  # manual, github, gitlab
    source_url: Optional[HttpUrl] = None
    github_username: Optional[str] = None
    github_repo: Optional[str] = None
    live_url: Optional[HttpUrl] = None
    thumbnail_url: Optional[HttpUrl] = None
    details: Optional[Dict[str, Any]] = None
    order: int = 0
    is_visible: bool = True


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    source_type: Optional[str] = None
    source_url: Optional[HttpUrl] = None
    github_username: Optional[str] = None
    github_repo: Optional[str] = None
    live_url: Optional[HttpUrl] = None
    thumbnail_url: Optional[HttpUrl] = None
    details: Optional[Dict[str, Any]] = None
    order: Optional[int] = None
    is_visible: Optional[bool] = None


class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
