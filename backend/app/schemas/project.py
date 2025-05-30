from typing import Optional, Dict, Any, List
from pydantic import BaseModel, HttpUrl, ConfigDict, Field
from pydantic.fields import AliasChoices, AliasPath
from datetime import datetime
from enum import Enum

class ProjectStatus(str, Enum):
    """Project status options:
    - ACTIVE: Project is active and production-ready
    - WIP: Project is still in development
    - ARCHIVED: Project is completed and preserved for reference
    - DEPRECATED: Project is outdated and should be replaced
    """
    ACTIVE = 'ACTIVE'
    WIP = 'WIP'
    ARCHIVED = 'ARCHIVED'
    DEPRECATED = 'DEPRECATED'

# Base fields that every project has
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.WIP
    source_type: str = "manual"
    source_url: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    display_order: int = 0
    is_visible: bool = True

# GitHub specific fields
class GitHubFields(BaseModel):
    github_username: Optional[str] = None
    github_repo: Optional[str] = None
    stars_count: int = 0
    forks_count: int = 0
    watchers_count: int = 0
    language: Optional[str] = None
    topics: Optional[List[str]] = None
    last_updated: Optional[datetime] = None
    homepage_url: Optional[str] = None
    open_issues_count: int = 0
    default_branch: Optional[str] = None

# GitLab specific fields
class GitLabFields(BaseModel):
    gitlab_username: Optional[str] = None
    gitlab_repo: Optional[str] = None
    star_count: int = 0
    forks_count: int = 0
    language: Optional[str] = None
    topics: Optional[List[str]] = None
    last_updated: Optional[datetime] = None
    homepage_url: Optional[str] = None
    open_issues_count: int = 0
    default_branch: Optional[str] = None
    visibility: str = "public"
    archived: bool = False

# Create/Update schemas
class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    display_order: Optional[int] = None
    is_visible: Optional[bool] = None
    # GitHub fields
    github_username: Optional[str] = None
    github_repo: Optional[str] = None
    stars_count: Optional[int] = None
    forks_count: Optional[int] = None
    watchers_count: Optional[int] = None
    language: Optional[str] = None
    topics: Optional[List[str]] = None
    last_updated: Optional[datetime] = None
    homepage_url: Optional[str] = None
    open_issues_count: Optional[int] = None
    default_branch: Optional[str] = None
    # GitLab fields
    gitlab_username: Optional[str] = None
    gitlab_repo: Optional[str] = None
    star_count: Optional[int] = None
    visibility: Optional[str] = None
    archived: Optional[bool] = None

# Full project schema with all possible fields
class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    # Optional GitHub fields
    github_username: Optional[str] = None
    github_repo: Optional[str] = None
    stars_count: Optional[int] = None
    forks_count: Optional[int] = None
    watchers_count: Optional[int] = None
    language: Optional[str] = None
    topics: Optional[List[str]] = None
    last_updated: Optional[datetime] = None
    homepage_url: Optional[str] = None
    open_issues_count: Optional[int] = None
    default_branch: Optional[str] = None
    # Optional GitLab fields
    gitlab_username: Optional[str] = None
    gitlab_repo: Optional[str] = None
    star_count: Optional[int] = None
    visibility: Optional[str] = None
    archived: Optional[bool] = None

    class Config:
        from_attributes = True

# Import schemas
class GitHubProjectImport(BaseModel):
    model_config = ConfigDict(extra='ignore')

    name: str
    github_username: Optional[str] = Field(default=None, validation_alias=AliasPath('owner', 'login'))
    description: Optional[str] = None  # Allow null descriptions
    
    # Accept 'html_url' from GitHub data as 'source_url' for our model
    source_url: str = Field(validation_alias=AliasChoices('source_url', 'html_url'))
    
    # Accept 'homepage' from GitHub data as 'live_url' for our model
    live_url: Optional[str] = Field(default=None, validation_alias=AliasChoices('live_url', 'homepage'))
    
    thumbnail_url: Optional[str] = Field(default=None, validation_alias=AliasPath('owner', 'avatar_url'))
    details: Optional[Dict[str, Any]] = None
    is_visible: bool = True
    archived: bool = False

class GitLabProjectImport(BaseModel):
    name: str
    description: Optional[str] = None
    web_url: str
    homepage: Optional[str] = None
    star_count: int = 0
    forks_count: int = 0
    language: Optional[str] = None
    topics: Optional[List[str]] = None
    updated_at: Optional[datetime] = None
    default_branch: Optional[str] = None
    namespace: Dict[str, Any]
    visibility: str
    archived: bool
    open_issues_count: int = 0

class ManualProjectImport(BaseModel):
    name: str
    description: Optional[str] = None
    source_url: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    status: str = "WIP"
    is_visible: bool = True
