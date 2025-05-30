from typing import Dict, Any
from sqlalchemy import String, Integer, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.infrastructure.database.base import Base

class SectionModel(Base):
    __tablename__ = "sections"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    type: Mapped[str] = mapped_column(String(50))
    content: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    theme_id: Mapped[int | None] = mapped_column(ForeignKey("themes.id"), nullable=True) 