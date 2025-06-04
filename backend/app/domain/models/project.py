from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
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

class Project(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    # Basic Info
    id: int | None = None
    name: str
    description: str | None = None
    status: ProjectStatus = ProjectStatus.WIP
    source_type: str = "manual"
    source_username: str | None = None
    source_repo: str | None = None
    source_url: str | None = None
    live_url: str | None = None
    homepage_url: str | None = None
    thumbnail_url: str | None = None
    display_order: int = 0
    is_visible: bool = True
    is_public: bool = True
    
    # GitHub/GitLab Stats
    stars_count: int = 0
    forks_count: int = 0
    watchers_count: int = 0
    open_issues_count: int = 0
    language: str | None = None
    topics: List[str] | None = None
    default_branch: str | None = None
    last_updated: datetime | None = None
    
    # Timestamps
    created_at: datetime | None = None
    updated_at: datetime | None = None

    # 📄 Beschreibungen
    own_description: str | None = None
    short_description: str | None = None
    highlight: str | None = None
    learnings: str | None = None
    challenges: str | None = None
    role: str | None = None
    custom_tags: List[str] | None = None
    use_own_description: bool = False
    use_short_description: bool = False

    # 📽 Medien
    video_url: str | None = None
    video_host: str | None = None
    gallery_urls: List[str] | None = None
    gif_urls: List[str] | None = None

    # 🧠 Inhalte für Modal
    testimonials: List[str] | None = None
    deployment_notes: str | None = None
    achievements: List[str] | None = None
    duration: str | None = None
    timeline: Dict[str, Any] | None = None
    releases: Dict[str, Any] | None = None
    changelog: str | None = None

    # 🔧 Technik & Details
    tech_stack: Dict[str, Any] | None = None
    ci_tools: List[str] | None = None
    uptime_percentage: float | None = None
    bug_count: int | None = None
    analytics: Dict[str, Any] | None = None

    # 👥 Beteiligung
    is_open_source: bool = False
    contribution_notes: str | None = None
    owner_type: str | None = None
    partners: List[str] | None = None
    sponsors: List[str] | None = None
    team: List[str] | None = None
    team_roles: Dict[str, Any] | None = None

    # 🌍 Internationalisierung
    translations: Dict[str, Any] | None = None

    # 🔗 Weitere
    related_projects: List[str] | None = None
    demo_credentials: Dict[str, Any] | None = None
    roadmap: Dict[str, Any] | None = None
    license: str | None = None
    blog_url: str | None = None

    # 🎨 UI Konfiguration
    ui_config: Dict[str, Any] | None = None  # Speichert UI-spezifische Einstellungen wie Sichtbarkeit von Feldern