from typing import Dict
from sqlalchemy import String, Boolean, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.infrastructure.database.base import Base
from datetime import datetime

class ThemeModel(Base):
    __tablename__ = "themes"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    style_properties: Mapped[dict] = mapped_column(JSON, nullable=False)
    custom_css: Mapped[str | None] = mapped_column(String, nullable=True)
    custom_js: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False) 