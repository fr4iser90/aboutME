from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl
from app.domain.models.post import PostType

class PostBase(BaseModel):
    """Base schema for post data."""
    type: PostType = PostType.GENERAL
    project_id: Optional[int] = None
    section_id: Optional[int] = None
    is_visible: bool = True
    is_public: bool = True
    slug: str
    title: str
    subtitle: Optional[str] = None
    content_markdown: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_image_alt: Optional[str] = None
    gallery_urls: Optional[List[str]] = None
    video_url: Optional[str] = None
    video_host: Optional[str] = None
    audio_url: Optional[str] = None
    audio_duration: Optional[int] = None
    audio_transcript: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[List[str]] = None
    reading_time: Optional[int] = None
    author: Optional[str] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    series: Optional[str] = None
    related_posts: Optional[List[int]] = None
    is_published: bool = True
    is_featured: bool = False
    is_pinned: bool = False
    language: str = 'en'
    translations: Optional[Dict[str, Any]] = None
    is_private: bool = False
    access_level: str = 'public'
    analytics: Optional[Dict[str, Any]] = None
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None
    layout_variant: str = 'default'
    difficulty_level: Optional[str] = None
    estimated_completion_time: Optional[int] = None
    prerequisites: Optional[List[str]] = None
    learning_objectives: Optional[List[str]] = None
    resources: Optional[Dict[str, Any]] = None
    revision_history: Optional[Dict[str, Any]] = None
    last_reviewed_at: Optional[datetime] = None
    last_reviewed_by: Optional[str] = None
    content_status: str = 'draft'
    target_audience: Optional[List[str]] = None
    engagement_metrics: Optional[Dict[str, Any]] = None
    feedback: Optional[Dict[str, Any]] = None
    assigned_to: Optional[str] = None
    review_notes: Optional[str] = None
    publication_schedule: Optional[datetime] = None
    expiration_date: Optional[datetime] = None

class PostCreate(PostBase):
    """Schema for creating a new post."""
    pass

class PostUpdate(BaseModel):
    """Schema for updating an existing post."""
    type: Optional[PostType] = None
    project_id: Optional[int] = None
    section_id: Optional[int] = None
    slug: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content_markdown: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_image_alt: Optional[str] = None
    gallery_urls: Optional[List[str]] = None
    video_url: Optional[str] = None
    video_host: Optional[str] = None
    audio_url: Optional[str] = None
    audio_duration: Optional[int] = None
    audio_transcript: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[List[str]] = None
    reading_time: Optional[int] = None
    author: Optional[str] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    series: Optional[str] = None
    related_posts: Optional[List[int]] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_pinned: Optional[bool] = None
    language: Optional[str] = None
    translations: Optional[Dict[str, Any]] = None
    is_private: Optional[bool] = None
    access_level: Optional[str] = None
    analytics: Optional[Dict[str, Any]] = None
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None
    layout_variant: Optional[str] = None
    difficulty_level: Optional[str] = None
    estimated_completion_time: Optional[int] = None
    prerequisites: Optional[List[str]] = None
    learning_objectives: Optional[List[str]] = None
    resources: Optional[Dict[str, Any]] = None
    revision_history: Optional[Dict[str, Any]] = None
    last_reviewed_at: Optional[datetime] = None
    last_reviewed_by: Optional[str] = None
    content_status: Optional[str] = None
    target_audience: Optional[List[str]] = None
    engagement_metrics: Optional[Dict[str, Any]] = None
    feedback: Optional[Dict[str, Any]] = None
    assigned_to: Optional[str] = None
    review_notes: Optional[str] = None
    publication_schedule: Optional[datetime] = None
    expiration_date: Optional[datetime] = None

class Post(PostBase):
    """Schema for post response."""
    id: int
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    published_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 