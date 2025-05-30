from sqlalchemy import Column, Integer, String, Boolean, JSON
from app.infrastructure.database.base import Base

class LayoutTemplateModel(Base):
    __tablename__ = "layout_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    sections_order = Column(JSON, nullable=False)
    layout_type = Column(String, nullable=False)
    show_sidebar = Column(Boolean, default=True)
    sidebar_position = Column(String, nullable=False) 