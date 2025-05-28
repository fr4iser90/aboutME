from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.db.session import Base


class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String, nullable=True)
    style_properties = Column(
        JSONB, nullable=False
    )  # CSS rules, color palettes, font choices
    custom_css = Column(Text, nullable=True)  # Custom CSS rules
    custom_js = Column(Text, nullable=True)  # Custom JavaScript
    is_active = Column(Boolean, default=True)  # To enable/disable themes
    is_default = Column(Boolean, default=False)  # To mark default theme
