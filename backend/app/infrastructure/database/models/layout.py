from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, Index
from sqlalchemy.sql import func
from app.infrastructure.database.base import Base

class LayoutModel(Base):
    __tablename__ = "layouts"

    id = Column(Integer, primary_key=True, index=True)
    page = Column(String(255), nullable=False, default='home')
    elements = Column(JSON, nullable=False, default=[])
    layout_config = Column(JSON, nullable=False, default={})
    is_active = Column(Boolean, default=False)
    is_visible = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Legacy fields for backward compatibility (not used in new implementation)
    name = Column(String(255), nullable=True)
    description = Column(String, nullable=True)
    grid_config_legacy = Column(JSON, nullable=True)
    layout_variant = Column(String(50), nullable=True)
    sections_order = Column(JSON, nullable=True)
    layout_type = Column(String(50), nullable=True)
    show_sidebar = Column(Boolean, nullable=True)
    sidebar_position = Column(String(50), nullable=True)
    content = Column(JSON, nullable=True)

# Index for efficient page-based queries
Index('idx_layouts_page', LayoutModel.page) 