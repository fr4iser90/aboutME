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
    homepage_url: Optional[str] = None
    display_order: int = 0
    is_visible: bool = True
    is_public: bool = True
    
    # 📄 Beschreibungen
    own_description: Optional[str] = None
    short_description: Optional[str] = None
    highlight: Optional[str] = None
    learnings: Optional[str] = None
    challenges: Optional[str] = None
    role: Optional[str] = None
    custom_tags: Optional[List[str]] = None
    use_own_description: bool = False
    use_short_description: bool = False

    # 📽 Medien
    video_url: Optional[str] = None
    video_host: Optional[str] = None
    gallery_urls: Optional[List[str]] = None
    gif_urls: Optional[List[str]] = None

    # 🧠 Inhalte für Modal
    testimonials: Optional[List[str]] = None
    deployment_notes: Optional[str] = None
    achievements: Optional[List[str]] = None
    duration: Optional[str] = None
    timeline: Optional[Dict[str, Any]] = None
    releases: Optional[Dict[str, Any]] = None
    changelog: Optional[str] = None

    # 🔧 Technik & Details
    tech_stack: Optional[Dict[str, Any]] = None
    ci_tools: Optional[List[str]] = None
    uptime_percentage: Optional[float] = None
    bug_count: Optional[int] = None
    analytics: Optional[Dict[str, Any]] = None

    # 👥 Beteiligung
    is_open_source: bool = False
    contribution_notes: Optional[str] = None
    owner_type: Optional[str] = None
    partners: Optional[List[str]] = None
    sponsors: Optional[List[str]] = None
    team: Optional[List[str]] = None
    team_roles: Optional[Dict[str, Any]] = None

    # 🌍 Internationalisierung
    translations: Optional[Dict[str, Any]] = None

    # 🔗 Weitere
    related_projects: Optional[List[str]] = None
    demo_credentials: Optional[Dict[str, Any]] = None
    roadmap: Optional[Dict[str, Any]] = None
    license: Optional[str] = None
    blog_url: Optional[str] = None

    # 🎨 UI Konfiguration
    ui_config: Optional[Dict[str, Any]] = None  # Speichert UI-spezifische Einstellungen wie Sichtbarkeit von Feldern

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
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    source_username: Optional[str] = None
    source_repo: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    homepage_url: Optional[str] = None
    display_order: Optional[int] = None
    is_visible: Optional[bool] = None
    is_public: Optional[bool] = None
    
    # 📄 Beschreibungen
    own_description: Optional[str] = None
    short_description: Optional[str] = None
    highlight: Optional[str] = None
    learnings: Optional[str] = None
    challenges: Optional[str] = None
    role: Optional[str] = None
    custom_tags: Optional[List[str]] = None
    use_own_description: Optional[bool] = None
    use_short_description: Optional[bool] = None

    # 📽 Medien
    video_url: Optional[str] = None
    video_host: Optional[str] = None
    gallery_urls: Optional[List[str]] = None
    gif_urls: Optional[List[str]] = None

    # 🧠 Inhalte für Modal
    testimonials: Optional[List[str]] = None
    deployment_notes: Optional[str] = None
    achievements: Optional[List[str]] = None
    duration: Optional[str] = None
    timeline: Optional[Dict[str, Any]] = None
    releases: Optional[Dict[str, Any]] = None
    changelog: Optional[str] = None

    # 🔧 Technik & Details
    tech_stack: Optional[Dict[str, Any]] = None
    ci_tools: Optional[List[str]] = None
    uptime_percentage: Optional[float] = None
    bug_count: Optional[int] = None
    analytics: Optional[Dict[str, Any]] = None

    # 👥 Beteiligung
    is_open_source: Optional[bool] = None
    contribution_notes: Optional[str] = None
    owner_type: Optional[str] = None
    partners: Optional[List[str]] = None
    sponsors: Optional[List[str]] = None
    team: Optional[List[str]] = None
    team_roles: Optional[Dict[str, Any]] = None

    # 🌍 Internationalisierung
    translations: Optional[Dict[str, Any]] = None

    # 🔗 Weitere
    related_projects: Optional[List[str]] = None
    demo_credentials: Optional[Dict[str, Any]] = None
    roadmap: Optional[Dict[str, Any]] = None
    license: Optional[str] = None
    blog_url: Optional[str] = None

    # 🎨 UI Konfiguration
    ui_config: Optional[Dict[str, Any]] = None  # Speichert UI-spezifische Einstellungen wie Sichtbarkeit von Feldern

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
    open_issues_count: Optional[int] = None
    default_branch: Optional[str] = None

# Import schemas
class GitHubProjectImport(CamelCaseModel):
    username: str
    repo_name: str
    use_own_description: bool = False
    use_short_description: bool = False

class GitLabProjectImport(CamelCaseModel):
    username: str
    repo_name: str
    use_own_description: bool = False
    use_short_description: bool = False

class ManualProjectImport(CamelCaseModel):
    name: str
    description: str
    source_url: Optional[str] = None
    live_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tech_stack: Optional[Dict[str, Any]] = None
    custom_tags: Optional[List[str]] = None
