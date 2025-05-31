from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, JSON, ARRAY, Enum
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

class PostModel(Base):
    __tablename__ = "posts"
    
    # Basic Info
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False, default='general')
    project_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('projects.id', ondelete='SET NULL'), nullable=True)
    section_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('sections.id', ondelete='SET NULL'), nullable=True)
    
    # Basic Content
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtitle: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    excerpt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Media
    cover_image_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    cover_image_alt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    gallery_urls: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    video_host: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    audio_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    audio_duration: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    audio_transcript: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # SEO & Stats
    seo_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    seo_keywords: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    reading_time: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    comment_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Organization
    author: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    categories: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    series: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    related_posts: Mapped[Optional[List[int]]] = mapped_column(ARRAY(Integer), nullable=True)
    
    # Publishing
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Internationalization
    language: Mapped[str] = mapped_column(String(10), default='en')
    translations: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Access Control
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    access_level: Mapped[str] = mapped_column(String(20), default='public')
    
    # Analytics
    analytics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Customization
    custom_css: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    custom_js: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    layout_variant: Mapped[str] = mapped_column(String(50), default='default')
    
    # Tutorial Specific
    difficulty_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    estimated_completion_time: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    prerequisites: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    learning_objectives: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    resources: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Content Management
    revision_history: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    last_reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_reviewed_by: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content_status: Mapped[str] = mapped_column(String(20), default='draft')
    
    # Engagement
    target_audience: Mapped[Optional[List[str]]] = mapped_column(ArrayOfStrings, nullable=True)
    engagement_metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    feedback: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Workflow
    assigned_to: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    publication_schedule: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expiration_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)