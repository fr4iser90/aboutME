from sqlalchemy import Column, Integer, String, Boolean, JSON
from app.infrastructure.database.base import Base

class LayoutModel(Base):
    __tablename__ = "layouts"

    id = Column(Integer, primary_key=True, index=True)
    sections_order = Column(JSON, nullable=False)
    layout_type = Column(String, nullable=False)
    show_sidebar = Column(Boolean, default=True)
    sidebar_position = Column(String, nullable=False)
    content = Column(JSON, nullable=True) 