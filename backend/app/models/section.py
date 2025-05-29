from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from app.db.session import Base


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(
        String(64), unique=True, nullable=False
    )  # e.g., 'about', 'projects', 'skills'
    title = Column(String(128), nullable=False)  # Display title
    type = Column(String(32), nullable=False)  # 'text', 'projects', 'skills', etc.
    content = Column(JSONB, nullable=True)  # The actual content
    order = Column(Integer, nullable=False, default=0)  # Order on the page
    is_visible = Column(Boolean, default=True)  # To show/hide sections
    section_metadata = Column(
        JSONB, nullable=True
    )  # Additional metadata like background image, layout variant
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
