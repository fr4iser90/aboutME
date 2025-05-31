from datetime import datetime
from typing import List
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, JSON, ARRAY
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
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="WIP")
    source_type: Mapped[str] = mapped_column(String(32), nullable=False, default="manual")
    source_url: Mapped[str] = mapped_column(String(255), nullable=True)
    source_username: Mapped[str] = mapped_column(String(255), nullable=True)
    source_repo: Mapped[str] = mapped_column(String(255), nullable=True)
    live_url: Mapped[str] = mapped_column(String(255), nullable=True)
    thumbnail_url: Mapped[str] = mapped_column(String(255), nullable=True)
    details: Mapped[dict] = mapped_column(JSON, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    stars_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    forks_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    watchers_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    language: Mapped[str] = mapped_column(String(50), nullable=True)
    topics: Mapped[List[str]] = mapped_column(ArrayOfStrings, nullable=True)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    homepage_url: Mapped[str] = mapped_column(String(255), nullable=True)
    open_issues_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    default_branch: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow) 