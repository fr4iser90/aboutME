from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, JSON, ARRAY, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator
from app.infrastructure.database.base import Base
import json

class ArrayOfStrings(TypeDecorator):
    impl = ARRAY(String)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return []
        return value

    def process_result_value(self, value, dialect):
        return value

class ProjectModel(Base):
    __tablename__ = "projects"
    
    # Basic Info
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default='WIP')
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, default='manual')
    source_username: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_repo: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    live_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    homepage_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # GitHub/GitLab Stats
    stars_count: Mapped[int] = mapped_column(Integer, default=0)
    forks_count: Mapped[int] = mapped_column(Integer, default=0)
    watchers_count: Mapped[int] = mapped_column(Integer, default=0)
    open_issues_count: Mapped[int] = mapped_column(Integer, default=0)
    language: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    topics: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    default_branch: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_updated: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 📄 Beschreibungen
    own_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    short_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    highlight: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    learnings: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    challenges: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    role: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    custom_tags: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    use_own_description: Mapped[bool] = mapped_column(Boolean, default=False)
    use_short_description: Mapped[bool] = mapped_column(Boolean, default=False)

    # 📽 Medien
    video_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    video_host: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    gallery_urls: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    gif_urls: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)

    # 🧠 Inhalte für Modal
    testimonials: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    deployment_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    achievements: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    duration: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timeline: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    releases: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    changelog: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 🔧 Technik & Details
    tech_stack: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ci_tools: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    uptime_percentage: Mapped[Optional[float]] = mapped_column(Numeric(5,2), nullable=True)
    bug_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    analytics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # 👥 Beteiligung
    is_open_source: Mapped[bool] = mapped_column(Boolean, default=False)
    contribution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    owner_type: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    partners: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    sponsors: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    team: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    team_roles: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # 🌍 Internationalisierung
    translations: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # 🔗 Weitere
    related_projects: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    demo_credentials: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    roadmap: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    license: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    blog_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # 🎨 UI Konfiguration
    ui_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)  # Speichert UI-spezifische Einstellungen wie Sichtbarkeit von Feldern 