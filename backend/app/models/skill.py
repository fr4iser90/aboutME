from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from app.db.session import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(
        String(64), nullable=False
    )  # e.g., 'Programming', 'Languages', etc.
    description = Column(String, nullable=True)  # Description of the skill category
    items = Column(JSONB, nullable=False)  # List of skills with their levels
    order = Column(Integer, nullable=False, default=0)  # Order within categories
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
