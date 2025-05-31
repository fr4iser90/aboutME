from typing import Optional, Dict, Any, List
from pydantic import HttpUrl, ConfigDict, Field # BaseModel removed as CamelCaseModel is imported
from pydantic.fields import AliasChoices, AliasPath
from datetime import datetime
from enum import Enum
# import humps # No longer needed here
from .base import CamelCaseModel # Import from base

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
class ProjectBase(CamelCaseModel):
    name: str = Field(validation_alias=AliasChoices('name', 'title'), serialization_alias='title')
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.WIP
    source_type: str = "manual" # Becomes sourceType
    source_url: Optional[str] = None # Becomes sourceUrl
    live_url: Optional[str] = None # Becomes liveUrl
    thumbnail_url: Optional[str] = Field(default=None, validation_alias=AliasChoices('thumbnail_url', 'imageUrl', 'thumbnailUrl'), serialization_alias='imageUrl')
    details: Optional[Dict[str, Any]] = None
    display_order: int = 0
    is_visible: bool = True

# GitHub specific fields
class GitHubFields(CamelCaseModel):
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
class GitLabFields(CamelCaseModel):
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
class ProjectCreate(ProjectBase): # Inherits aliases from ProjectBase
    # If frontend sends 'title', it maps to 'name'. If 'imageUrl', maps to 'thumbnail_url'.
    # On output, 'name' becomes 'title', 'thumbnail_url' becomes 'imageUrl'.
    pass

class ProjectUpdate(CamelCaseModel):
    # For updates, explicitly define fields if their aliasing for input needs to be specific
    # or different from ProjectBase, or if not all ProjectBase fields are updatable.
    # If we want to accept 'title' and 'imageUrl' for updates:
    name: Optional[str] = Field(default=None, validation_alias=AliasChoices('name', 'title'), serialization_alias='title')
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = Field(default=None, validation_alias=AliasChoices('thumbnail_url', 'imageUrl', 'thumbnailUrl'), serialization_alias='imageUrl')
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
    star_count: Optional[int] = None # For GitLab
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

# Import schemas
class GitHubProjectImport(CamelCaseModel):
    # model_config is inherited, but we need to preserve extra='ignore'
    # and ensure alias_generator and populate_by_name are also set if we override.
    # A cleaner way for Pydantic v2 is to merge:
    model_config = ConfigDict(
        **(CamelCaseModel.model_config or {}), # Inherit base config
        extra='ignore' # Add/override specific settings
    )

    name: str
    github_username: Optional[str] = Field(default=None, validation_alias=AliasPath('owner', 'login'))
    description: Optional[str] = None
    
    source_url: str = Field(validation_alias=AliasChoices('html_url', 'source_url'))
    
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
        **(CamelCaseModel.model_config or {}), # Inherit base config
        extra='ignore' # Add/override specific settings
    )

    name: str
    description: Optional[str] = None
    source_url: str = Field(validation_alias='web_url')
    live_url: Optional[str] = Field(default=None, validation_alias='homepage')
    thumbnail_url: Optional[str] = Field(default=None, validation_alias='avatar_url')
    star_count: int = 0
    forks_count: int = 0
    language: Optional[str] = None
    topics: Optional[List[str]] = Field(default_factory=list)
    last_updated: Optional[datetime] = Field(default=None, validation_alias='last_activity_at')
    default_branch: Optional[str] = None
    # namespace: Dict[str, Any] # Not included as per plan
    visibility_from_gitlab: str = Field(validation_alias='visibility')
    archived_from_gitlab: bool = Field(validation_alias='archived')
    open_issues_count: int = 0

class ManualProjectImport(ProjectBase):
    pass
