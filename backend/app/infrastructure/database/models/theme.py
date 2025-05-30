from typing import Dict
from sqlalchemy import String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.infrastructure.database.base import Base

class ThemeModel(Base):
    __tablename__ = "themes"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    colors: Mapped[Dict[str, str] | None] = mapped_column(JSON, nullable=True)
    fonts: Mapped[Dict[str, str] | None] = mapped_column(JSON, nullable=True)
    spacing: Mapped[Dict[str, int] | None] = mapped_column(JSON, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True) 