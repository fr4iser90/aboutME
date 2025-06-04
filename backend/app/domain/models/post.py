from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from enum import Enum

class PostType(str, Enum):
    """Post type options:
    - general: General blog post
    - project: Project-related post
    - update: Project update/roadmap
    - tutorial: How-to guide
    - news: News article
    - review: Product/service review
    - interview: Interview transcript
    - case-study: Case study
    """
    GENERAL = 'general'
    PROJECT = 'project'
    UPDATE = 'update'
    TUTORIAL = 'tutorial'
    NEWS = 'news'
    REVIEW = 'review'
    INTERVIEW = 'interview'
    CASE_STUDY = 'case-study'

class Post(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    # Basic Info
    id: int | None = None
    type: PostType = PostType.GENERAL
    project_id: int | None = None
    section_id: int | None = None
    is_visible: bool = True
    is_public: bool = True
    
    # Basic Content
    slug: str
    title: str
    subtitle: str | None = None
    content_markdown: str
    excerpt: str | None = None
    
    # Media
    cover_image_url: str | None = None
    cover_image_alt: str | None = None
    gallery_urls: List[str] | None = None
    video_url: str | None = None
    video_host: str | None = None
    audio_url: str | None = None
    audio_duration: int | None = None
    audio_transcript: str | None = None
    
    # SEO & Stats
    seo_title: str | None = None
    seo_description: str | None = None
    seo_keywords: List[str] | None = None
    reading_time: int | None = None
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    
    # Organization
    author: str | None = None
    tags: List[str] | None = None
    categories: List[str] | None = None
    series: str | None = None
    related_posts: List[int] | None = None
    
    # Publishing
    published_at: datetime | None = None
    updated_at: datetime | None = None
    is_published: bool = True
    is_featured: bool = False
    is_pinned: bool = False
    
    # Internationalization
    language: str = 'en'
    translations: dict | None = None
    
    # Access Control
    is_private: bool = False
    access_level: str = 'public'
    
    # Analytics
    analytics: dict | None = None
    
    # Customization
    custom_css: str | None = None
    custom_js: str | None = None
    layout_variant: str = 'default'
    
    # Tutorial Specific
    difficulty_level: str | None = None
    estimated_completion_time: int | None = None
    prerequisites: List[str] | None = None
    learning_objectives: List[str] | None = None
    resources: dict | None = None
    
    # Content Management
    revision_history: dict | None = None
    last_reviewed_at: datetime | None = None
    last_reviewed_by: str | None = None
    content_status: str = 'draft'
    
    # Engagement
    target_audience: List[str] | None = None
    engagement_metrics: dict | None = None
    feedback: dict | None = None
    
    # Workflow
    assigned_to: str | None = None
    review_notes: str | None = None
    publication_schedule: datetime | None = None
    expiration_date: datetime | None = None 