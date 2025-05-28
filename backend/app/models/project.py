from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from app.db.session import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        String(32), nullable=False, default="WIP"
    )  # WIP, Completed, Archived
    source_type = Column(
        String(32), nullable=False, default="manual"
    )  # manual, github, gitlab
    source_url = Column(String(255), nullable=True)  # GitHub/GitLab URL
    github_username = Column(String(255), nullable=True)  # For GitHub integration
    github_repo = Column(String(255), nullable=True)  # For GitHub integration
    live_url = Column(String(255), nullable=True)  # URL to live demo
    thumbnail_url = Column(String(255), nullable=True)  # Project thumbnail/image
    details = Column(JSONB, nullable=True)  # Additional project details
    order = Column(Integer, nullable=False, default=0)  # Order in projects list
    is_visible = Column(Boolean, default=True)  # To show/hide projects
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
