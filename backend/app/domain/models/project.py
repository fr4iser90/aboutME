from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class Project(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int | None = None
    name: str
    description: str | None = None
    status: str = "WIP"
    source_type: str = "manual"
    source_url: str | None = None
    github_username: str | None = None
    github_repo: str | None = None
    gitlab_username: str | None = None
    gitlab_repo: str | None = None
    live_url: str | None = None
    thumbnail_url: str | None = None
    details: Dict[str, Any] | None = None
    display_order: int = 0
    is_visible: bool = True
    stars_count: int = 0
    forks_count: int = 0
    watchers_count: int = 0
    language: str | None = None
    topics: List[str] | None = None
    last_updated: datetime | None = None
    homepage_url: str | None = None
    open_issues_count: int = 0
    default_branch: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None 