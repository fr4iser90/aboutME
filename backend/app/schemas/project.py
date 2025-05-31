from typing import Optional, Dict, Any, List
from pydantic import HttpUrl, ConfigDict, Field # BaseModel removed as CamelCaseModel is imported
from pydantic.fields import AliasChoices, AliasPath
from datetime import datetime
from app.domain.models.project import ProjectStatus
from .base import CamelCaseModel # Import from base

# Base fields that every project has
class ProjectBase(CamelCaseModel):
    name: str = Field(validation_alias=AliasChoices('name', 'title'), serialization_alias='title')
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.WIP
    source_type: str = "manual"
    source_url: Optional[str] = None
    source_username: Optional[str] = None
    source_repo: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = Field(default=None, validation_alias=AliasChoices('thumbnail_url', 'imageUrl', 'thumbnailUrl'), serialization_alias='imageUrl')
    details: Optional[Dict[str, Any]] = None
    display_order: int = 0
    is_visible: bool = True

# GitHub specific fields
class GitHubFields(CamelCaseModel):
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
class GitLabFields(CamelCaseModel):
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

class ProjectUpdate(CamelCaseModel):
    name: Optional[str] = Field(default=None, validation_alias=AliasChoices('name', 'title'), serialization_alias='title')
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    source_username: Optional[str] = None
    source_repo: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = Field(default=None, validation_alias=AliasChoices('thumbnail_url', 'imageUrl', 'thumbnailUrl'), serialization_alias='imageUrl')
    details: Optional[Dict[str, Any]] = None
    display_order: Optional[int] = None
    is_visible: Optional[bool] = None
    stars_count: Optional[int] = None
    forks_count: Optional[int] = None
    watchers_count: Optional[int] = None
    language: Optional[str] = None
    topics: Optional[List[str]] = None
    last_updated: Optional[datetime] = None
    homepage_url: Optional[str] = None
    open_issues_count: Optional[int] = None
    default_branch: Optional[str] = None

# Full project schema with all possible fields
class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    stars_count: Optional[int] = None
    forks_count: Optional[int] = None
    watchers_count: Optional[int] = None
    language: Optional[str] = None
    topics: Optional[List[str]] = None
    last_updated: Optional[datetime] = None
    homepage_url: Optional[str] = None
    open_issues_count: Optional[int] = None
    default_branch: Optional[str] = None

# Import schemas
class GitHubProjectImport(CamelCaseModel):
    model_config = ConfigDict(
        **(CamelCaseModel.model_config or {}),
        extra='ignore'
    )

    name: str
    source_username: Optional[str] = Field(default=None, validation_alias=AliasPath('owner', 'login'))
    description: Optional[str] = None
    source_url: str = Field(validation_alias=AliasChoices('html_url', 'source_url'))
    source_repo: Optional[str] = Field(default=None, validation_alias='name')
    live_url: Optional[str] = Field(default=None, validation_alias=AliasChoices('homepage', 'live_url'))
    thumbnail_url: Optional[str] = Field(default=None, validation_alias=AliasPath('owner', 'avatar_url'))
    details: Optional[Dict[str, Any]] = None
    is_visible: bool = True
    archived_from_github: bool = Field(default=False, validation_alias='archived')
    stars_count: int = Field(0, validation_alias='stargazers_count')
    forks_count: int = Field(0, validation_alias='forks_count')
    watchers_count: int = Field(0, validation_alias='watchers_count')
    language: Optional[str] = None
    topics: Optional[List[str]] = Field(default_factory=list)
    last_updated: Optional[datetime] = Field(default=None, validation_alias='pushed_at')
    open_issues_count: int = Field(0, validation_alias='open_issues_count')
    default_branch: Optional[str] = None

class GitLabProjectImport(CamelCaseModel):
    model_config = ConfigDict(
        **(CamelCaseModel.model_config or {}),
        extra='ignore'
    )

    name: str
    description: Optional[str] = None
    source_url: str = Field(validation_alias='web_url')
    source_username: Optional[str] = Field(default=None, validation_alias=AliasPath('namespace', 'username'))
    source_repo: Optional[str] = Field(default=None, validation_alias='path')
    live_url: Optional[str] = Field(default=None, validation_alias='homepage')
    thumbnail_url: Optional[str] = Field(default=None, validation_alias='avatar_url')
    star_count: int = 0
    forks_count: int = 0
    language: Optional[str] = None
    topics: Optional[List[str]] = Field(default_factory=list)
    last_updated: Optional[datetime] = Field(default=None, validation_alias='last_activity_at')
    default_branch: Optional[str] = None
    visibility_from_gitlab: str = Field(validation_alias='visibility')
    archived_from_gitlab: bool = Field(validation_alias='archived')
    open_issues_count: int = 0

class ManualProjectImport(ProjectBase):
    pass
