from typing import Optional, Dict, Any, List
from pydantic import BaseModel, HttpUrl
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "WIP"
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    github_username: Optional[str] = None
    github_repo: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    order: int = 0
    is_visible: bool = True
    # GitHub specific fields
    stars_count: Optional[int] = 0
    forks_count: Optional[int] = 0
    watchers_count: Optional[int] = 0
    language: Optional[str] = None
    topics: Optional[List[str]] = []
    last_updated: Optional[datetime] = None
    homepage_url: Optional[str] = None
    open_issues_count: Optional[int] = 0
    default_branch: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    github_username: Optional[str] = None
    github_repo: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    order: Optional[int] = None
    is_visible: Optional[bool] = None
    # GitHub specific fields
    stars_count: Optional[int] = None
    forks_count: Optional[int] = None
    watchers_count: Optional[int] = None
    language: Optional[str] = None
    topics: Optional[List[str]] = None
    last_updated: Optional[datetime] = None
    homepage_url: Optional[str] = None
    open_issues_count: Optional[int] = None
    default_branch: Optional[str] = None


class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GitHubProjectImport(BaseModel):
    name: str
    description: Optional[str] = None
    html_url: Optional[str] = None
    homepage: Optional[str] = None
    language: Optional[str] = None
    topics: Optional[List[str]] = []
    stargazers_count: Optional[int] = 0
    forks_count: Optional[int] = 0
    watchers_count: Optional[int] = 0
    open_issues_count: Optional[int] = 0
    default_branch: Optional[str] = None
    updated_at: Optional[datetime] = None
    owner: Optional[dict] = None


class GitLabProjectImport(BaseModel):
    name: str
    description: Optional[str] = None
    web_url: Optional[str] = None
    homepage: Optional[str] = None
    language: Optional[str] = None
    topics: Optional[List[str]] = []
    star_count: Optional[int] = 0
    forks_count: Optional[int] = 0
    open_issues_count: Optional[int] = 0
    default_branch: Optional[str] = None
    updated_at: Optional[datetime] = None
    namespace: Optional[dict] = None
    visibility: Optional[str] = None
    archived: Optional[bool] = False


class ManualProjectImport(BaseModel):
    name: str
    description: Optional[str] = None
    source_url: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    language: Optional[str] = None
    topics: Optional[List[str]] = []
    status: str = "WIP"
    is_visible: bool = True
