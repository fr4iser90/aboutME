from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DateTime, ARRAY, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.infrastructure.database.base import Base

class FileModel(Base):
    __tablename__ = "files"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    path = Column(String, nullable=False)
    parent_id = Column(String, ForeignKey("files.id"), nullable=True)
    is_folder = Column(Boolean, default=False)
    size = Column(Integer, nullable=True)
    mime_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    tags = Column(ARRAY(String), default=[])
    used_in = Column(JSON, default={})

    # Relationships
    parent = relationship("FileModel", remote_side=[id], backref="children") 