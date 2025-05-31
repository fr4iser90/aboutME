from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from app.infrastructure.database.base import Base

class SiteOwnerModel(Base):
    __tablename__ = "site_owner"

    id = Column(String(255), primary_key=True, default="me")
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    source_username = Column(String(255))
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
